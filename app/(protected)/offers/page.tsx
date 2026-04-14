"use client";

import { Suspense, useMemo, useState } from "react";
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
  getOperationByRequestId,
  getRequestById,
} from "@/lib/mock/relations";

type ViewFilter = "all" | "active" | "negotiation" | "accepted" | "rejected";

const ROLE_COPY: Record<
  UserRole,
  {
    kicker: string;
    title: string;
    description: string;
    empty: string;
  }
> = {
  admin: {
    kicker: "Ofertas",
    title: "Control global de ofertas del marketplace",
    description:
      "Vista consolidada de todas las ofertas emitidas, con foco en conversión, volumen, competitividad y estado comercial.",
    empty: "No hay ofertas registradas en el sistema.",
  },
  frigorifico: {
    kicker: "Ofertas recibidas",
    title: "Evaluación de ofertas sobre tus solicitudes",
    description:
      "Comparación de propuestas de proveedores y operadores logísticos, con señales de precio, volumen, rapidez y probabilidad de adjudicación.",
    empty: "No hay ofertas recibidas para tus solicitudes.",
  },
  productor: {
    kicker: "Mis ofertas",
    title: "Seguimiento de ofertas enviadas",
    description:
      "Control de tus propuestas comerciales en el marketplace, con visibilidad de estado, negociación y resultado.",
    empty: "Todavía no has enviado ofertas.",
  },
  transportista: {
    kicker: "Propuestas logísticas",
    title: "Seguimiento de propuestas de transporte",
    description:
      "Control de propuestas logísticas enviadas o disponibles para ejecución, con foco en asignación, negociación y operación.",
    empty: "No hay propuestas logísticas visibles.",
  },
};

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

  if (filter === "negotiation") {
    return o.status === "negotiating";
  }

  if (filter === "accepted") {
    return o.status === "accepted";
  }

  if (filter === "rejected") {
    return ["rejected", "expired", "withdrawn"].includes(o.status);
  }

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
    case "withdrawn":
    case "expired":
    default:
      return "bg-white/5 text-white/60 border-white/10";
  }
}

function buildAction(role: UserRole, o: OfferRecord) {
  if (role === "admin") return "Ver detalle";

  if (role === "frigorifico") {
    if (o.status === "shortlisted") return "Comparar";
    if (o.status === "negotiating") return "Negociar";
    if (o.status === "accepted") return "Ver adjudicación";
    return "Evaluar";
  }

  if (role === "productor") {
    if (o.status === "sent") return "Esperar respuesta";
    if (o.status === "negotiating") return "Continuar negociación";
    if (o.status === "accepted") return "Ver adjudicación";
    return "Ver detalle";
  }

  if (role === "transportista") {
    if (o.status === "negotiating") return "Negociar logística";
    if (o.status === "accepted") return "Ejecutar";
    return "Ver propuesta";
  }

  return "Abrir";
}

function OffersPageContent() {
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
  }, [role, session?.company, requestId, view]);

  const summary = useMemo(() => {
    const total = filtered.length;
    const accepted = filtered.filter((o) => o.status === "accepted").length;
    const negotiating = filtered.filter((o) => o.status === "negotiating").length;
    const totalValue = filtered.reduce((acc, o) => acc + getOfferCommercialValue(o), 0);

    return [
      { label: "Ofertas", value: total },
      { label: "Negociación", value: negotiating },
      { label: "Aceptadas", value: accepted },
      { label: "Valor", value: `USD ${totalValue.toLocaleString()}` },
    ];
  }, [filtered]);

  const copy = ROLE_COPY[role];

  return (
    <section className="space-y-6 text-white">
      {request ? (
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Contexto
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">
            {request.id} · {request.frigorifico}
          </h3>

          <p className="mt-1 text-sm text-white/60">
            {request.origin} → {request.destination} · {request.quantity.toLocaleString()}{" "}
            {request.unit}
          </p>

          <p className="mt-2 text-xs text-white/40">
            Operación: {operation ? operation.status : "Sin operación creada"}
          </p>
        </div>
      ) : null}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-widest text-cyan-400">
          {copy.kicker}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{copy.title}</h1>
        <p className="mt-3 max-w-3xl text-white/60">{copy.description}</p>

        <div className="mt-5 flex gap-2">
          {[
            { key: "all", label: "Todas" },
            { key: "active", label: "Activas" },
            { key: "negotiation", label: "Negociación" },
            { key: "accepted", label: "Aceptadas" },
            { key: "rejected", label: "Rechazadas" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setView(f.key as ViewFilter)}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-200",
                view === f.key
                  ? "bg-cyan-400/20 text-cyan-200"
                  : "text-white/40 hover:text-white/80",
              ].join(" ")}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {summary.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-xs text-white/40">{s.label}</p>
            <p className="mt-2 text-xl font-semibold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/60">
            {copy.empty}
          </div>
        ) : (
          filtered.map((o) => {
            const value = getOfferCommercialValue(o);

            return (
              <div
                key={o.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-white/40">{o.id}</p>
                    <h3 className="mt-1 text-lg font-semibold text-white">
                      {o.supplierName}
                    </h3>
                    <p className="text-sm text-white/50">
                      {o.origin} → {o.destination}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-lg font-semibold text-white">
                      USD {value.toLocaleString()}
                    </p>
                    <p className="text-xs text-white/40">Score {o.score}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={`rounded border px-2 py-1 text-xs ${getStatusTone(o.status)}`}
                  >
                    {getOfferStatusLabel(o.status)}
                  </span>

                  <span className="rounded border border-white/10 px-2 py-1 text-xs text-white/60">
                    {getOfferKindLabel(o.kind)}
                  </span>

                  <span className="rounded border border-white/10 px-2 py-1 text-xs text-white/60">
                    {getOfferPriorityLabel(o.priority)}
                  </span>

                  <span className="rounded border border-white/10 px-2 py-1 text-xs text-white/60">
                    {getOfferResponseLabel(o.responseTimeHours)}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-white/40">
                    {o.quantityOffered.toLocaleString()} {o.unit}
                  </p>

                  <button className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10">
                    {buildAction(role, o)}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default function OffersPage() {
  return (
    <Suspense
      fallback={
        <section className="space-y-6 text-white">
          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] px-6 py-8">
            <p className="text-sm leading-7 text-white/58">Cargando ofertas...</p>
          </div>
        </section>
      }
    >
      <OffersPageContent />
    </Suspense>
  );
}