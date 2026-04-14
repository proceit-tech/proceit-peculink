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
    <header className="border-b border-white/10 bg-[rgba(5,7,10,0.72)] backdrop-blur">
      <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-6">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-400/80">
            Panel
          </p>
          <h1 className="mt-1 truncate text-[15px] font-semibold tracking-tight text-white">
            Control operativo
          </h1>
        </div>

        <div className="flex items-center">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="hidden min-w-0 md:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
                Empresa
              </p>
              <p className="mt-0.5 max-w-[180px] truncate text-sm font-medium text-white/85">
                {session?.company ?? "PecuLink Platform"}
              </p>
            </div>

            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[12px] font-semibold text-white">
              {getRoleLabel(session?.role)}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function getRoleLabel(role?: string) {
  switch (role) {
    case "admin":
      return "Administrador";
    case "frigorifico":
      return "Frigorífico";
    case "productor":
      return "Productor";
    case "transportista":
      return "Transportista";
    default:
      return "Administrador";
  }
}