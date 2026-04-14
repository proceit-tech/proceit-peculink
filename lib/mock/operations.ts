export type OperationStatus =
  | "created"
  | "commercial_confirmed"
  | "awaiting_logistics"
  | "scheduled"
  | "in_transit"
  | "received"
  | "completed"
  | "cancelled";

export type OperationPriority = "critical" | "high" | "medium" | "normal";

export type OperationRecord = {
  id: string;

  requestId: string;
  supplyOfferId?: string;
  freightId?: string;

  frigorifico: string;
  frigorificoSlug: string;
  frigorificoEmail: string;

  supplierName: string;
  supplierSlug: string;
  supplierEmail: string;

  transportista?: string;
  transportistaSlug?: string;
  transportistaEmail?: string;

  livestockType: "bovino" | "porcino" | "avicola";
  quantity: number;
  unit: "cabezas" | "kg";

  origin: string;
  destination: string;

  pricePerUnit: number;
  commercialValue: number;
  freightValue?: number;
  totalOperationValue: number;

  status: OperationStatus;
  priority: OperationPriority;

  createdAt: string;
  scheduledAt?: string;
  pickupDate?: string;
  deliveryDate?: string;
  completedAt?: string;

  commercialProgress: number;
  logisticsProgress: number;
  overallProgress: number;

  compliancePercent: number;
  marginEstimate?: number;
  notes?: string;
};

