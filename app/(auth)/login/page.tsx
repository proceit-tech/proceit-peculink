"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { mockUsers, type MockUser } from "@/lib/mock/users";
import { setMockSession } from "@/lib/mock/session";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const selectedUser = useMemo(
    () => mockUsers.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId]
  );

  function handleSelectUser(user: MockUser) {
    setSelectedUserId(user.id);
    setEmail(user.email);
    setPassword(user.password);
    setError("");
  }

  function handleLogin() {
    const user = mockUsers.find(
      (item) => item.email === email.trim() && item.password === password.trim()
    );

    if (!user) {
      setError("Credenciales no válidas.");
      return;
    }

    setMockSession({
      name: user.name,
      company: user.company,
      email: user.email,
      role: user.role,
    });

    router.push("/dashboard");
  }

  return (
    <main className="h-screen overflow-hidden bg-[#05070A] text-white">

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,180,255,0.12),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(0,180,255,0.06),transparent_30%)]" />

      <div className="relative mx-auto flex h-full max-w-7xl items-center justify-center px-4">

        <div className="w-full max-w-5xl rounded-[28px] border border-white/10 bg-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur overflow-hidden">
          
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          <div className="grid h-[560px] grid-cols-[1fr_1fr]">

            {/* LEFT */}
            <section className="flex flex-col justify-center border-r border-white/10 px-10">

              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-400/80">
                  PECULINK
                </p>

                <h1 className="mt-4 text-3xl font-semibold leading-tight">
                  Marketplace ganadero B2B
                </h1>

                <p className="mt-4 text-sm text-white/60 leading-6 max-w-md">
                  Demanda, oferta y transporte integrados en una sola operación.
                </p>

                <div className="mt-8 space-y-3 text-sm text-white/60">
                  <p>• Frigoríficos publican demanda</p>
                  <p>• Productores responden con oferta</p>
                  <p>• Transporte se asigna por operación</p>
                </div>
              </div>

            </section>

            {/* RIGHT */}
            <section className="flex flex-col justify-center px-10">

              <div className="max-w-md w-full mx-auto">

                <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-400/80 text-center">
                  ACCESO
                </p>

                <h2 className="text-2xl font-semibold text-center mt-2">
                  Acceso al sistema
                </h2>

                {/* USERS */}
                <div className="mt-6 space-y-2">

                  {mockUsers.map((user) => {
                    const active = selectedUserId === user.id;

                    return (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={`w-full rounded-xl border px-3 py-2 text-left transition
                        ${active
                          ? "border-cyan-400/30 bg-cyan-400/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {user.company}
                            </p>
                            <p className="text-[11px] text-white/50">
                              {user.email}
                            </p>
                          </div>

                          <span className="text-[10px] uppercase text-cyan-400">
                            {getRoleLabel(user.role)}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                </div>

                {/* FORM */}
                <div className="mt-6 space-y-3">

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo electrónico"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:border-cyan-400/30"
                  />

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:border-cyan-400/30"
                  />

                  {error && (
                    <div className="text-xs text-red-400">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleLogin}
                    className="w-full rounded-xl bg-cyan-500/10 border border-cyan-400/20 py-2 text-sm font-semibold hover:bg-cyan-500/20 transition"
                  >
                    Entrar
                  </button>

                </div>

              </div>

            </section>

          </div>

        </div>

      </div>

    </main>
  );
}

function getRoleLabel(role: MockUser["role"]) {
  switch (role) {
    case "admin":
      return "Admin";
    case "frigorifico":
      return "Frigorífico";
    case "productor":
      return "Productor";
    case "transportista":
      return "Transporte";
    default:
      return role;
  }
}