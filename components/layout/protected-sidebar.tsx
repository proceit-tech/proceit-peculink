"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { getMockSession } from "@/lib/mock/session";
import { menuByRole } from "@/lib/mock/navigation";
import type { UserRole } from "@/lib/mock/users";

export default function ProtectedSidebar() {
  const pathname = usePathname();
  const session = getMockSession();

  const role: UserRole = session?.role ?? "frigorifico";
  const menu = useMemo(() => menuByRole[role], [role]);

  return (
    <aside className="w-[248px] shrink-0 border-r border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] backdrop-blur">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-400/80">
              Marketplace ganadero
            </span>

            <div className="mt-2 flex items-end gap-2">
              <span className="text-[18px] font-semibold leading-none tracking-[-0.03em] text-white">
                PecuLink
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {menu.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "group relative flex items-center rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-200",
                    active
                      ? "bg-cyan-400/10 text-white"
                      : "text-white/62 hover:bg-white/5 hover:text-white",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full transition-all duration-200",
                      active ? "bg-cyan-400 opacity-100" : "bg-transparent opacity-0 group-hover:opacity-60",
                    ].join(" ")}
                  />

                  <span className="pl-2">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 px-5 py-4">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/35">
              Sesión
            </p>
            <p className="truncate text-sm font-medium text-white/78">
              {session?.company ?? "PecuLink Platform"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}