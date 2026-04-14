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
    <aside className="w-[244px] shrink-0 border-r border-white/10 bg-[linear-gradient(180deg,#0a0e13_0%,#070a0f_100%)]">
      <div className="flex h-full flex-col">
        <div className="px-6 pb-5 pt-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.36em] text-cyan-400/85">
            Marketplace ganadero
          </p>

          <h1 className="mt-3 text-[28px] font-semibold leading-none tracking-[-0.05em] text-white">
            PecuLink
          </h1>
        </div>

        <div className="border-t border-white/6 px-4 pt-5">
          <nav className="space-y-2">
            {menu.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "group relative flex items-center rounded-xl px-4 py-3 text-[14px] font-medium transition-all duration-200",
                    active
                      ? "border border-white/8 bg-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full transition-all duration-200",
                      active
                        ? "bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.45)]"
                        : "bg-transparent group-hover:bg-white/20",
                    ].join(" ")}
                  />

                  <span
                    className={[
                      "transition-all duration-200",
                      active ? "translate-x-1" : "group-hover:translate-x-0.5",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}