"use client";

import Link from "next/link";
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
import {
  getLivestockLabel,
  getPriorityLabel,
  getRequestStatusLabel,
} from "@/lib/mock/requests";

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
      "Vista consolidada de todas las ofertas emitidas, con foco en conversión, volumen comprometido, competitividad económica y avance comercial por solicitud.",
    empty: "No hay ofertas registradas en el sistema.",
  },
  frigorifico: {
    kicker: "Ofertas recibidas",
    title: "Evaluación de ofertas sobre tus solicitudes",
    description:
      "Comparación ejecutiva de propuestas de abastecimiento y logística, con señales de precio, tiempo de respuesta, shortlist, negociación y adjudicación.",
    empty: "No hay ofertas recibidas para tus solicitudes.",
  },
  productor: {
    kicker: "Mis ofertas",
    title: "Seguimiento de ofertas enviadas",
    description:
      "Control de tus propuestas comerciales dentro del marketplace, con visibilidad clara de lectura, shortlist, negociación y resultado final.",
    empty: "Todavía no has enviado ofertas.",
  },
  transportista: {
    kicker: "Propuestas logísticas",
    title: "Seguimiento de propuestas de transporte",
    description:
      "Control de propuestas logísticas enviadas o disponibles para ejecución, con foco en asignación, negociación, cierre y conexión con la operación.",
    empty: "No hay propuestas logísticas visibles.",
  },
};

const STATUS_WEIGHT: Record<OfferRecord["status"], number> = {
  accepted: 8,
  negotiating: 7,
  shortlisted: 6,
  viewed: 5,
  sent: 4,
  rejected: 3,
  expired: 2,
  withdrawn: 1,
};

