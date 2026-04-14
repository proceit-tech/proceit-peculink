import type { UserRole } from "@/lib/mock/users";

export type MenuItem = {
  label: string;
  href: string;
};

export const menuByRole: Record<UserRole, MenuItem[]> = {
  admin: [
    { label: "Panel general", href: "/dashboard" },
    { label: "Solicitudes", href: "/requests" },
    { label: "Ofertas", href: "/offers" },
    { label: "Transporte", href: "/freight" },
    { label: "Operaciones", href: "/operations" },
    { label: "Usuarios", href: "/users" },
    { label: "Comisiones", href: "/commissions" },
  ],
  frigorifico: [
    { label: "Panel", href: "/dashboard" },
    { label: "Mis solicitudes", href: "/requests" },
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