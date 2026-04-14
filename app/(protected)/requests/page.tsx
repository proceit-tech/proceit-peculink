"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getMockSession } from "@/lib/mock/session";
import type { UserRole } from "@/lib/mock/users";
import {
  requests,
  getCoveragePercent,
  getCoverageLabel,
  getEstimatedGrossValue,
  getLivestockLabel,
  getOpenGap,
  getPriorityLabel,
  getRequestStatusLabel,
  type RequestRecord,
} from "@/lib/mock/requests";
import {
  getFreightByRequestId,
  getOffersByRequestId,
  getOperationByRequestId,
} from "@/lib/mock/relations";

type ViewFilter = "all" | "open" | "attention" | "covered" | "closed";

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
    kicker: "Solicitudes",
    title: "Control global de solicitudes del marketplace",
    description:
      "Vista ejecutiva de toda la demanda activa, nivel de cobertura, tracción comercial y estado logístico consolidado.",
    empty: "No hay solicitudes visibles para administración.",
  },
  frigorifico: {
    kicker: "Mis solicitudes",
    title: "Gestión de demanda propia del frigorífico",
    description:
      "Control completo de las solicitudes emitidas por tu operación, con foco en cobertura, ofertas recibidas, urgencia y preparación logística.",
    empty: "Todavía no hay solicitudes creadas por este frigorífico.",
  },
  productor: {
    kicker: "Oportunidades",
    title: "Solicitudes disponibles para ofertar",
    description:
      "Lectura comercial de oportunidades abiertas del marketplace, priorizadas por cobertura, urgencia, volumen y potencial de adjudicación.",
    empty: "No hay oportunidades visibles para este productor.",
  },
  transportista: {
    kicker: "Cargas derivadas",
    title: "Solicitudes con necesidad logística activa",
    description:
      "Vista enfocada en solicitudes que requieren coordinación de transporte, con señales de asignación, gap operativo y ventanas de ejecución.",
    empty: "No hay solicitudes con necesidad logística visibles para este transportista.",
  },
};

