"use client";

import { useRouter } from "next/navigation";
import { clearMockSession, getMockSession } from "@/lib/mock/session";

export default function ProtectedTopbar() {
  const router = useRouter();
  const session = getMockSession();

  function handleLogout() {
    clearMockSession();
    router.push("/login");
  }

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur">
      <div className="mx-auto flex h-[88px] max-w-7xl items-center justify-between px-6">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-400/80">
            PecuLink
          </span>
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Panel de control
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
              Perfil activo
            </p>
            <p className="text-sm font-semibold text-white">
              {session?.company ?? "Frigorífico SUL"}
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-white">
            {getRoleLabel(session?.role)}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}

function getRoleLabel(role?: string) {
  switch (role) {
    case "frigorifico":
      return "Frigorífico";
    case "productor":
      return "Productor";
    case "transportista":
      return "Transportista";
    default:
      return "Frigorífico";
  }
}