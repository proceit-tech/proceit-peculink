"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { getMockSession } from "@/lib/mock/session";
import type { UserRole } from "@/lib/mock/users";

type MenuItem = {
  label: string;
  href: string;
};

const menuByRole: Record<UserRole, MenuItem[]> = {
  frigorifico: [
    { label: "Panel", href: "/dashboard" },
    { label: "Solicitudes", href: "/requests" },
    { label: "Ofertas recibidas", href: "/offers" },
    { label: "Transporte", href: "/freight" },
    { label: "Operaciones", href: "/operations" },
  ],
  productor: [
    { label: "Panel", href: "/dashboard" },
    { label: "Oportunidades", href: "/requests" },
    { label: "Mis ofertas", href: "/offers" },
    { label: "Operaciones", href: "/operations" },
  ],
  transportista: [
    { label: "Panel", href: "/dashboard" },
    { label: "Cargas disponibles", href: "/freight" },
    { label: "Mis propuestas", href: "/offers" },
    { label: "Operaciones", href: "/operations" },
  ],
};

export default function ProtectedSidebar() {
  const pathname = usePathname();
  const session = getMockSession();

  const role: UserRole = session?.role ?? "frigorifico";

  const menu = useMemo(() => menuByRole[role], [role]);

  return (
    <aside className="w-[290px] border-r border-white/10 bg-white/5 backdrop-blur">
      <div className="flex h-full flex-col">
        <div className="flex h-[88px] items-center border-b border-white/10 px-6">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400/80">
              Marketplace ganadero
            </span>
            <span className="mt-1 text-[34px] font-semibold leading-none tracking-tight text-white">
              PecuLink
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {menu.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  active
                    ? "border border-cyan-400/20 bg-cyan-400/10 text-white shadow-[0_0_30px_rgba(34,211,238,0.08)]"
                    : "text-white/65 hover:bg-white/5 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
              Estado de la plataforma
            </p>
            <p className="mt-2 text-sm font-semibold text-white">MVP Mock activo</p>
            <p className="mt-1 text-sm leading-6 text-white/55">
              Flujo comercial, negociación y transporte con datos simulados para presentación.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}