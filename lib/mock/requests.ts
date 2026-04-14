export type RequestStatus =
  | "open"
  | "receiving_offers"
  | "negotiating"
  | "partially_covered"
  | "covered"
  | "pending_transport"
  | "in_operation"
  | "closed"
  | "cancelled";

export type LivestockType = "bovino" | "porcino" | "avicola";

export type RequestPriority = "critical" | "high" | "medium" | "normal";

export type RequestRecord = {
  id: string;
  frigorifico: string;
  frigorificoEmail: string;
  frigorificoSlug: string;

  type: LivestockType;
  quantity: number;
  unit: "cabezas" | "kg";
  priceTarget?: number;

  status: RequestStatus;
  priority: RequestPriority;

  origin: string;
  destination: string;
  createdAt: string;
  neededBy: string;

  coveredQuantity: number;
  offersCount: number;
  assignedTransportCount: number;

  visibleToTransportistas: boolean;
  transportRequired: boolean;

  notes?: string;
};

export const requests: RequestRecord[] = [
  {
    id: "REQ-001",
    frigorifico: "Frigorífico Sur",
    frigorificoEmail: "compras@frigorificosur.com",
    frigorificoSlug: "frigorifico-sur",
    type: "bovino",
    quantity: 50000,
    unit: "cabezas",
    priceTarget: 30000,
    status: "receiving_offers",
    priority: "critical",
    origin: "Asunción",
    destination: "São Paulo",
    createdAt: "2026-04-13",
    neededBy: "2026-04-18",
    coveredQuantity: 18000,
    offersCount: 9,
    assignedTransportCount: 1,
    visibleToTransportistas: true,
    transportRequired: true,
    notes: "Demanda estratégica para faena de alto volumen.",
  },
  {
    id: "REQ-002",
    frigorifico: "Frigorífico Norte",
    frigorificoEmail: "operaciones@frigonorte.com",
    frigorificoSlug: "frigorifico-norte",
    type: "porcino",
    quantity: 20000,
    unit: "cabezas",
    priceTarget: 18000,
    status: "negotiating",
    priority: "high",
    origin: "Encarnación",
    destination: "Curitiba",
    createdAt: "2026-04-12",
    neededBy: "2026-04-17",
    coveredQuantity: 12000,
    offersCount: 6,
    assignedTransportCount: 0,
    visibleToTransportistas: true,
    transportRequired: true,
    notes: "Hay dos productores preseleccionados en fase final.",
  },
  {
    id: "REQ-003",
    frigorifico: "Frigorífico del Este",
    frigorificoEmail: "supply@frigodeleste.com",
    frigorificoSlug: "frigorifico-del-este",
    type: "avicola",
    quantity: 5000,
    unit: "cabezas",
    priceTarget: 9500,
    status: "covered",
    priority: "medium",
    origin: "Ciudad del Este",
    destination: "Asunción",
    createdAt: "2026-04-11",
    neededBy: "2026-04-15",
    coveredQuantity: 5000,
    offersCount: 4,
    assignedTransportCount: 2,
    visibleToTransportistas: true,
    transportRequired: true,
    notes: "Cobertura comercial completa; resta coordinación final de ejecución.",
  },
  {
    id: "REQ-004",
    frigorifico: "Frigorífico Central",
    frigorificoEmail: "abastecimiento@frigocentral.com",
    frigorificoSlug: "frigorifico-central",
    type: "bovino",
    quantity: 32000,
    unit: "cabezas",
    priceTarget: 28700,
    status: "partially_covered",
    priority: "high",
    origin: "Concepción",
    destination: "Asunción",
    createdAt: "2026-04-14",
    neededBy: "2026-04-19",
    coveredQuantity: 14600,
    offersCount: 8,
    assignedTransportCount: 0,
    visibleToTransportistas: true,
    transportRequired: true,
    notes: "Solicitud con buena tracción, pero todavía con gap material.",
  },
  {
    id: "REQ-005",
    frigorifico: "Frigorífico Capital",
    frigorificoEmail: "compras@frigocapital.com",
    frigorificoSlug: "frigorifico-capital",
    type: "porcino",
    quantity: 14500,
    unit: "cabezas",
    priceTarget: 17600,
    status: "pending_transport",
    priority: "medium",
    origin: "Villarrica",
    destination: "Asunción",
    createdAt: "2026-04-10",
    neededBy: "2026-04-16",
    coveredQuantity: 14500,
    offersCount: 5,
    assignedTransportCount: 1,
    visibleToTransportistas: true,
    transportRequired: true,
    notes: "Cerrada comercialmente; pendiente consolidar toda la capacidad logística.",
  },
  {
    id: "REQ-006",
    frigorifico: "Frigorífico Sur",
    frigorificoEmail: "compras@frigorificosur.com",
    frigorificoSlug: "frigorifico-sur",
    type: "avicola",
    quantity: 7800,
    unit: "cabezas",
    priceTarget: 9100,
    status: "in_operation",
    priority: "normal",
    origin: "Itapúa",
    destination: "Asunción",
    createdAt: "2026-04-09",
    neededBy: "2026-04-14",
    coveredQuantity: 7800,
    offersCount: 3,
    assignedTransportCount: 2,
    visibleToTransportistas: true,
    transportRequired: true,
    notes: "Operación en curso con retiro ya coordinado.",
  },
  {
    id: "REQ-007",
    frigorifico: "Frigorífico Norte",
    frigorificoEmail: "operaciones@frigonorte.com",
    frigorificoSlug: "frigorifico-norte",
    type: "bovino",
    quantity: 41000,
    unit: "cabezas",
    priceTarget: 29400,
    status: "open",
    priority: "critical",
    origin: "Pedro Juan Caballero",
    destination: "Curitiba",
    createdAt: "2026-04-14",
    neededBy: "2026-04-20",
    coveredQuantity: 0,
    offersCount: 0,
    assignedTransportCount: 0,
    visibleToTransportistas: false,
    transportRequired: true,
    notes: "Nueva apertura; aún sin cobertura ni ofertas registradas.",
  },
  {
    id: "REQ-008",
    frigorifico: "Frigorífico del Este",
    frigorificoEmail: "supply@frigodeleste.com",
    frigorificoSlug: "frigorifico-del-este",
    type: "porcino",
    quantity: 11800,
    unit: "cabezas",
    priceTarget: 17100,
    status: "closed",
    priority: "normal",
    origin: "Minga Guazú",
    destination: "Ciudad del Este",
    createdAt: "2026-04-07",
    neededBy: "2026-04-12",
    coveredQuantity: 11800,
    offersCount: 4,
    assignedTransportCount: 2,
    visibleToTransportistas: true,
    transportRequired: true,
    notes: "Operación cerrada y concluida con éxito.",
  },
];