const PRIORITY_WEIGHT: Record<RequestRecord["priority"], number> = {
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

function getCurrentCompanySlug(company?: string): string {
  if (!company) return "";

  return company
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getStatusTone(status: RequestRecord["status"]) {
  switch (status) {
    case "open":
      return "border-white/10 bg-white/[0.04] text-white/75";
    case "receiving_offers":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-100";
    case "negotiating":
      return "border-amber-400/20 bg-amber-400/10 text-amber-100";
    case "partially_covered":
      return "border-orange-400/20 bg-orange-400/10 text-orange-100";
    case "covered":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
    case "pending_transport":
      return "border-violet-400/20 bg-violet-400/10 text-violet-100";
    case "in_operation":
      return "border-sky-400/20 bg-sky-400/10 text-sky-100";
    case "closed":
      return "border-white/10 bg-white/[0.04] text-white/60";
    case "cancelled":
    default:
      return "border-red-400/20 bg-red-400/10 text-red-100";
  }
}

function getPriorityTone(priority: RequestRecord["priority"]) {
  switch (priority) {
    case "critical":
      return "border-red-400/20 bg-red-400/10 text-red-100";
    case "high":
      return "border-amber-400/20 bg-amber-400/10 text-amber-100";
    case "medium":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-100";
    case "normal":
    default:
      return "border-white/10 bg-white/[0.04] text-white/70";
  }
}

function matchesViewFilter(request: RequestRecord, filter: ViewFilter) {
  if (filter === "all") return true;

  if (filter === "open") {
    return ["open", "receiving_offers", "negotiating"].includes(request.status);
  }

  if (filter === "attention") {
    return (
      request.priority === "critical" ||
      request.priority === "high" ||
      getCoveragePercent(request) < 50 ||
      request.status === "pending_transport"
    );
  }

  if (filter === "covered") {
    return ["covered", "pending_transport", "in_operation"].includes(request.status);
  }

  if (filter === "closed") {
    return ["closed", "cancelled"].includes(request.status);
  }

  return true;
}

function filterRequestsByRole(
  items: RequestRecord[],
  role: UserRole,
  company?: string
): RequestRecord[] {
  if (role === "admin") return items;

  if (role === "frigorifico") {
    const slug = getCurrentCompanySlug(company);
    return items.filter((item) => item.frigorificoSlug === slug);
  }

  if (role === "productor") {
    return items.filter((item) =>
      ["open", "receiving_offers", "negotiating", "partially_covered"].includes(item.status)
    );
  }

  if (role === "transportista") {
    return items.filter(
      (item) =>
        item.transportRequired &&
        item.visibleToTransportistas &&
        ["covered", "pending_transport", "in_operation", "partially_covered"].includes(item.status)
    );
  }

  return items;
}

function buildRoleSpecificActionLabel(role: UserRole, request: RequestRecord) {
  if (role === "admin") return "Ver detalle";

  if (role === "frigorifico") {
    if (request.status === "open" || request.status === "receiving_offers") {
      return "Gestionar solicitud";
    }
    if (request.status === "pending_transport") {
      return "Coordinar transporte";
    }
    return "Abrir solicitud";
  }

  if (role === "productor") {
    if (["open", "receiving_offers"].includes(request.status)) {
      return "Analizar oportunidad";
    }
    if (request.status === "negotiating") {
      return "Seguir negociación";
    }
    return "Ver oportunidad";
  }

  if (role === "transportista") {
    if (request.status === "pending_transport" || request.status === "covered") {
      return "Ver detalle logístico";
    }
    if (request.status === "in_operation") {
      return "Seguir operación";
    }
    return "Ver carga";
  }

  return "Abrir";
}

function buildSummaryMetrics(items: RequestRecord[], role: UserRole) {
  const total = items.length;
  const totalVolume = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalCovered = items.reduce((acc, item) => acc + item.coveredQuantity, 0);
  const totalOffers = items.reduce((acc, item) => acc + item.offersCount, 0);
  const critical = items.filter((item) => item.priority === "critical").length;
  const pendingTransport = items.filter((item) => item.status === "pending_transport").length;
  const avgCoverage = totalVolume > 0 ? Math.round((totalCovered / totalVolume) * 100) : 0;

  if (role === "admin") {
    return [
      { label: "Solicitudes visibles", value: String(total) },
      { label: "Volumen total", value: totalVolume.toLocaleString() },
      { label: "Cobertura promedio", value: `${avgCoverage}%` },
      { label: "Críticas / transporte", value: `${critical} / ${pendingTransport}` },
    ];
  }

  if (role === "frigorifico") {
    return [
      { label: "Mis solicitudes", value: String(total) },
      { label: "Volumen demandado", value: totalVolume.toLocaleString() },
      { label: "Ofertas recibidas", value: totalOffers.toLocaleString() },
      { label: "Cobertura media", value: `${avgCoverage}%` },
    ];
  }

  if (role === "productor") {
    return [
      { label: "Oportunidades visibles", value: String(total) },
      { label: "Volumen disponible", value: totalVolume.toLocaleString() },
      { label: "Solicitudes urgentes", value: String(critical) },
      { label: "Cobertura actual", value: `${avgCoverage}%` },
    ];
  }

  return [
    { label: "Solicitudes logísticas", value: String(total) },
    { label: "Volumen asociado", value: totalVolume.toLocaleString() },
    { label: "Pendientes de transporte", value: String(pendingTransport) },
    { label: "Cobertura comercial", value: `${avgCoverage}%` },
  ];
}

function buildSortScore(request: RequestRecord) {
  const priorityScore = PRIORITY_WEIGHT[request.priority] * 1000;
  const statusBoost =
    request.status === "pending_transport"
      ? 350
      : request.status === "receiving_offers"
        ? 260
        : request.status === "negotiating"
          ? 220
          : request.status === "partially_covered"
            ? 180
            : request.status === "open"
              ? 140
              : request.status === "covered"
                ? 90
                : request.status === "in_operation"
                  ? 60
                  : 20;

  const coveragePenalty = 100 - Math.min(getCoveragePercent(request), 100);
  const gapBoost = Math.min(getOpenGap(request), 1000);
  const transportBoost = request.transportRequired ? 70 : 0;

  return priorityScore + statusBoost + coveragePenalty + gapBoost + transportBoost;
}

export default function RequestsPage() {
  const session = getMockSession();
  const role = normalizeRole(session?.role);
  const copy = ROLE_COPY[role];

  const [view, setView] = useState<ViewFilter>("all");

  const visibleRequests = useMemo(() => {
    const scoped = filterRequestsByRole(requests, role, session?.company);

    return scoped
      .filter((item) => matchesViewFilter(item, view))
      .sort((a, b) => buildSortScore(b) - buildSortScore(a));
  }, [role, session?.company, view]);

  const summary = useMemo(() => buildSummaryMetrics(visibleRequests, role), [visibleRequests, role]);

  return (
    <section className="space-y-6 text-white">
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
                { key: "open", label: "Abiertas" },
                { key: "attention", label: "Atención" },
                { key: "covered", label: "Cubiertas" },
                { key: "closed", label: "Cerradas" },
              ].map((item) => {
                const active = item.key === view;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setView(item.key as ViewFilter)}
                    className={[
                      "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-200",
                      active
                        ? "bg-cyan-400/10 text-cyan-100"
                        : "text-white/45 hover:text-white/80",
                    ].join(" ")}
                  >
                    {item.label}
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
        {visibleRequests.length === 0 ? (
          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] px-6 py-8">
            <p className="text-sm leading-7 text-white/58">{copy.empty}</p>
          </div>
        ) : (
          visibleRequests.map((request) => {
            const coveragePercent = getCoveragePercent(request);
            const gap = getOpenGap(request);
            const gross = getEstimatedGrossValue(request);

            const relatedOffers = getOffersByRequestId(request.id);
            const relatedFreight = getFreightByRequestId(request.id);
            const relatedOperation = getOperationByRequestId(request.id);

            return (
              <article
                key={request.id}
                className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]"
              >
                <div className="border-b border-white/8 px-6 py-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/requests/${request.id}`}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-100"
                        >
                          {request.id}
                        </Link>

                        <span
                          className={[
                            "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                            getStatusTone(request.status),
                          ].join(" ")}
                        >
                          {getRequestStatusLabel(request.status)}
                        </span>

                        <span
                          className={[
                            "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                            getPriorityTone(request.priority),
                          ].join(" ")}
                        >
                          {getPriorityLabel(request.priority)}
                        </span>
                      </div>

                      <Link href={`/requests/${request.id}`} className="group block">
                        <h3 className="mt-4 text-[22px] font-semibold tracking-[-0.03em] text-white transition group-hover:text-cyan-300">
                          {request.frigorifico}
                        </h3>
                      </Link>

                      <p className="mt-2 text-sm leading-7 text-white/58">
                        {getLivestockLabel(request.type)} · {request.quantity.toLocaleString()}{" "}
                        {request.unit} · origen {request.origin} · destino {request.destination}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                        Necesario para {request.neededBy}
                      </span>

                      <Link
                        href={`/requests/${request.id}`}
                        className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
                      >
                        {buildRoleSpecificActionLabel(role, request)}
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 px-6 py-6 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                          Cobertura
                        </p>
                        <p className="mt-3 text-[22px] font-semibold text-white">
                          {coveragePercent}%
                        </p>
                        <p className="mt-2 text-xs text-white/45">{getCoverageLabel(request)}</p>
                      </article>

                      <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                          Gap pendiente
                        </p>
                        <p className="mt-3 text-[22px] font-semibold text-white">
                          {gap.toLocaleString()}
                        </p>
                        <p className="mt-2 text-xs text-white/45">Volumen aún no cubierto</p>
                      </article>

                      <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                          Offers
                        </p>
                        <p className="mt-3 text-[22px] font-semibold text-white">
                          {request.offersCount}
                        </p>
                        <p className="mt-2 text-xs text-white/45">Tracción comercial actual</p>
                      </article>

                      <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                          Transporte
                        </p>
                        <p className="mt-3 text-[22px] font-semibold text-white">
                          {request.assignedTransportCount}
                        </p>
                        <p className="mt-2 text-xs text-white/45">Asignaciones vinculadas</p>
                      </article>
                    </div>

                    <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-white/60">Cobertura comercial acumulada</span>
                        <span className="font-semibold text-white">
                          {request.coveredQuantity.toLocaleString()} /{" "}
                          {request.quantity.toLocaleString()}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full bg-cyan-400"
                          style={{ width: `${coveragePercent}%` }}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-white/42">
                        <span>Creada el {request.createdAt}</span>
                        <span>{getCoverageLabel(request)}</span>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <Link
                        href={`/offers?requestId=${request.id}`}
                        className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.05]"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                          Offers relacionadas
                        </p>
                        <p className="mt-3 text-[22px] font-semibold text-white">
                          {relatedOffers.length}
                        </p>
                        <p className="mt-2 text-xs text-white/45">
                          Abrir propuestas vinculadas
                        </p>
                      </Link>

                      <Link
                        href={`/freight?requestId=${request.id}`}
                        className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.05]"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                          Freight relacionado
                        </p>
                        <p className="mt-3 text-[22px] font-semibold text-white">
                          {relatedFreight.length}
                        </p>
                        <p className="mt-2 text-xs text-white/45">Abrir capa logística</p>
                      </Link>

                      <Link
                        href={`/operations?requestId=${request.id}`}
                        className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.05]"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                          Operation
                        </p>
                        <p className="mt-3 text-[18px] font-semibold text-white">
                          {relatedOperation ? relatedOperation.id : "No creada"}
                        </p>
                        <p className="mt-2 text-xs text-white/45">
                          Abrir operación consolidada
                        </p>
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <article className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                        Valor bruto estimado
                      </p>
                      <p className="mt-3 text-[24px] font-semibold tracking-[-0.03em] text-white">
                        {gross > 0 ? `USD ${gross.toLocaleString()}` : "—"}
                      </p>
                      <p className="mt-2 text-sm text-white/52">
                        Target{" "}
                        {request.priceTarget
                          ? `USD ${request.priceTarget.toLocaleString()}`
                          : "no definido"}
                      </p>
                    </article>

                    <article className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                        Lectura operacional
                      </p>

                      <div className="mt-4 space-y-3 text-sm text-white/58">
                        <p>
                          <span className="font-medium text-white/82">Frigorífico:</span>{" "}
                          {request.frigorifico}
                        </p>
                        <p>
                          <span className="font-medium text-white/82">Tipo:</span>{" "}
                          {getLivestockLabel(request.type)}
                        </p>
                        <p>
                          <span className="font-medium text-white/82">Prioridad:</span>{" "}
                          {getPriorityLabel(request.priority)}
                        </p>
                        <p>
                          <span className="font-medium text-white/82">Logística requerida:</span>{" "}
                          {request.transportRequired ? "Sí" : "No"}
                        </p>
                      </div>
                    </article>

                    <article className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                        Nota operativa
                      </p>
                      <p className="mt-3 text-sm leading-7 text-white/58">
                        {request.notes ?? "Sin observaciones registradas."}
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