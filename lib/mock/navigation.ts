import type { UserRole } from "@/lib/mock/users";

export type MenuItem = {
  label: string;
  href: string;
  icon?: string;
};

export type MenuSection = {
  title: string;
  items: MenuItem[];
};

export const menuByRole: Record<UserRole, MenuSection[]> = {
  admin: [
    {
      title: "Visión general",
      items: [
        { label: "Panel general", href: "/dashboard" },
      ],
    },
    {
      title: "Marketplace",
      items: [
        { label: "Solicitudes", href: "/requests" },
        { label: "Ofertas", href: "/offers" },
        { label: "Transporte", href: "/freight" },
        { label: "Operaciones", href: "/operations" },
      ],
    },
    {
      title: "Gestión",
      items: [
        { label: "Usuarios", href: "/users" },
        { label: "Comisiones", href: "/commissions" },
      ],
    },
  ],

  frigorifico: [
    {
      title: "Operación",
      items: [
        { label: "Panel", href: "/dashboard" },
        { label: "Mis solicitudes", href: "/requests" },
        { label: "Ofertas recibidas", href: "/offers" },
      ],
    },
    {
      title: "Logística",
      items: [
        { label: "Transporte", href: "/freight" },
        { label: "Operaciones", href: "/operations" },
      ],
    },
  ],

  productor: [
    {
      title: "Ventas",
      items: [
        { label: "Panel", href: "/dashboard" },
        { label: "Oportunidades", href: "/requests" },
        { label: "Mis ofertas", href: "/offers" },
      ],
    },
    {
      title: "Seguimiento",
      items: [
        { label: "Operaciones", href: "/operations" },
      ],
    },
  ],

  transportista: [
    {
      title: "Logística",
      items: [
        { label: "Panel", href: "/dashboard" },
        { label: "Cargas disponibles", href: "/freight" },
        { label: "Mis propuestas", href: "/offers" },
      ],
    },
    {
      title: "Ejecución",
      items: [
        { label: "Operaciones", href: "/operations" },
      ],
    },
  ],
};