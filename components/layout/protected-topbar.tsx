"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clearMockSession, getMockSession } from "@/lib/mock/session";
import type { UserRole } from "@/lib/mock/users";

type RoleTheme = {
  label: string;
  dot: string;
  badgeClass: string;
};

const ROLE_THEME: Record<UserRole, RoleTheme> = {
  admin: {
    label: "Administrador",
    dot: "bg-cyan-300",
    badgeClass: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
  },
  frigorifico: {
    label: "Frigorífico",
    dot: "bg-emerald-300",
    badgeClass: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  },
  productor: {
    label: "Productor",
    dot: "bg-amber-400",
    badgeClass: "border-amber-400/20 bg-amber-400/10 text-amber-100",
  },
  transportista: {
    label: "Transportista",
    dot: "bg-violet-300",
    badgeClass: "border-violet-400/20 bg-violet-400/10 text-violet-100",
  },
};

export default function ProtectedTopbar() {
  const router = useRouter();
  const session = getMockSession();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const role: UserRole = session?.role ?? "admin";
  const theme = ROLE_THEME[role] ?? ROLE_THEME.admin;

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
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden sm:flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/28">
              Contexto activo
            </span>
            <span className="mt-1 text-sm text-white/55">
              {session?.company ?? "PecuLink Platform"}
            </span>
          </div>

          <span
            className={[
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]",
              theme.badgeClass,
            ].join(" ")}
          >
            <span className={["h-2 w-2 rounded-full", theme.dot].join(" ")} />
            {theme.label}
          </span>
        </div>

        <div className="relative z-50" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition hover:border-white/15 hover:bg-white/[0.06]"
          >
            <div className="min-w-0 text-right">
              <span className="block max-w-[220px] truncate text-sm font-semibold text-white">
                {session?.company ?? "PecuLink Platform"}
              </span>
              <span className="mt-0.5 block text-[11px] text-white/40">
                {theme.label}
              </span>
            </div>

            <svg
              className={[
                "h-4 w-4 shrink-0 text-white/40 transition-transform duration-200",
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
            <div className="absolute right-0 top-[calc(100%+10px)] z-[100] w-[244px] overflow-hidden rounded-2xl border border-white/10 bg-[#0B1015] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
              <div className="border-b border-white/8 px-4 py-4">
                <p className="truncate text-sm font-semibold text-white">
                  {session?.company ?? "PecuLink Platform"}
                </p>

                <div
                  className={[
                    "mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                    theme.badgeClass,
                  ].join(" ")}
                >
                  <span className={["h-2 w-2 rounded-full", theme.dot].join(" ")} />
                  {theme.label}
                </div>
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