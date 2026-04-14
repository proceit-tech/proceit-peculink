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
      setError("Credenciales no válidas. Selecciona un usuario de ejemplo o ingresa datos correctos.");
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
    <main className="min-h-screen bg-[#05070A] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,180,255,0.16),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(0,180,255,0.08),transparent_28%)]" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-6xl rounded-[32px] border border-white/10 bg-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur">
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <section className="border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:p-12">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
                    PecuLink • Marketplace ganadero B2B
                  </div>

                  <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-5xl">
                    Acceso operativo al ecosistema PecuLink
                  </h1>

                  <p className="mt-4 max-w-xl text-base leading-8 text-white/65 sm:text-lg">
                    Conecta frigoríficos, productores y transportistas en un flujo único de solicitud,
                    oferta, negociación, contratación y operación logística.
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-400/80">
                        Frigoríficos
                      </p>
                      <p className="mt-3 text-sm leading-6 text-white/65">
                        Publicación de demanda y consolidación de oferta.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-400/80">
                        Productores
                      </p>
                      <p className="mt-3 text-sm leading-6 text-white/65">
                        Respuesta estructurada a oportunidades de compra.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-400/80">
                        Transporte
                      </p>
                      <p className="mt-3 text-sm leading-6 text-white/65">
                        Asignación total o parcial de carga por operación.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-8 lg:p-12">
                <div className="mx-auto max-w-xl">
                  <p className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400/80">
                    Iniciar sesión
                  </p>

                  <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight text-white">
                    Ingreso de usuarios de demostración
                  </h2>

                  <p className="mt-3 text-center text-sm leading-7 text-white/60">
                    Selecciona un perfil de ejemplo para cargar automáticamente las credenciales y
                    visualizar una experiencia distinta según el tipo de usuario.
                  </p>

                  <div className="mt-8 space-y-4">
                    {mockUsers.map((user) => {
                      const isActive = selectedUserId === user.id;

                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleSelectUser(user)}
                          className={[
                            "w-full rounded-3xl border p-5 text-left transition-all duration-200",
                            isActive
                              ? "border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.08)]"
                              : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/7",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-base font-semibold text-white">{user.company}</p>
                              <p className="mt-1 text-sm text-cyan-300">{user.email}</p>
                              <p className="mt-2 text-sm leading-6 text-white/60">
                                {user.description}
                              </p>
                            </div>

                            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                              {getRoleLabel(user.role)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/80">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="usuario@peculink.com"
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/30"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/80">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/30"
                      />
                    </div>

                    {selectedUser ? (
                      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                          Perfil seleccionado
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {selectedUser.company} · {getRoleLabel(selectedUser.role)}
                        </p>
                      </div>
                    ) : null}

                    {error ? (
                      <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                        {error}
                      </div>
                    ) : null}

                    <button
                      onClick={handleLogin}
                      className="w-full rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400/15"
                      type="button"
                    >
                      Entrar al sistema
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function getRoleLabel(role: MockUser["role"]) {
  switch (role) {
    case "frigorifico":
      return "Frigorífico";
    case "productor":
      return "Productor";
    case "transportista":
      return "Transportista";
    default:
      return role;
  }
}