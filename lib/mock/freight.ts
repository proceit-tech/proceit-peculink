export type FreightStatus =
  | "open"
  | "awaiting_proposals"
  | "proposal_received"
  | "assigned"
  | "scheduled"
  | "in_transit"
  | "delivered"
  | "completed"
  | "cancelled";

export type FreightPriority = "critical" | "high" | "medium" | "normal";

export type FreightVehicleType =
  | "camion_liviano"
  | "camion_pesado"
  | "refrigerado"
  | "multi_carga";

export type FreightRecord = {
  id: string;

  requestId: string;
  relatedOfferId?: string;

  frigorifico: string;
  frigorificoSlug: string;
  frigorificoEmail: string;

  transportista?: string;
  transportistaSlug?: string;
  transportistaEmail?: string;

  cargoType: "bovino" | "porcino" | "avicola";
  vehicleType: FreightVehicleType;

  quantity: number;
  unit: "cabezas" | "kg" | "viajes";

  origin: string;
  destination: string;
  distanceKm: number;

  status: FreightStatus;
  priority: FreightPriority;

  requiredVehicles: number;
  assignedVehicles: number;

  estimatedFreightValue: number;
  proposedFreightValue?: number;

  visibleToTransportistas: boolean;

  pickupDate: string;
  deliveryDate: string;
  createdAt: string;
  updatedAt: string;

  compliancePercent: number;
  notes?: string;
};

export const freightRecords: FreightRecord[] = [
  {
    id: "FRT-001",
    requestId: "REQ-001",
    relatedOfferId: "OFF-008",
    frigorifico: "Frigorífico Sur",
    frigorificoSlug: "frigorifico-sur",
    frigorificoEmail: "compras@frigorificosur.com",
    transportista: "Ruta Centro Logística",
    transportistaSlug: "ruta-centro-logistica",
    transportistaEmail: "trafico@rutacentro.com",
    cargoType: "bovino",
    vehicleType: "camion_pesado",
    quantity: 6,
    unit: "viajes",
    origin: "Asunción",
    destination: "São Paulo",
    distanceKm: 1130,
    status: "assigned",
    priority: "critical",
    requiredVehicles: 6,
    assignedVehicles: 4,
    estimatedFreightValue: 14800,
    proposedFreightValue: 15200,
    visibleToTransportistas: true,
    pickupDate: "2026-04-16",
    deliveryDate: "2026-04-18",
    createdAt: "2026-04-13T15:20:00",
    updatedAt: "2026-04-14T10:35:00",
    compliancePercent: 66,
    notes: "Asignación parcial; faltan dos unidades para cubrir toda la salida.",
  },
  {
    id: "FRT-002",
    requestId: "REQ-002",
    frigorifico: "Frigorífico Norte",
    frigorificoSlug: "frigorifico-norte",
    frigorificoEmail: "operaciones@frigonorte.com",
    cargoType: "porcino",
    vehicleType: "refrigerado",
    quantity: 4,
    unit: "viajes",
    origin: "Encarnación",
    destination: "Curitiba",
    distanceKm: 710,
    status: "awaiting_proposals",
    priority: "high",
    requiredVehicles: 4,
    assignedVehicles: 0,
    estimatedFreightValue: 9200,
    visibleToTransportistas: true,
    pickupDate: "2026-04-17",
    deliveryDate: "2026-04-18",
    createdAt: "2026-04-14T08:20:00",
    updatedAt: "2026-04-14T08:20:00",
    compliancePercent: 0,
    notes: "Operación comercial avanzada; se abre búsqueda logística.",
  },
  {
    id: "FRT-003",
    requestId: "REQ-003",
    relatedOfferId: "OFF-009",
    frigorifico: "Frigorífico del Este",
    frigorificoSlug: "frigorifico-del-este",
    frigorificoEmail: "supply@frigodeleste.com",
    transportista: "Logística Integral Sur",
    transportistaSlug: "logistica-integral-sur",
    transportistaEmail: "ops@lisur.com",
    cargoType: "avicola",
    vehicleType: "refrigerado",
    quantity: 2,
    unit: "viajes",
    origin: "Ciudad del Este",
    destination: "Asunción",
    distanceKm: 327,
    status: "scheduled",
    priority: "medium",
    requiredVehicles: 2,
    assignedVehicles: 2,
    estimatedFreightValue: 3200,
    proposedFreightValue: 3200,
    visibleToTransportistas: true,
    pickupDate: "2026-04-15",
    deliveryDate: "2026-04-15",
    createdAt: "2026-04-11T14:10:00",
    updatedAt: "2026-04-14T09:00:00",
    compliancePercent: 100,
    notes: "Logística completamente asignada y programada.",
  },
  {
    id: "FRT-004",
    requestId: "REQ-004",
    frigorifico: "Frigorífico Central",
    frigorificoSlug: "frigorifico-central",
    frigorificoEmail: "abastecimiento@frigocentral.com",
    cargoType: "bovino",
    vehicleType: "camion_pesado",
    quantity: 5,
    unit: "viajes",
    origin: "Concepción",
    destination: "Asunción",
    distanceKm: 430,
    status: "proposal_received",
    priority: "high",
    requiredVehicles: 5,
    assignedVehicles: 0,
    estimatedFreightValue: 8700,
    proposedFreightValue: 9100,
    visibleToTransportistas: true,
    pickupDate: "2026-04-18",
    deliveryDate: "2026-04-18",
    createdAt: "2026-04-14T10:15:00",
    updatedAt: "2026-04-14T13:30:00",
    compliancePercent: 0,
    notes: "Ya hay propuesta logística, pendiente decisión del frigorífico.",
  },
  {
    id: "FRT-005",
    requestId: "REQ-005",
    relatedOfferId: "OFF-008",
    frigorifico: "Frigorífico Capital",
    frigorificoSlug: "frigorifico-capital",
    frigorificoEmail: "compras@frigocapital.com",
    transportista: "Ruta Centro Logística",
    transportistaSlug: "ruta-centro-logistica",
    transportistaEmail: "trafico@rutacentro.com",
    cargoType: "porcino",
    vehicleType: "refrigerado",
    quantity: 3,
    unit: "viajes",
    origin: "Villarrica",
    destination: "Asunción",
    distanceKm: 180,
    status: "in_transit",
    priority: "medium",
    requiredVehicles: 3,
    assignedVehicles: 3,
    estimatedFreightValue: 5400,
    proposedFreightValue: 5400,
    visibleToTransportistas: true,
    pickupDate: "2026-04-14",
    deliveryDate: "2026-04-15",
    createdAt: "2026-04-10T15:40:00",
    updatedAt: "2026-04-14T12:00:00",
    compliancePercent: 100,
    notes: "Operación logística en curso con salida ya ejecutada.",
  },
  {
    id: "FRT-006",
    requestId: "REQ-006",
    frigorifico: "Frigorífico Sur",
    frigorificoSlug: "frigorifico-sur",
    frigorificoEmail: "compras@frigorificosur.com",
    transportista: "Ruta Norte Logística",
    transportistaSlug: "ruta-norte-logistica",
    transportistaEmail: "ops@rutanorte.com",
    cargoType: "avicola",
    vehicleType: "refrigerado",
    quantity: 2,
    unit: "viajes",
    origin: "Itapúa",
    destination: "Asunción",
    distanceKm: 365,
    status: "delivered",
    priority: "normal",
    requiredVehicles: 2,
    assignedVehicles: 2,
    estimatedFreightValue: 2900,
    proposedFreightValue: 2850,
    visibleToTransportistas: true,
    pickupDate: "2026-04-13",
    deliveryDate: "2026-04-14",
    createdAt: "2026-04-09T16:10:00",
    updatedAt: "2026-04-14T11:15:00",
    compliancePercent: 100,
    notes: "Entrega concluida; pendiente cierre administrativo.",
  },
  {
    id: "FRT-007",
    requestId: "REQ-007",
    frigorifico: "Frigorífico Norte",
    frigorificoSlug: "frigorifico-norte",
    frigorificoEmail: "operaciones@frigonorte.com",
    cargoType: "bovino",
    vehicleType: "camion_pesado",
    quantity: 7,
    unit: "viajes",
    origin: "Pedro Juan Caballero",
    destination: "Curitiba",
    distanceKm: 980,
    status: "open",
    priority: "critical",
    requiredVehicles: 7,
    assignedVehicles: 0,
    estimatedFreightValue: 16200,
    visibleToTransportistas: false,
    pickupDate: "2026-04-20",
    deliveryDate: "2026-04-22",
    createdAt: "2026-04-14T14:05:00",
    updatedAt: "2026-04-14T14:05:00",
    compliancePercent: 0,
    notes: "Solicitud logística aún no liberada al mercado; depende de avance comercial.",
  },
  {
    id: "FRT-008",
    requestId: "REQ-008",
    frigorifico: "Frigorífico del Este",
    frigorificoSlug: "frigorifico-del-este",
    frigorificoEmail: "supply@frigodeleste.com",
    transportista: "Logística Integral Sur",
    transportistaSlug: "logistica-integral-sur",
    transportistaEmail: "ops@lisur.com",
    cargoType: "porcino",
    vehicleType: "multi_carga",
    quantity: 2,
    unit: "viajes",
    origin: "Minga Guazú",
    destination: "Ciudad del Este",
    distanceKm: 25,
    status: "completed",
    priority: "normal",
    requiredVehicles: 2,
    assignedVehicles: 2,
    estimatedFreightValue: 1600,
    proposedFreightValue: 1600,
    visibleToTransportistas: true,
    pickupDate: "2026-04-11",
    deliveryDate: "2026-04-12",
    createdAt: "2026-04-07T10:30:00",
    updatedAt: "2026-04-12T19:00:00",
    compliancePercent: 100,
    notes: "Operación concluida y cerrada completamente.",
  },
];

