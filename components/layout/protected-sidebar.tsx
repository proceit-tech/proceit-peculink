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
    <aside className="w-[248px] shrink-0 border-r border-white/10 bg-[linear-gradient(180deg,#0A0E13_0%,#070A0F_100%)]">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/8 px-6 pb-6 pt-7">
          <div className="flex items-center">
            <span className="text-[31px] font-semibold leading-none tracking-[-0.055em] text-white">
              PecuLink
            </span>
          </div>
        </div>

        <div className="flex-1 px-4 py-5">
          <nav className="space-y-1.5">
            {menu.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "group relative flex items-center rounded-2xl px-4 py-3 text-[14px] font-medium transition-all duration-200",
                    active
                      ? "bg-white/[0.06] text-white ring-1 ring-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                      : "text-white/48 hover:bg-white/[0.035] hover:text-white",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full transition-all duration-200",
                      active
                        ? "bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.42)]"
                        : "bg-transparent group-hover:bg-white/15",
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