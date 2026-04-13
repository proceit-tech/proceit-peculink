"use client";

import { ReactNode } from "react";
import ProtectedSidebar from "./protected-sidebar";
import ProtectedTopbar from "./protected-topbar";

type Props = {
  children: ReactNode;
};

export default function ProtectedShell({ children }: Props) {
  return (
    <div className="flex h-screen w-full bg-[#05070A] text-white">
      
      {/* Sidebar */}
      <ProtectedSidebar />

      {/* Main Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        
        {/* Topbar */}
        <ProtectedTopbar />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}