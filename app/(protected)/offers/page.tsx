"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getMockSession } from "@/lib/mock/session";
import type { UserRole } from "@/lib/mock/users";
import {
  offers,
  getOfferCommercialValue,
  getOfferKindLabel,
  getOfferPriorityLabel,
  getOfferResponseLabel,
  getOfferStatusLabel,
  type OfferRecord,
} from "@/lib/mock/offers";

import {
  getRequestById,
  getOperationByRequestId,
} from "@/lib/mock/relations";

type ViewFilter = "all" | "active" | "negotiation" | "accepted" | "rejected";

function normalizeRole(role: unknown): UserRole {
  if (role === "admin") return "admin";
  if (role === "frigorifico") return "frigorifico";
  if (role === "productor") return "productor";
  if (role === "transportista") return "transportista";
  return "admin";
}

function getCompanySlug(company?: string) {
  if (!company) return "";
  return company
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function filterByRole(items: OfferRecord[], role: UserRole, company?: string) {
  if (role === "admin") return items;

  if (role === "frigorifico") {
    const slug = getCompanySlug(company);
    return items.filter((o) => o.frigorificoSlug === slug);
  }

  if (role === "productor") {
    return items.filter((o) => o.supplierRole === "productor");
  }

  if (role === "transportista") {
    return items.filter((o) => o.supplierRole === "transportista");
  }

  return items;
}

function matchesFilter(o: OfferRecord, filter: ViewFilter) {
  if (filter === "all") return true;

  if (filter === "active") {
    return ["sent", "viewed", "shortlisted"].includes(o.status);
  }

  if (filter === "negotiation") return o.status === "negotiating";
  if (filter === "accepted") return o.status === "accepted";
  if (filter === "rejected")
    return ["rejected", "expired", "withdrawn"].includes(o.status);

  return true;
}

function getStatusTone(status: OfferRecord["status"]) {
  switch (status) {
    case "sent":
      return "bg-white/5 text-white/70 border-white/10";
    case "viewed":
      return "bg-cyan-400/10 text-cyan-100 border-cyan-400/20";
    case "shortlisted":
      return "bg-amber-400/10 text-amber-100 border-amber-400/20";
    case "negotiating":
      return "bg-orange-400/10 text-orange-100 border-orange-400/20";
    case "accepted":
      return "bg-emerald-400/10 text-emerald-100 border-emerald-400/20";
    case "rejected":
      return "bg-red-400/10 text-red-100 border-red-400/20";
    default:
      return "bg-white/5 text-white/60 border-white/10";
  }
}

export default function OffersPage() {
  const session = getMockSession();
  const role = normalizeRole(session?.role);

  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");

  const [view, setView] = useState<ViewFilter>("all");

  const request = requestId ? getRequestById(requestId) : null;
  const operation = requestId ? getOperationByRequestId(requestId) : null;

  const filtered = useMemo(() => {
    let base = filterByRole(offers, role, session?.company);

    if (requestId) {
      base = base.filter((o) => o.requestId === requestId);
    }

    return base
      .filter((o) => matchesFilter(o, view))
      .sort((a, b) => b.score - a.score);
  }, [role, session?.company, view, requestId]);

  const summary = useMemo(() => {
    const total = filtered.length;
    const accepted = filtered.filter((o) => o.status === "accepted").length;
    const negotiating = filtered.filter((o) => o.status === "negotiating").length;
    const totalValue = filtered.reduce(
      (acc, o) => acc + getOfferCommercialValue(o),
      0
    );

    return [
      { label: "Ofertas", value: total },
      { label: "Negociación", value: negotiating },
      { label: "Aceptadas", value: accepted },
      { label: "Valor", value: `USD ${totalValue.toLocaleString()}` },
    ];
  }, [filtered]);

  return (
    <section className="space-y-6 text-white">
      {/* CONTEXTO */}
      {request && (
        <div className="border border-cyan-400/20 bg-cyan-400/5 rounded-2xl p-5">
          <p className="text-xs text-cyan-300 uppercase">Contexto</p>
          <h3 className="text-lg font-semibold mt-2">
            {request.id} · {request.frigorifico}
          </h3>

          <p className="text-sm text-white/60 mt-1">
            {request.origin} → {request.destination} ·{" "}
            {request.quantity.toLocaleString()} {request.unit}
          </p>

          <p className="text-xs mt-2 text-white/40">
            Estado operación:{" "}
            {operation ? operation.status : "Sin operación creada"}
          </p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summary.map((s) => (
          <div
            key={s.label}
            className="border border-white/10 bg-white/5 rounded-2xl p-4"
          >
            <p className="text-xs text-white/40">{s.label}</p>
            <p className="text-xl font-semibold mt-2">{s.value}</p>
          </div>
        ))}
      </div>

      {/* LISTA */}
      <div className="space-y-4">
        {filtered.map((o) => {
          const value = getOfferCommercialValue(o);

          return (
            <div
              key={o.id}
              className="border border-white/10 bg-white/5 rounded-2xl p-5"
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-white/40">{o.id}</p>
                  <h3 className="text-lg font-semibold mt-1">
                    {o.supplierName}
                  </h3>
                  <p className="text-sm text-white/50">
                    {o.origin} → {o.destination}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold">
                    USD {value.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/40">
                    Score {o.score}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4 flex-wrap">
                <span className={`px-2 py-1 rounded border text-xs ${getStatusTone(o.status)}`}>
                  {getOfferStatusLabel(o.status)}
                </span>

                <span className="px-2 py-1 border border-white/10 rounded text-xs text-white/60">
                  {getOfferKindLabel(o.kind)}
                </span>

                <span className="px-2 py-1 border border-white/10 rounded text-xs text-white/60">
                  {getOfferPriorityLabel(o.priority)}
                </span>

                <span className="px-2 py-1 border border-white/10 rounded text-xs text-white/60">
                  {getOfferResponseLabel(o.responseTimeHours)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}