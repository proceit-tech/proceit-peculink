import type { ReactNode } from "react";
import ProtectedShell from "@/components/layout/protected-shell";

type Props = {
  children: ReactNode;
};

export default function ProtectedLayout({ children }: Props) {
  return <ProtectedShell>{children}</ProtectedShell>;
}