"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clearMockSession, getMockSession } from "@/lib/mock/session";

export default function ProtectedTopbar() {
  const router = useRouter();
  const session = getMockSession();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  function handleLogout() {
    clearMockSession();
    router.push("/login");
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="border-b border-white/10 bg-[rgba(5,7,10,0.68)] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-end px-6">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-white/15 hover:bg-white/[0.06]"
          >
            <div className="text-right">
              <p className="max-w-[220px] truncate text-sm font-semibold text-white">
                {session?.company ?? "PecuLink Platform"}
              </p>
            </div>

            <div
              className={[
                "text-white/45 transition-transform duration-200",
                open ? "rotate-180" : "",
              ].join(" ")}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>

          {open ? (
            <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[260px] rounded-2xl border border-white/10 bg-[#0B1015] p-2 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
              <div className="rounded-xl border border-white/6 bg-white/[0.03] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/35">
                  Empresa
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {session?.company ?? "PecuLink Platform"}
                </p>
                <p className="mt-1 text-xs text-white/45">
                  {getRoleLabel(session?.role)}
                </p>
              </div>

              <div className="my-2 h-px bg-white/6" />

              <button
                type="button"
                className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium text-white/78 transition hover:bg-white/[0.05] hover:text-white"
              >
                Perfil
              </button>

              <button
                type="button"
                className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium text-white/78 transition hover:bg-white/[0.05] hover:text-white"
              >
                Plan
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium text-red-200/90 transition hover:bg-red-400/10 hover:text-red-100"
              >
                Salir
              </button>
            </div>
          ) : null}
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