export type UserRole = "frigorifico" | "productor" | "transportista";

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
    id: "USR-FRIG-001",
    name: "Carlos Mendoza",
    company: "Frigorífico SUL",
    email: "compras@frigorificosul.com",
    password: "123456",
    role: "frigorifico",
    description: "Publica solicitudes, negocia con productores y coordina transporte.",
  },
  {
    id: "USR-PROD-001",
    name: "Juan Benítez",
    company: "Ganadera San Miguel",
    email: "ventas@ganaderasanmiguel.com",
    password: "123456",
    role: "productor",
    description: "Responde solicitudes, envía ofertas y cierra acuerdos comerciales.",
  },
  {
    id: "USR-TRANS-001",
    name: "Miguel Fernández",
    company: "Transporte Ruta Sur",
    email: "operaciones@rutasur.com",
    password: "123456",
    role: "transportista",
    description: "Visualiza cargas disponibles y presenta propuestas de transporte.",
  },
];