import { requests } from "@/lib/mock/requests";
import { offers } from "@/lib/mock/offers";
import { freightRecords } from "@/lib/mock/freight";
import { operations } from "@/lib/mock/operations";

export function getRequestById(requestId: string) {
  return requests.find((item) => item.id === requestId) ?? null;
}

export function getOffersByRequestId(requestId: string) {
  return offers.filter((item) => item.requestId === requestId);
}

export function getFreightByRequestId(requestId: string) {
  return freightRecords.filter((item) => item.requestId === requestId);
}

export function getOperationByRequestId(requestId: string) {
  return operations.find((item) => item.requestId === requestId) ?? null;
}

export function getOfferById(offerId?: string) {
  if (!offerId) return null;
  return offers.find((item) => item.id === offerId) ?? null;
}

export function getFreightById(freightId?: string) {
  if (!freightId) return null;
  return freightRecords.find((item) => item.id === freightId) ?? null;
}

export function getOperationById(operationId?: string) {
  if (!operationId) return null;
  return operations.find((item) => item.id === operationId) ?? null;
}

export function getRequestLifecycle(requestId: string) {
  const request = getRequestById(requestId);
  const relatedOffers = getOffersByRequestId(requestId);
  const relatedFreight = getFreightByRequestId(requestId);
  const relatedOperation = getOperationByRequestId(requestId);

  return {
    request,
    relatedOffers,
    relatedFreight,
    relatedOperation,
  };
}