const PRIORITY_WEIGHT: Record<OfferRecord["priority"], number> = {
  critical: 4,
  high: 3,
  medium: 2,
  normal: 1,
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

function matchesFilter(offer: OfferRecord, filter: ViewFilter) {
  if (filter === "all") return true;

  if (filter === "active") {
    return ["sent", "viewed", "shortlisted"].includes(offer.status);
  }

  if (filter === "negotiation") {
    return offer.status === "negotiating";
  }

  if (filter === "accepted") {
    return offer.status === "accepted";
  }

  if (filter === "rejected") {
    return ["rejected", "expired", "withdrawn"].includes(offer.status);
  }

  return true;
}

function getStatusTone(status: OfferRecord["status"]) {
  switch (status) {
    case "sent":
      return "border-white/10 bg-white/[0.04] text-white/72";
    case "viewed":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-100";
    case "shortlisted":
      return "border-amber-400/20 bg-amber-400/10 text-amber-100";
    case "negotiating":
      return "border-orange-400/20 bg-orange-400/10 text-orange-100";
    case "accepted":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
    case "rejected":
      return "border-red-400/20 bg-red-400/10 text-red-100";
    case "withdrawn":
    case "expired":
    default:
      return "border-white/10 bg-white/[0.04] text-white/58";
  }
}

function getPriorityTone(priority: OfferRecord["priority"]) {
  switch (priority) {
    case "critical":
      return "border-red-400/20 bg-red-400/10 text-red-100";
    case "high":
      return "border-amber-400/20 bg-amber-400/10 text-amber-100";
    case "medium":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-100";
    case "normal":
    default:
      return "border-white/10 bg-white/[0.04] text-white/68";
  }
}

function buildAction(role: UserRole, offer: OfferRecord) {
  if (role === "admin") return "Ver request";

  if (role === "frigorifico") {
    if (offer.status === "shortlisted") return "Comparar oferta";
    if (offer.status === "negotiating") return "Negociar";
    if (offer.status === "accepted") return "Ver adjudicación";
    return "Evaluar oferta";
  }

  if (role === "productor") {
    if (offer.status === "sent") return "Seguir respuesta";
    if (offer.status === "negotiating") return "Continuar negociación";
    if (offer.status === "accepted") return "Ver resultado";
    return "Ver contexto";
  }

  if (role === "transportista") {
    if (offer.status === "negotiating") return "Negociar logística";
    if (offer.status === "accepted") return "Ir a operación";
    return "Ver contexto";
  }

  return "Abrir";
}

function buildSortScore(offer: OfferRecord) {
  const scoreWeight = offer.score * 10;
  const statusWeight = STATUS_WEIGHT[offer.status] * 100;
  const priorityWeight = PRIORITY_WEIGHT[offer.priority] * 50;
  const valueWeight = Math.min(getOfferCommercialValue(offer), 100000) / 1000;

  return scoreWeight + statusWeight + priorityWeight + valueWeight;
}

function buildSummaryMetrics(items: OfferRecord[]) {
  const total = items.length;
  const accepted = items.filter((o) => o.status === "accepted").length;
  const negotiating = items.filter((o) => o.status === "negotiating").length;
  const shortlisted = items.filter((o) => o.status === "shortlisted").length;
  const totalValue = items.reduce((acc, o) => acc + getOfferCommercialValue(o), 0);

  return [
    { label: "Ofertas visibles", value: String(total) },
    { label: "En negociación", value: String(negotiating) },
    { label: "Shortlist / aceptadas", value: `${shortlisted} / ${accepted}` },
    { label: "Valor agregado", value: `USD ${totalValue.toLocaleString()}` },
  ];
}

function buildContextLabel(role: UserRole, offer: OfferRecord) {
  if (role === "frigorifico") return "Oferta recibida";
  if (role === "productor") return "Oferta emitida";
  if (role === "transportista") return "Propuesta logística";
  return "Oferta marketplace";
}

function OffersPageContent() {
  const session = getMockSession();
  const role = normalizeRole(session?.role);
  const copy = ROLE_COPY[role];

  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");

  const [view, setView] = useState<ViewFilter>("all");

  const request = requestId ? getRequestById(requestId) : null;
  const operation = requestId ? getOperationByRequestId(requestId) : null;

  const filtered = useMemo(() => {
    let base = filterByRole(offers, role, session?.company);

    if (requestId) {
      base = base.filter((offer) => offer.requestId === requestId);
    }

    return base
      .filter((offer) => matchesFilter(offer, view))
      .sort((a, b) => buildSortScore(b) - buildSortScore(a));
  }, [role, session?.company, requestId, view]);

  const summary = useMemo(() => buildSummaryMetrics(filtered), [filtered]);

  return (
    <section className="space-y-6 text-white">
      {request ? (
        <div className="overflow-hidden rounded-[26px] border border-cyan-400/20 bg-cyan-400/[0.06]">
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

          <div className="px-6 py-5">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-4xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300/90">
                  Contexto activo
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/requests/${request.id}`}
                    className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-400/15"
                  >
                    {request.id}
                  </Link>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72">
                    {getRequestStatusLabel(request.status)}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72">
                    {getPriorityLabel(request.priority)}
                  </span>
                </div>

                <Link href={`/requests/${request.id}`} className="group block">
                  <h3 className="mt-4 text-[24px] font-semibold tracking-[-0.03em] text-white transition group-hover:text-cyan-200">
                    {request.frigorifico}
                  </h3>
                </Link>

                <p className="mt-2 text-sm leading-7 text-white/62">
                  {getLivestockLabel(request.type)} · {request.origin} → {request.destination} ·{" "}
                  {request.quantity.toLocaleString()} {request.unit}
                </p>

                <p className="mt-2 text-sm leading-7 text-white/50">
                  Esta vista está filtrada por la solicitud seleccionada, permitiendo comparar
                  solamente las ofertas vinculadas a este ciclo comercial.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/requests/${request.id}`}
                  className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Ver request
                </Link>

                {operation ? (
                  <Link
                    href={`/operations?requestId=${request.id}`}
                    className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    Ver operación
                  </Link>
                ) : null}

                <Link
                  href="/requests"
                  className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Volver a solicitudes
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

        <div className="px-6 py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-400/80">
                {copy.kicker}
              </p>

              <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.04em] text-white">
                {copy.title}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">
                {copy.description}
              </p>
            </div>

            <div className="inline-flex flex-wrap rounded-full border border-white/10 bg-white/[0.03] p-1">
              {[
                { key: "all", label: "Todas" },
                { key: "active", label: "Activas" },
                { key: "negotiation", label: "Negociación" },
                { key: "accepted", label: "Aceptadas" },
                { key: "rejected", label: "Rechazadas" },
              ].map((filter) => {
                const active = view === filter.key;

                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setView(filter.key as ViewFilter)}
                    className={[
                      "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-200",
                      active
                        ? "bg-cyan-400/10 text-cyan-100"
                        : "text-white/45 hover:text-white/80",
                    ].join(" ")}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <article
            key={item.label}
            className="rounded-[22px] border border-white/10 bg-white/[0.03] px-5 py-4"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
              {item.label}
            </p>
            <p className="mt-3 text-[24px] font-semibold tracking-[-0.03em] text-white">
              {item.value}
            </p>
          </article>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] px-6 py-8">
            <p className="text-sm leading-7 text-white/58">{copy.empty}</p>
          </div>
        ) : (
          filtered.map((offer) => {
            const value = getOfferCommercialValue(offer);
            const linkedRequest = getRequestById(offer.requestId);
            const linkedOperation = getOperationByRequestId(offer.requestId);

            return (
              <article
                key={offer.id}
                className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]"
              >
                <div className="border-b border-white/8 px-6 py-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72">
                          {offer.id}
                        </span>

                        <span
                          className={[
                            "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                            getStatusTone(offer.status),
                          ].join(" ")}
                        >
                          {getOfferStatusLabel(offer.status)}
                        </span>

                        <span
                          className={[
                            "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                            getPriorityTone(offer.priority),
                          ].join(" ")}
                        >
                          {getOfferPriorityLabel(offer.priority)}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/62">
                          {buildContextLabel(role, offer)}
                        </span>
                      </div>

                      <h3 className="mt-4 text-[22px] font-semibold tracking-[-0.03em] text-white">
                        {offer.supplierName}
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-white/58">
                        {offer.origin} → {offer.destination} · {offer.quantityOffered.toLocaleString()}{" "}
                        {offer.unit} · {getOfferKindLabel(offer.kind)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                      <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-left xl:text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                          Valor comercial
                        </p>
                        <p className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
                          USD {value.toLocaleString()}
                        </p>
                        <p className="mt-1 text-xs text-white/42">Score {offer.score}</p>
                      </div>

                      <Link
                        href={`/requests/${offer.requestId}`}
                        className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        {buildAction(role, offer)}
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 px-6 py-6 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                          Tipo
                        </p>
                        <p className="mt-3 text-[18px] font-semibold text-white">
                          {getOfferKindLabel(offer.kind)}
                        </p>
                        <p className="mt-2 text-xs text-white/45">Naturaleza de la propuesta</p>
                      </article>

                      <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                          Respuesta
                        </p>
                        <p className="mt-3 text-[18px] font-semibold text-white">
                          {getOfferResponseLabel(offer.responseTimeHours)}
                        </p>
                        <p className="mt-2 text-xs text-white/45">Tiempo declarado de respuesta</p>
                      </article>

                      <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                          Cantidad
                        </p>
                        <p className="mt-3 text-[18px] font-semibold text-white">
                          {offer.quantityOffered.toLocaleString()} {offer.unit}
                        </p>
                        <p className="mt-2 text-xs text-white/45">Volumen comprometido</p>
                      </article>

                      <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                          Estado
                        </p>
                        <p className="mt-3 text-[18px] font-semibold text-white">
                          {getOfferStatusLabel(offer.status)}
                        </p>
                        <p className="mt-2 text-xs text-white/45">Momento actual del proceso</p>
                      </article>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <Link
                        href={`/requests/${offer.requestId}`}
                        className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.05]"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                          Request asociada
                        </p>
                        <p className="mt-3 text-[18px] font-semibold text-white">
                          {linkedRequest ? linkedRequest.id : offer.requestId}
                        </p>
                        <p className="mt-2 text-xs text-white/45">
                          Abrir detalle completo del ciclo
                        </p>
                      </Link>

                      <Link
                        href={`/offers?requestId=${offer.requestId}`}
                        className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.05]"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                          Grupo de offers
                        </p>
                        <p className="mt-3 text-[18px] font-semibold text-white">
                          {offer.requestId}
                        </p>
                        <p className="mt-2 text-xs text-white/45">
                          Ver todas las ofertas de esta solicitud
                        </p>
                      </Link>

                      <Link
                        href={`/operations?requestId=${offer.requestId}`}
                        className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.05]"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                          Operation
                        </p>
                        <p className="mt-3 text-[18px] font-semibold text-white">
                          {linkedOperation ? linkedOperation.id : "No creada"}
                        </p>
                        <p className="mt-2 text-xs text-white/45">
                          Abrir consolidación operacional
                        </p>
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <article className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                        Lectura comercial
                      </p>

                      <div className="mt-4 space-y-3 text-sm text-white/58">
                        <p>
                          <span className="font-medium text-white/82">Proveedor:</span>{" "}
                          {offer.supplierName}
                        </p>
                        <p>
                          <span className="font-medium text-white/82">Kind:</span>{" "}
                          {getOfferKindLabel(offer.kind)}
                        </p>
                        <p>
                          <span className="font-medium text-white/82">Prioridad:</span>{" "}
                          {getOfferPriorityLabel(offer.priority)}
                        </p>
                        <p>
                          <span className="font-medium text-white/82">Tiempo de respuesta:</span>{" "}
                          {getOfferResponseLabel(offer.responseTimeHours)}
                        </p>
                      </div>
                    </article>

                    <article className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                        Contexto de la request
                      </p>

                      <div className="mt-4 space-y-3 text-sm text-white/58">
                        <p>
                          <span className="font-medium text-white/82">Solicitud:</span>{" "}
                          {linkedRequest ? linkedRequest.id : offer.requestId}
                        </p>
                        <p>
                          <span className="font-medium text-white/82">Frigorífico:</span>{" "}
                          {linkedRequest ? linkedRequest.frigorifico : "No disponible"}
                        </p>
                        <p>
                          <span className="font-medium text-white/82">Estado:</span>{" "}
                          {linkedRequest
                            ? getRequestStatusLabel(linkedRequest.status)
                            : "No disponible"}
                        </p>
                        <p>
                          <span className="font-medium text-white/82">Prioridad request:</span>{" "}
                          {linkedRequest
                            ? getPriorityLabel(linkedRequest.priority)
                            : "No disponible"}
                        </p>
                      </div>
                    </article>

                    <article className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                        Nota operativa
                      </p>

                      <p className="mt-3 text-sm leading-7 text-white/58">
                        {linkedRequest
                          ? `${linkedRequest.frigorifico} requiere ${getLivestockLabel(
                              linkedRequest.type
                            )} con destino ${linkedRequest.destination}. Esta oferta debe analizarse en relación con el estado actual de la solicitud y su posible consolidación operacional.`
                          : "No hay contexto adicional disponible para esta oferta dentro del mock actual."}
                      </p>
                    </article>
                  </div>
                </div>
              </article>
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