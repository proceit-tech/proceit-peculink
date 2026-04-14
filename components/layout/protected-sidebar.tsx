"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { getMockSession } from "@/lib/mock/session";
import { menuByRole } from "@/lib/mock/navigation";
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
    dot: "bg-amber-300",
    badgeClass: "border-amber-400/20 bg-amber-400/10 text-amber-100",
  },
  transportista: {
    label: "Transportista",
    dot: "bg-violet-300",
    badgeClass: "border-violet-400/20 bg-violet-400/10 text-violet-100",
  },
};

export default function ProtectedSidebar() {
  const pathname = usePathname();
  const session = getMockSession();

  const role: UserRole = session?.role ?? "frigorifico";
  const menu = useMemo(() => menuByRole[role] ?? [], [role]);
  const theme = ROLE_THEME[role] ?? ROLE_THEME.frigorifico;

  return (
    <aside className="w-[268px] shrink-0 border-r border-white/10 bg-[linear-gradient(180deg,#0A0E13_0%,#070A0F_100%)]">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-[31px] font-semibold leading-none tracking-[-0.055em] text-white">
                PecuLink
              </span>
              <p className="mt-2 text-xs leading-5 text-white/42">
                Plataforma operativa para compra, oferta y coordinación logística del marketplace.
              </p>
            </div>

            <div
              className={[
                "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]",
                theme.badgeClass,
              ].join(" ")}
            >
              <span className={["h-2 w-2 rounded-full", theme.dot].join(" ")} />
              {theme.label}
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-5">
          <div className="mb-4 px-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/28">
              Navegación
            </p>
          </div>

          <nav className="space-y-1.5">
            {menu.map((section) => (
  <div key={section.title} className="mb-6">
    <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/28">
      {section.title}
    </p>

    <div className="space-y-1.5">
      {section.items.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "group relative flex items-center rounded-2xl px-4 py-3 text-[14px] font-medium transition-all duration-200",
              active
                ? "bg-white/[0.06] text-white ring-1 ring-white/8"
                : "text-white/48 hover:bg-white/[0.035] hover:text-white",
            ].join(" ")}
          >
            <span
              className={[
                "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full",
                active ? "bg-cyan-400" : "bg-transparent",
              ].join(" ")}
            />

            {item.label}
          </Link>
        );
      })}
    </div>
  </div>
))}
          </nav>
        </div>
      </div>
    </aside>
  );
}