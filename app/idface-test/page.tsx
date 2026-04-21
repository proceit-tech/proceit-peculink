"use client";

import { useMemo, useState } from "react";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("No se pudo leer la imagen."));
        return;
      }

      const [, base64] = result.split(",");
      resolve(base64 || "");
    };

    reader.onerror = () => reject(new Error("Error leyendo el archivo."));
    reader.readAsDataURL(file);
  });
}

export default function IdFaceTestPage() {
  const [name, setName] = useState("");
  const [registration, setRegistration] = useState("");
  const [status, setStatus] = useState<"paid" | "unpaid">("paid");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  async function handleSubmit() {
    if (!name.trim()) {
      alert("Nombre obligatorio");
      return;
    }

    if (!registration.trim()) {
      alert("Matrícula obligatoria");
      return;
    }

    if (!file) {
      alert("Foto obligatoria");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const photoBase64 = await fileToBase64(file);

      const response = await fetch("/api/idface-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          registration,
          status,
          photoBase64
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: String(error)
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0b1020", color: "white", padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Teste iDFace</h1>
        <p style={{ opacity: 0.7, marginBottom: 24 }}>
          Cadastro completo: criar usuário, enviar foto e colocar no grupo correto.
        </p>

        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ background: "#121a33", padding: 20, borderRadius: 16 }}>
            <label>Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", marginTop: 6, marginBottom: 16, padding: 12 }}
            />

            <label>Matrícula</label>
            <input
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
              style={{ width: "100%", marginTop: 6, marginBottom: 16, padding: 12 }}
            />

            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "paid" | "unpaid")}
              style={{ width: "100%", marginTop: 6, marginBottom: 16, padding: 12 }}
            >
              <option value="paid">Pagó</option>
              <option value="unpaid">No pagó</option>
            </select>

            <label>Foto</label>
            <input
              type="file"
              accept="image/*"
              capture="user"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ width: "100%", marginTop: 6, marginBottom: 16 }}
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 12,
                background: "#2563eb",
                color: "white",
                border: "none",
                cursor: "pointer"
              }}
            >
              {loading ? "Procesando..." : "Cadastrar no iDFace"}
            </button>
          </div>

          <div style={{ background: "#121a33", padding: 20, borderRadius: 16 }}>
            <h3 style={{ marginTop: 0 }}>Preview</h3>

            {previewUrl ? (
              <img
                src={previewUrl}
                alt="preview"
                style={{ width: "100%", borderRadius: 12, objectFit: "cover", maxHeight: 320 }}
              />
            ) : (
              <div style={{ opacity: 0.5 }}>Sem foto selecionada</div>
            )}

            <h3 style={{ marginTop: 24 }}>Resultado</h3>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, opacity: 0.95 }}>
              {result ? JSON.stringify(result, null, 2) : "Aguardando execução..."}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}