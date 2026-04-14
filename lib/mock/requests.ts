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

export type RequestRecord = {
  id: string;
  frigorifico: string;
  type: LivestockType;
  quantity: number;
  unit: "cabezas" | "kg";
  priceTarget?: number;
  status: RequestStatus;
  origin: string;
  destination: string;
  createdAt: string;
  coveredQuantity: number;
};

export const requests: RequestRecord[] = [
  {
    id: "REQ-001",
    frigorifico: "Frigorífico Sur",
    type: "bovino",
    quantity: 50000,
    unit: "cabezas",
    priceTarget: 30000,
    status: "receiving_offers",
    origin: "Asunción",
    destination: "São Paulo",
    createdAt: "2026-04-13",
    coveredQuantity: 18000,
  },
  {
    id: "REQ-002",
    frigorifico: "Frigorífico Norte",
    type: "porcino",
    quantity: 20000,
    unit: "cabezas",
    priceTarget: 18000,
    status: "negotiating",
    origin: "Encarnación",
    destination: "Curitiba",
    createdAt: "2026-04-12",
    coveredQuantity: 12000,
  },
  {
    id: "REQ-003",
    frigorifico: "Frigorífico del Este",
    type: "avicola",
    quantity: 5000,
    unit: "cabezas",
    priceTarget: 9500,
    status: "covered",
    origin: "Ciudad del Este",
    destination: "Asunción",
    createdAt: "2026-04-11",
    coveredQuantity: 5000,
  },
];