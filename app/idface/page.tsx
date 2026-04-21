"use client";

import { useMemo, useState } from "react";

type AccessItem = {
  sequence: number;
  movement: "ENTRADA" | "SAIDA";
  time: number;
  portal_id: number | null;
  event: number | null;
  confidence: number | null;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const value = reader.result;
      if (typeof value !== "string") {
        reject(new Error("No se pudo leer la imagen."));
        return;
      }

      const [, base64] = value.split(",");
      resolve(base64 || "");
    };

    reader.onerror = () => reject(new Error("Error leyendo el archivo."));
    reader.readAsDataURL(file);
  });
}

function formatUnixTime(unix: number) {
  if (!unix) return "-";
  return new Date(unix * 1000).toLocaleString("es-PY");
}

export default function IdFaceTestPage() {
  const [name, setName] = useState("");
  const [registration, setRegistration] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [blockedGroupId, setBlockedGroupId] = useState<number | null>(null);

  const [userId, setUserId] = useState<number | null>(null);
  const [currentGroupName, setCurrentGroupName] = useState<string>("-");
  const [mensalidade, setMensalidade] = useState<"PAGA" | "BLOQUEADA">("PAGA");

  const [history, setHistory] = useState<AccessItem[]>([]);
  const [lastMovement, setLastMovement] = useState<string>("-");
  const [totalReads, setTotalReads] = useState(0);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  async function callApi(action: string, payload?: any) {
    const response = await fetch("/api/idface", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, payload }),
    });

    return response.json();
  }

  async function handleCreateActiveGroup() {
    setLoading(true);
    try {
      const data = await callApi("createActiveGroup", {
        groupName: "ALUNOS_ATIVOS",
      });

      setResult(data);

      if (data.success) {
        setActiveGroupId(data.groupId);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBlockedGroup() {
    setLoading(true);
    try {
      const data = await callApi("createBlockedGroup", {
        groupName: "ALUNOS_BLOQUEADOS",
      });

      setResult(data);

      if (data.success) {
        setBlockedGroupId(data.groupId);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser() {
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

    if (!activeGroupId) {
      alert("Crie o grupo ativo primeiro");
      return;
    }

    setLoading(true);
    try {
      const photoBase64 = await fileToBase64(file);

      const data = await callApi("createUser", {
        name,
        registration,
        photoBase64,
        activeGroupId,
      });

      setResult(data);

      if (data.success) {
        setUserId(data.userId);
        setCurrentGroupName("ATIVOS");
        setMensalidade("PAGA");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleMoveToBlocked() {
    if (!userId) {
      alert("Crie o usuário primeiro");
      return;
    }

    if (!blockedGroupId) {
      alert("Crie o grupo bloqueado primeiro");
      return;
    }

    setLoading(true);
    try {
      const data = await callApi("moveToBlocked", {
        userId,
        targetGroupId: blockedGroupId,
        targetGroupName: "BLOQUEADOS",
      });

      setResult(data);

      if (data.success) {
        setCurrentGroupName("BLOQUEADOS");
        setMensalidade("BLOQUEADA");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleMoveToActive() {
    if (!userId) {
      alert("Crie o usuário primeiro");
      return;
    }

    if (!activeGroupId) {
      alert("Crie o grupo ativo primeiro");
      return;
    }

    setLoading(true);
    try {
      const data = await callApi("moveToActive", {
        userId,
        targetGroupId: activeGroupId,
        targetGroupName: "ATIVOS",
      });

      setResult(data);

      if (data.success) {
        setCurrentGroupName("ATIVOS");
        setMensalidade("PAGA");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleReadAccess() {
    if (!userId) {
      alert("Crie o usuário primeiro");
      return;
    }

    setLoading(true);
    try {
      const data = await callApi("readAccess", { userId });
      setResult(data);

      if (data.success) {
        setHistory(data.history || []);
        setTotalReads(data.totalReads || 0);
        setLastMovement(data.lastMovement?.movement || "-");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#030b22",
        color: "white",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <h1 style={{ fontSize: 46, marginBottom: 10 }}>Teste iDFace</h1>
        <p style={{ opacity: 0.75, marginBottom: 24, fontSize: 18 }}>
          Simulação completa: grupos, cadastro, bloqueio de mensalidade e leitura
          de entrada/saída por paridade.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1.1fr 1.2fr",
            gap: 20,
          }}
        >
          <section
            style={{
              background: "#101b46",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Cadastro</h2>

            <div style={{ marginBottom: 16 }}>
              <label>Nombre</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: 12, marginTop: 8 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Matrícula</label>
              <input
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                style={{ width: "100%", padding: 12, marginTop: 8 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Foto</label>
              <input
                type="file"
                accept="image/*"
                capture="user"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{ width: "100%", marginTop: 8 }}
              />
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <button onClick={handleCreateActiveGroup} disabled={loading} style={buttonStyle("#2563eb")}>
                Criar grupo ativo
              </button>

              <button onClick={handleCreateBlockedGroup} disabled={loading} style={buttonStyle("#7c3aed")}>
                Criar grupo bloqueado
              </button>

              <button onClick={handleCreateUser} disabled={loading} style={buttonStyle("#16a34a")}>
                Criar usuário
              </button>
            </div>

            <div style={{ marginTop: 20, fontSize: 14, opacity: 0.85 }}>
              <div>Grupo ativo ID: {activeGroupId ?? "-"}</div>
              <div>Grupo bloqueado ID: {blockedGroupId ?? "-"}</div>
            </div>
          </section>

          <section
            style={{
              background: "#101b46",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Operação</h2>

            <div style={{ marginBottom: 16 }}>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="preview"
                  style={{
                    width: "100%",
                    height: 380,
                    objectFit: "cover",
                    borderRadius: 20,
                  }}
                />
              ) : (
                <div
                  style={{
                    height: 380,
                    borderRadius: 20,
                    background: "#0b1435",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0.65,
                  }}
                >
                  Sem foto
                </div>
              )}
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <button onClick={handleMoveToBlocked} disabled={loading} style={buttonStyle("#dc2626")}>
                Simular não pago
              </button>

              <button onClick={handleMoveToActive} disabled={loading} style={buttonStyle("#16a34a")}>
                Simular pago
              </button>

              <button onClick={handleReadAccess} disabled={loading} style={buttonStyle("#0ea5e9")}>
                Atualizar acessos
              </button>
            </div>

            <div style={{ marginTop: 20, fontSize: 15, lineHeight: 1.8 }}>
              <div><strong>User ID:</strong> {userId ?? "-"}</div>
              <div><strong>Grupo atual:</strong> {currentGroupName}</div>
              <div><strong>Mensalidade:</strong> {mensalidade}</div>
              <div><strong>Último movimento:</strong> {lastMovement}</div>
              <div><strong>Total leituras:</strong> {totalReads}</div>
            </div>
          </section>

          <section
            style={{
              background: "#101b46",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Monitor</h2>

            <div
              style={{
                background: "#0b1435",
                borderRadius: 16,
                padding: 16,
                minHeight: 180,
                marginBottom: 16,
                overflow: "auto",
              }}
            >
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 12 }}>
                {result ? JSON.stringify(result, null, 2) : "Aguardando ação..."}
              </pre>
            </div>

            <div
              style={{
                background: "#0b1435",
                borderRadius: 16,
                padding: 16,
                minHeight: 320,
                overflow: "auto",
              }}
            >
              <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th align="left">#</th>
                    <th align="left">Mov.</th>
                    <th align="left">Data/Hora</th>
                    <th align="left">Portal</th>
                    <th align="left">Evento</th>
                    <th align="left">Conf.</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ paddingTop: 12, opacity: 0.6 }}>
                        Sem leituras ainda
                      </td>
                    </tr>
                  ) : (
                    history.map((item) => (
                      <tr key={`${item.sequence}-${item.time}`}>
                        <td style={{ paddingTop: 10 }}>{item.sequence}</td>
                        <td style={{ paddingTop: 10 }}>{item.movement}</td>
                        <td style={{ paddingTop: 10 }}>{formatUnixTime(item.time)}</td>
                        <td style={{ paddingTop: 10 }}>{item.portal_id ?? "-"}</td>
                        <td style={{ paddingTop: 10 }}>{item.event ?? "-"}</td>
                        <td style={{ paddingTop: 10 }}>{item.confidence ?? "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function buttonStyle(background: string): React.CSSProperties {
  return {
    width: "100%",
    padding: 14,
    borderRadius: 14,
    border: "none",
    background,
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 16,
  };
}