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
    <header className="relative border-b border-white/10 bg-[rgba(5,7,10,0.78)] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-end px-7">
        <div className="relative z-50" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition hover:border-white/15 hover:bg-white/[0.06]"
          >
            <span className="max-w-[220px] truncate text-sm font-semibold text-white">
              {session?.company ?? "PecuLink Platform"}
            </span>

            <svg
              className={[
                "h-4 w-4 text-white/40 transition-transform duration-200",
                open ? "rotate-180" : "",
              ].join(" ")}
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
          </button>

          {open ? (
            <div className="absolute right-0 top-[calc(100%+10px)] z-[100] w-[224px] overflow-hidden rounded-2xl border border-white/10 bg-[#0B1015] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
              <div className="border-b border-white/8 px-4 py-3">
                <p className="truncate text-sm font-semibold text-white">
                  {session?.company ?? "PecuLink Platform"}
                </p>
                <p className="mt-1 text-xs text-white/45">
                  {getRoleLabel(session?.role)}
                </p>
              </div>

              <button
                type="button"
                className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-white/72 transition hover:bg-white/[0.05] hover:text-white"
              >
                Perfil
              </button>

              <button
                type="button"
                className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-white/72 transition hover:bg-white/[0.05] hover:text-white"
              >
                Plan
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-red-200/90 transition hover:bg-red-400/10 hover:text-red-100"
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