export const operations: OperationRecord[] = [
  {
    id: "OPE-001",
    requestId: "REQ-003",
    supplyOfferId: "OFF-005",
    freightId: "FRT-003",
    frigorifico: "Frigorífico del Este",
    frigorificoSlug: "frigorifico-del-este",
    frigorificoEmail: "supply@frigodeleste.com",
    supplierName: "Avícola Paraná",
    supplierSlug: "avicola-parana",
    supplierEmail: "negocios@parana.com",
    transportista: "Logística Integral Sur",
    transportistaSlug: "logistica-integral-sur",
    transportistaEmail: "ops@lisur.com",
    livestockType: "avicola",
    quantity: 5000,
    unit: "cabezas",
    origin: "Ciudad del Este",
    destination: "Asunción",
    pricePerUnit: 9400,
    commercialValue: 47000000,
    freightValue: 3200,
    totalOperationValue: 47003200,
    status: "scheduled",
    priority: "medium",
    createdAt: "2026-04-11T13:12:00",
    scheduledAt: "2026-04-14T09:00:00",
    pickupDate: "2026-04-15",
    deliveryDate: "2026-04-15",
    commercialProgress: 100,
    logisticsProgress: 100,
    overallProgress: 82,
    compliancePercent: 100,
    marginEstimate: 4.8,
    notes: "Operación cerrada comercialmente y completamente programada.",
  },
  {
    id: "OPE-002",
    requestId: "REQ-005",
    supplyOfferId: "OFF-007",
    freightId: "FRT-005",
    frigorifico: "Frigorífico Capital",
    frigorificoSlug: "frigorifico-capital",
    frigorificoEmail: "compras@frigocapital.com",
    supplierName: "Porcinos del Sur",
    supplierSlug: "porcinos-del-sur",
    supplierEmail: "ventas@porcinosdelsur.com",
    transportista: "Ruta Centro Logística",
    transportistaSlug: "ruta-centro-logistica",
    transportistaEmail: "trafico@rutacentro.com",
    livestockType: "porcino",
    quantity: 14500,
    unit: "cabezas",
    origin: "Villarrica",
    destination: "Asunción",
    pricePerUnit: 17480,
    commercialValue: 253460000,
    freightValue: 5400,
    totalOperationValue: 253465400,
    status: "in_transit",
    priority: "medium",
    createdAt: "2026-04-10T14:00:00",
    scheduledAt: "2026-04-10T16:20:00",
    pickupDate: "2026-04-14",
    deliveryDate: "2026-04-15",
    commercialProgress: 100,
    logisticsProgress: 76,
    overallProgress: 88,
    compliancePercent: 97,
    marginEstimate: 5.2,
    notes: "Operación ya en tránsito, con ejecución logística en curso.",
  },
  {
    id: "OPE-003",
    requestId: "REQ-001",
    supplyOfferId: "OFF-001",
    freightId: "FRT-001",
    frigorifico: "Frigorífico Sur",
    frigorificoSlug: "frigorifico-sur",
    frigorificoEmail: "compras@frigorificosur.com",
    supplierName: "Agroganadera Horizonte",
    supplierSlug: "agroganadera-horizonte",
    supplierEmail: "ventas@horizonte.com",
    transportista: "Ruta Centro Logística",
    transportistaSlug: "ruta-centro-logistica",
    transportistaEmail: "trafico@rutacentro.com",
    livestockType: "bovino",
    quantity: 12000,
    unit: "cabezas",
    origin: "Asunción",
    destination: "São Paulo",
    pricePerUnit: 29400,
    commercialValue: 352800000,
    freightValue: 15200,
    totalOperationValue: 352815200,
    status: "awaiting_logistics",
    priority: "critical",
    createdAt: "2026-04-13T12:10:00",
    pickupDate: "2026-04-16",
    deliveryDate: "2026-04-18",
    commercialProgress: 100,
    logisticsProgress: 44,
    overallProgress: 63,
    compliancePercent: 79,
    marginEstimate: 6.1,
    notes: "Operación confirmada comercialmente, pero con asignación logística todavía parcial.",
  },
  {
    id: "OPE-004",
    requestId: "REQ-002",
    supplyOfferId: "OFF-003",
    frigorifico: "Frigorífico Norte",
    frigorificoSlug: "frigorifico-norte",
    frigorificoEmail: "operaciones@frigonorte.com",
    supplierName: "Porcinos del Sur",
    supplierSlug: "porcinos-del-sur",
    supplierEmail: "ventas@porcinosdelsur.com",
    livestockType: "porcino",
    quantity: 8000,
    unit: "cabezas",
    origin: "Encarnación",
    destination: "Curitiba",
    pricePerUnit: 17650,
    commercialValue: 141200000,
    totalOperationValue: 141200000,
    status: "commercial_confirmed",
    priority: "high",
    createdAt: "2026-04-13T14:30:00",
    pickupDate: "2026-04-17",
    deliveryDate: "2026-04-18",
    commercialProgress: 100,
    logisticsProgress: 0,
    overallProgress: 48,
    compliancePercent: 82,
    marginEstimate: 4.6,
    notes: "Cierre comercial avanzado; falta consolidar el bloque logístico.",
  },
  {
    id: "OPE-005",
    requestId: "REQ-006",
    freightId: "FRT-006",
    frigorifico: "Frigorífico Sur",
    frigorificoSlug: "frigorifico-sur",
    frigorificoEmail: "compras@frigorificosur.com",
    supplierName: "Proveedor consolidado",
    supplierSlug: "proveedor-consolidado",
    supplierEmail: "ops@proveedor.com",
    transportista: "Ruta Norte Logística",
    transportistaSlug: "ruta-norte-logistica",
    transportistaEmail: "ops@rutanorte.com",
    livestockType: "avicola",
    quantity: 7800,
    unit: "cabezas",
    origin: "Itapúa",
    destination: "Asunción",
    pricePerUnit: 9100,
    commercialValue: 70980000,
    freightValue: 2850,
    totalOperationValue: 70982850,
    status: "received",
    priority: "normal",
    createdAt: "2026-04-09T16:10:00",
    scheduledAt: "2026-04-13T10:00:00",
    pickupDate: "2026-04-13",
    deliveryDate: "2026-04-14",
    commercialProgress: 100,
    logisticsProgress: 100,
    overallProgress: 96,
    compliancePercent: 99,
    marginEstimate: 5.7,
    notes: "Carga recibida, pendiente sólo cierre formal y consolidación administrativa.",
  },
  {
    id: "OPE-006",
    requestId: "REQ-008",
    freightId: "FRT-008",
    frigorifico: "Frigorífico del Este",
    frigorificoSlug: "frigorifico-del-este",
    frigorificoEmail: "supply@frigodeleste.com",
    supplierName: "Proveedor histórico",
    supplierSlug: "proveedor-historico",
    supplierEmail: "ventas@historico.com",
    transportista: "Logística Integral Sur",
    transportistaSlug: "logistica-integral-sur",
    transportistaEmail: "ops@lisur.com",
    livestockType: "porcino",
    quantity: 11800,
    unit: "cabezas",
    origin: "Minga Guazú",
    destination: "Ciudad del Este",
    pricePerUnit: 17100,
    commercialValue: 201780000,
    freightValue: 1600,
    totalOperationValue: 201781600,
    status: "completed",
    priority: "normal",
    createdAt: "2026-04-07T10:30:00",
    scheduledAt: "2026-04-10T09:15:00",
    pickupDate: "2026-04-11",
    deliveryDate: "2026-04-12",
    completedAt: "2026-04-12T19:00:00",
    commercialProgress: 100,
    logisticsProgress: 100,
    overallProgress: 100,
    compliancePercent: 100,
    marginEstimate: 6.4,
    notes: "Operación finalizada con cumplimiento total.",
  },
  {
    id: "OPE-007",
    requestId: "REQ-004",
    supplyOfferId: "OFF-006",
    freightId: "FRT-004",
    frigorifico: "Frigorífico Central",
    frigorificoSlug: "frigorifico-central",
    frigorificoEmail: "abastecimiento@frigocentral.com",
    supplierName: "Ganadera Horizonte",
    supplierSlug: "ganadera-horizonte",
    supplierEmail: "ventas@ganaderahorizonte.com",
    livestockType: "bovino",
    quantity: 9200,
    unit: "cabezas",
    origin: "Concepción",
    destination: "Asunción",
    pricePerUnit: 28350,
    commercialValue: 260820000,
    freightValue: 9100,
    totalOperationValue: 260829100,
    status: "created",
    priority: "high",
    createdAt: "2026-04-14T12:42:00",
    pickupDate: "2026-04-18",
    deliveryDate: "2026-04-18",
    commercialProgress: 62,
    logisticsProgress: 18,
    overallProgress: 37,
    compliancePercent: 70,
    marginEstimate: 3.9,
    notes: "Operación recién estructurada; aún en fase temprana de consolidación.",
  },
];

export function getOperationStatusLabel(status: OperationStatus): string {
  switch (status) {
    case "created":
      return "Creada";
    case "commercial_confirmed":
      return "Confirmada comercialmente";
    case "awaiting_logistics":
      return "Esperando logística";
    case "scheduled":
      return "Programada";
    case "in_transit":
      return "En tránsito";
    case "received":
      return "Recibida";
    case "completed":
      return "Completada";
    case "cancelled":
      return "Cancelada";
    default:
      return status;
  }
}

export function getOperationPriorityLabel(priority: OperationPriority): string {
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

export function getOperationGapLabel(record: OperationRecord): string {
  if (record.overallProgress >= 100) return "Ciclo concluido";
  if (record.logisticsProgress < 100 && record.commercialProgress === 100) return "Gap logístico";
  if (record.commercialProgress < 100) return "Gap comercial";
  return "Ejecución en curso";
}