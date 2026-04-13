"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  function handleLogin() {
    // mock login
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#05070A] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">

          <div className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400/80">
              PecuLink
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Iniciar sesión
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Acceso al marketplace para frigoríficos, productores y transportistas.
            </p>
          </div>

          <div className="space-y-4">

            <input
              type="email"
              placeholder="usuario@peculink.com"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
            />

            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
            />

            <button
              onClick={handleLogin}
              className="w-full rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400/15"
            >
              Entrar al sistema
            </button>

          </div>
        </div>
      </div>
    </main>
  );
}