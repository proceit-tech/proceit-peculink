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
    <aside className="w-[236px] shrink-0 border-r border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] backdrop-blur">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-400/80">
            Marketplace ganadero
          </p>

          <h1 className="mt-2 text-[17px] font-semibold tracking-[-0.03em] text-white">
            PecuLink
          </h1>
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
                    "group relative flex items-center rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-200",
                    active
                      ? "bg-cyan-400/10 text-white"
                      : "text-white/62 hover:bg-white/5 hover:text-white",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full transition-all duration-200",
                      active
                        ? "bg-cyan-400 opacity-100"
                        : "bg-transparent opacity-0 group-hover:opacity-60",
                    ].join(" ")}
                  />

                  <span className="pl-2">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}