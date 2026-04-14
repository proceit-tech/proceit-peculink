import type { LivestockType, RequestStatus } from "@/lib/mock/requests";

export type OfferKind = "supply" | "freight";

export type OfferStatus =
  | "sent"
  | "viewed"
  | "shortlisted"
  | "negotiating"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "expired";

export type OfferPriority = "critical" | "high" | "medium" | "normal";

export type OfferRecord = {
  id: string;
  kind: OfferKind;

  requestId: string;
  requestStatusAtOfferTime: RequestStatus;

  frigorifico: string;
  frigorificoSlug: string;
  frigorificoEmail: string;

  supplierName: string;
  supplierSlug: string;
  supplierEmail: string;
  supplierRole: "productor" | "transportista";

  livestockType: LivestockType;
  quantityOffered: number;
  unit: "cabezas" | "kg";

  pricePerUnit?: number;
  freightPrice?: number;
  currency: "USD" | "Gs";

  status: OfferStatus;
  priority: OfferPriority;

  origin: string;
  destination: string;

  createdAt: string;
  updatedAt: string;
  validUntil?: string;

  responseTimeHours: number;
  deliveryWindow?: string;

  score: number;
  notes?: string;
};

export const offers: OfferRecord[] = [
  {
    id: "OFF-001",
    kind: "supply",
    requestId: "REQ-001",
    requestStatusAtOfferTime: "receiving_offers",
    frigorifico: "Frigorífico Sur",
    frigorificoSlug: "frigorifico-sur",
    frigorificoEmail: "compras@frigorificosur.com",
    supplierName: "Agroganadera Horizonte",
    supplierSlug: "agroganadera-horizonte",
    supplierEmail: "ventas@horizonte.com",
    supplierRole: "productor",
    livestockType: "bovino",
    quantityOffered: 12000,
    unit: "cabezas",
    pricePerUnit: 29400,
    currency: "USD",
    status: "shortlisted",
    priority: "high",
    origin: "Asunción",
    destination: "São Paulo",
    createdAt: "2026-04-13T09:20:00",
    updatedAt: "2026-04-13T12:10:00",
    validUntil: "2026-04-16T18:00:00",
    responseTimeHours: 2.1,
    deliveryWindow: "48h",
    score: 92,
    notes: "Oferta fuerte por volumen y velocidad de respuesta.",
  },
  {
    id: "OFF-002",
    kind: "supply",
    requestId: "REQ-001",
    requestStatusAtOfferTime: "receiving_offers",
    frigorifico: "Frigorífico Sur",
    frigorificoSlug: "frigorifico-sur",
    frigorificoEmail: "compras@frigorificosur.com",
    supplierName: "Ganadera San José",
    supplierSlug: "ganadera-san-jose",
    supplierEmail: "comercial@sanjose.com",
    supplierRole: "productor",
    livestockType: "bovino",
    quantityOffered: 6000,
    unit: "cabezas",
    pricePerUnit: 30100,
    currency: "USD",
    status: "viewed",
    priority: "medium",
    origin: "Asunción",
    destination: "São Paulo",
    createdAt: "2026-04-13T10:15:00",
    updatedAt: "2026-04-13T11:00:00",
    validUntil: "2026-04-15T20:00:00",
    responseTimeHours: 3.0,
    deliveryWindow: "72h",
    score: 78,
    notes: "Buena calidad, pero precio superior al target.",
  },
  {
    id: "OFF-003",
    kind: "supply",
    requestId: "REQ-002",
    requestStatusAtOfferTime: "negotiating",
    frigorifico: "Frigorífico Norte",
    frigorificoSlug: "frigorifico-norte",
    frigorificoEmail: "operaciones@frigonorte.com",
    supplierName: "Porcinos del Sur",
    supplierSlug: "porcinos-del-sur",
    supplierEmail: "ventas@porcinosdelsur.com",
    supplierRole: "productor",
    livestockType: "porcino",
    quantityOffered: 8000,
    unit: "cabezas",
    pricePerUnit: 17650,
    currency: "USD",
    status: "negotiating",
    priority: "high",
    origin: "Encarnación",
    destination: "Curitiba",
    createdAt: "2026-04-12T08:40:00",
    updatedAt: "2026-04-13T14:30:00",
    validUntil: "2026-04-16T17:00:00",
    responseTimeHours: 1.7,
    deliveryWindow: "36h",
    score: 89,
    notes: "En negociación avanzada por precio y capacidad.",
  },
  {
    id: "OFF-004",
    kind: "supply",
    requestId: "REQ-002",
    requestStatusAtOfferTime: "negotiating",
    frigorifico: "Frigorífico Norte",
    frigorificoSlug: "frigorifico-norte",
    frigorificoEmail: "operaciones@frigonorte.com",
    supplierName: "Estancia La Esperanza",
    supplierSlug: "estancia-la-esperanza",
    supplierEmail: "sales@esperanza.com",
    supplierRole: "productor",
    livestockType: "porcino",
    quantityOffered: 4000,
    unit: "cabezas",
    pricePerUnit: 18100,
    currency: "USD",
    status: "rejected",
    priority: "medium",
    origin: "Encarnación",
    destination: "Curitiba",
    createdAt: "2026-04-12T09:05:00",
    updatedAt: "2026-04-12T16:20:00",
    validUntil: "2026-04-14T17:00:00",
    responseTimeHours: 2.6,
    deliveryWindow: "48h",
    score: 64,
    notes: "Rechazada por precio y menor score competitivo.",
  },
  {
    id: "OFF-005",
    kind: "supply",
    requestId: "REQ-003",
    requestStatusAtOfferTime: "covered",
    frigorifico: "Frigorífico del Este",
    frigorificoSlug: "frigorifico-del-este",
    frigorificoEmail: "supply@frigodeleste.com",
    supplierName: "Avícola Paraná",
    supplierSlug: "avicola-parana",
    supplierEmail: "negocios@parana.com",
    supplierRole: "productor",
    livestockType: "avicola",
    quantityOffered: 5000,
    unit: "cabezas",
    pricePerUnit: 9400,
    currency: "USD",
    status: "accepted",
    priority: "medium",
    origin: "Ciudad del Este",
    destination: "Asunción",
    createdAt: "2026-04-11T07:50:00",
    updatedAt: "2026-04-11T13:12:00",
    validUntil: "2026-04-13T18:00:00",
    responseTimeHours: 1.2,
    deliveryWindow: "24h",
    score: 95,
    notes: "Oferta adjudicada por cobertura total y mejor ajuste económico.",
  },
  {
    id: "OFF-006",
    kind: "supply",
    requestId: "REQ-004",
    requestStatusAtOfferTime: "partially_covered",
    frigorifico: "Frigorífico Central",
    frigorificoSlug: "frigorifico-central",
    frigorificoEmail: "abastecimiento@frigocentral.com",
    supplierName: "Ganadera Horizonte",
    supplierSlug: "ganadera-horizonte",
    supplierEmail: "ventas@ganaderahorizonte.com",
    supplierRole: "productor",
    livestockType: "bovino",
    quantityOffered: 9200,
    unit: "cabezas",
    pricePerUnit: 28350,
    currency: "USD",
    status: "shortlisted",
    priority: "high",
    origin: "Concepción",
    destination: "Asunción",
    createdAt: "2026-04-14T09:10:00",
    updatedAt: "2026-04-14T12:42:00",
    validUntil: "2026-04-16T16:00:00",
    responseTimeHours: 1.4,
    deliveryWindow: "48h",
    score: 91,
    notes: "Oferta bien posicionada por volumen y precio.",
  },
  {
    id: "OFF-007",
    kind: "supply",
    requestId: "REQ-005",
    requestStatusAtOfferTime: "pending_transport",
    frigorifico: "Frigorífico Capital",
    frigorificoSlug: "frigorifico-capital",
    frigorificoEmail: "compras@frigocapital.com",
    supplierName: "Porcinos del Sur",
    supplierSlug: "porcinos-del-sur",
    supplierEmail: "ventas@porcinosdelsur.com",
    supplierRole: "productor",
    livestockType: "porcino",
    quantityOffered: 14500,
    unit: "cabezas",
    pricePerUnit: 17480,
    currency: "USD",
    status: "accepted",
    priority: "medium",
    origin: "Villarrica",
    destination: "Asunción",
    createdAt: "2026-04-10T08:00:00",
    updatedAt: "2026-04-10T14:00:00",
    validUntil: "2026-04-12T18:00:00",
    responseTimeHours: 1.1,
    deliveryWindow: "24h",
    score: 94,
    notes: "Cobertura comercial completa; operación ya depende de transporte.",
  },
  {
    id: "OFF-008",
    kind: "freight",
    requestId: "REQ-005",
    requestStatusAtOfferTime: "pending_transport",
    frigorifico: "Frigorífico Capital",
    frigorificoSlug: "frigorifico-capital",
    frigorificoEmail: "compras@frigocapital.com",
    supplierName: "Ruta Centro Logística",
    supplierSlug: "ruta-centro-logistica",
    supplierEmail: "trafico@rutacentro.com",
    supplierRole: "transportista",
    livestockType: "porcino",
    quantityOffered: 3,
    unit: "kg",
    freightPrice: 5400,
    currency: "USD",
    status: "negotiating",
    priority: "high",
    origin: "Villarrica",
    destination: "Asunción",
    createdAt: "2026-04-10T15:20:00",
    updatedAt: "2026-04-11T10:10:00",
    validUntil: "2026-04-12T13:00:00",
    responseTimeHours: 2.3,
    deliveryWindow: "Salida en 24h",
    score: 87,
    notes: "Capacidad parcial, pendiente confirmación de ventana final.",
  },
  {
    id: "OFF-009",
    kind: "freight",
    requestId: "REQ-003",
    requestStatusAtOfferTime: "covered",
    frigorifico: "Frigorífico del Este",
    frigorificoSlug: "frigorifico-del-este",
    frigorificoEmail: "supply@frigodeleste.com",
    supplierName: "Logística Integral Sur",
    supplierSlug: "logistica-integral-sur",
    supplierEmail: "ops@lisur.com",
    supplierRole: "transportista",
    livestockType: "avicola",
    quantityOffered: 2,
    unit: "kg",
    freightPrice: 3200,
    currency: "USD",
    status: "accepted",
    priority: "medium",
    origin: "Ciudad del Este",
    destination: "Asunción",
    createdAt: "2026-04-11T13:40:00",
    updatedAt: "2026-04-11T16:05:00",
    validUntil: "2026-04-12T12:00:00",
    responseTimeHours: 1.5,
    deliveryWindow: "Salida inmediata",
    score: 90,
    notes: "Transporte adjudicado y alineado a operación cerrada.",
  },
  {
    id: "OFF-010",
    kind: "supply",
    requestId: "REQ-007",
    requestStatusAtOfferTime: "open",
    frigorifico: "Frigorífico Norte",
    frigorificoSlug: "frigorifico-norte",
    frigorificoEmail: "operaciones@frigonorte.com",
    supplierName: "Ganadera San Miguel",
    supplierSlug: "ganadera-san-miguel",
    supplierEmail: "ventas@sanmiguel.com",
    supplierRole: "productor",
    livestockType: "bovino",
    quantityOffered: 15000,
    unit: "cabezas",
    pricePerUnit: 28900,
    currency: "USD",
    status: "sent",
    priority: "critical",
    origin: "Pedro Juan Caballero",
    destination: "Curitiba",
    createdAt: "2026-04-14T11:35:00",
    updatedAt: "2026-04-14T11:35:00",
    validUntil: "2026-04-17T18:00:00",
    responseTimeHours: 0.9,
    deliveryWindow: "72h",
    score: 90,
    notes: "Primera oferta fuerte para solicitud crítica recién abierta.",
  },
];

export function getOfferStatusLabel(status: OfferStatus): string {
  switch (status) {
    case "sent":
      return "Enviada";
    case "viewed":
      return "Vista";
    case "shortlisted":
      return "Preseleccionada";
    case "negotiating":
      return "En negociación";
    case "accepted":
      return "Aceptada";
    case "rejected":
      return "Rechazada";
    case "withdrawn":
      return "Retirada";
    case "expired":
      return "Expirada";
    default:
      return status;
  }
}

export function getOfferPriorityLabel(priority: OfferPriority): string {
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

export function getOfferKindLabel(kind: OfferKind): string {
  switch (kind) {
    case "supply":
      return "Oferta de suministro";
    case "freight":
      return "Propuesta logística";
    default:
      return kind;
  }
}

export function getOfferCommercialValue(offer: OfferRecord): number {
  if (offer.kind === "supply") {
    return (offer.pricePerUnit ?? 0) * offer.quantityOffered;
  }

  return offer.freightPrice ?? 0;
}

export function getOfferResponseLabel(hours: number): string {
  if (hours <= 1) return "Muy rápida";
  if (hours <= 3) return "Rápida";
  if (hours <= 8) return "Normal";
  return "Lenta";
}