export function getCoveragePercent(request: RequestRecord): number {
  if (!request.quantity) return 0;
  return Math.min(100, Math.round((request.coveredQuantity / request.quantity) * 100));
}

export function getCoverageLabel(request: RequestRecord): string {
  const percent = getCoveragePercent(request);

  if (percent === 0) return "Sin cobertura";
  if (percent < 50) return "Cobertura baja";
  if (percent < 80) return "Cobertura parcial";
  if (percent < 100) return "Cobertura avanzada";
  return "Cobertura completa";
}

export function getOpenGap(request: RequestRecord): number {
  return Math.max(0, request.quantity - request.coveredQuantity);
}

export function getEstimatedGrossValue(request: RequestRecord): number {
  return (request.priceTarget ?? 0) * request.quantity;
}

export function getRequestStatusLabel(status: RequestStatus): string {
  switch (status) {
    case "open":
      return "Abierta";
    case "receiving_offers":
      return "Recibiendo ofertas";
    case "negotiating":
      return "En negociación";
    case "partially_covered":
      return "Parcialmente cubierta";
    case "covered":
      return "Cubierta";
    case "pending_transport":
      return "Pendiente de transporte";
    case "in_operation":
      return "En operación";
    case "closed":
      return "Cerrada";
    case "cancelled":
      return "Cancelada";
    default:
      return status;
  }
}

export function getPriorityLabel(priority: RequestPriority): string {
  switch (priority) {
    case "critical":
      return "Crítica";
    case "high":
      return "Alta";
    case "medium":
      return "Media";
    case "normal":
    default:
      return "Normal";
  }
}

export function getLivestockLabel(type: LivestockType): string {
  switch (type) {
    case "bovino":
      return "Bovino";
    case "porcino":
      return "Porcino";
    case "avicola":
      return "Avícola";
    default:
      return type;
  }
}