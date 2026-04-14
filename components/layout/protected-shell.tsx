"use client";

import type { ReactNode } from "react";
import ProtectedSidebar from "./protected-sidebar";
import ProtectedTopbar from "./protected-topbar";

type Props = {
  children: ReactNode;
};

export default function ProtectedShell({ children }: Props) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#05070A] text-white">
      <ProtectedSidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="relative z-40 shrink-0">
          <ProtectedTopbar />
        </div>

        <main className="relative z-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-7 py-7">{children}</div>
        </main>
      </div>
    </div>
  );
}