export function getFreightStatusLabel(status: FreightStatus): string {
  switch (status) {
    case "open":
      return "Abierta";
    case "awaiting_proposals":
      return "Esperando propuestas";
    case "proposal_received":
      return "Propuesta recibida";
    case "assigned":
      return "Asignada";
    case "scheduled":
      return "Programada";
    case "in_transit":
      return "En tránsito";
    case "delivered":
      return "Entregada";
    case "completed":
      return "Completada";
    case "cancelled":
      return "Cancelada";
    default:
      return status;
  }
}

export function getFreightPriorityLabel(priority: FreightPriority): string {
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

export function getVehicleTypeLabel(type: FreightVehicleType): string {
  switch (type) {
    case "camion_liviano":
      return "Camión liviano";
    case "camion_pesado":
      return "Camión pesado";
    case "refrigerado":
      return "Refrigerado";
    case "multi_carga":
      return "Multi-carga";
    default:
      return type;
  }
}

export function getFreightGap(record: FreightRecord): number {
  return Math.max(0, record.requiredVehicles - record.assignedVehicles);
}

export function getFreightAssignmentPercent(record: FreightRecord): number {
  if (!record.requiredVehicles) return 0;
  return Math.min(100, Math.round((record.assignedVehicles / record.requiredVehicles) * 100));
}

export function getFreightValue(record: FreightRecord): number {
  return record.proposedFreightValue ?? record.estimatedFreightValue;
}