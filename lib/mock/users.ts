export type UserRole =
  | "frigorifico"
  | "productor"
  | "transportista"
  | "admin";

export type MockUser = {
  id: string;
  name: string;
  company: string;
  email: string;
  password: string;
  role: UserRole;
  description: string;
};

export const mockUsers: MockUser[] = [
  {
    id: "USR-ADM-001",
    name: "Elisa Romero",
    company: "PecuLink Platform",
    email: "admin@peculink.com",
    password: "123456",
    role: "admin",
    description:
      "Supervisa el marketplace, monitorea operaciones, usuarios y comisiones de la plataforma.",
  },
  {
    id: "USR-FRIG-001",
    name: "Carlos Mendoza",
    company: "Frigorífico SUL",
    email: "compras@frigorificosul.com",
    password: "123456",
    role: "frigorifico",
    description:
      "Publica solicitudes, negocia con productores y coordina la contratación de transporte.",
  },
  {
    id: "USR-PROD-001",
    name: "Juan Benítez",
    company: "Ganadera San Miguel",
    email: "ventas@ganaderasanmiguel.com",
    password: "123456",
    role: "productor",
    description:
      "Responde oportunidades, envía ofertas comerciales y acompaña operaciones adjudicadas.",
  },
  {
    id: "USR-TRANS-001",
    name: "Miguel Fernández",
    company: "Transporte Ruta Sur",
    email: "operaciones@rutasur.com",
    password: "123456",
    role: "transportista",
    description:
      "Visualiza cargas disponibles, presenta propuestas de transporte y gestiona viajes asignados.",
  },
];