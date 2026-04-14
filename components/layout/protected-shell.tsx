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
        <ProtectedTopbar />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}