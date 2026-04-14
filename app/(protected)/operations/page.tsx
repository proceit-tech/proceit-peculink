"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getMockSession } from "@/lib/mock/session";
import type { UserRole } from "@/lib/mock/users";
import {
  operations,
  getOperationGapLabel,
  getOperationPriorityLabel,
  getOperationStatusLabel,
  type OperationRecord,
} from "@/lib/mock/operations";
import { getRequestById } from "@/lib/mock/relations";

type ViewFilter = "all" | "active" | "attention" | "completed" | "logistics_gap";

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
    kicker: "Operaciones",
    title: "Control integral de operaciones del marketplace",
    description:
      "Vista consolidada de operaciones punta a punta, integrando demanda, oferta, transporte, cumplimiento y valor económico total.",
    empty: "No hay operaciones visibles para administración.",
  },
  frigorifico: {
    kicker: "Mis operaciones",
    title: "Control operativo de compras y ejecución",
    description:
      "Seguimiento de operaciones activadas por tu frigorífico, con foco en confirmación comercial, logística, recepción y cumplimiento final.",
    empty: "No hay operaciones visibles para este frigorífico.",
  },
  productor: {
    kicker: "Operaciones adjudicadas",
    title: "Seguimiento de operaciones comerciales activas",
    description:
      "Lectura de operaciones donde tus ofertas participan o resultaron adjudicadas, con foco en avance, cumplimiento y resultado.",
    empty: "No hay operaciones visibles para este productor.",
  },
  transportista: {
    kicker: "Operaciones logísticas",
    title: "Seguimiento de ejecución y cumplimiento de viajes",
    description:
      "Control de operaciones con capa logística visible para tu perfil, con foco en agenda, tránsito, entrega y cumplimiento operativo.",
    empty: "No hay operaciones visibles para este transportista.",
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

function filterByRole(items: OperationRecord[], role: UserRole, company?: string) {
  if (role === "admin") return items;

  const slug = getCompanySlug(company);

  if (role === "frigorifico") {
    return items.filter((item) => item.frigorificoSlug === slug);
  }

  if (role === "productor") {
    return items.filter((item) => item.supplierSlug === slug || !!item.supplyOfferId);
  }

  if (role === "transportista") {
    return items.filter(
      (item) =>
        item.transportistaSlug === slug ||
        (!!item.freightId &&
          ["awaiting_logistics", "scheduled", "in_transit", "received", "completed"].includes(
            item.status
          ))
    );
  }

  return items;
}

function matchesFilter(item: OperationRecord, filter: ViewFilter) {
  if (filter === "all") return true;

  if (filter === "active") {
    return ["created", "commercial_confirmed", "awaiting_logistics", "scheduled", "in_transit", "received"].includes(
      item.status
    );
  }

  if (filter === "attention") {
    return (
      item.priority === "critical" ||
      item.priority === "high" ||
      item.overallProgress < 50 ||
      item.logisticsProgress < 50
    );
  }

  if (filter === "completed") {
    return item.status === "completed";
  }

  if (filter === "logistics_gap") {
    return item.commercialProgress === 100 && item.logisticsProgress < 100;
  }

  return true;
}

function getStatusTone(status: OperationRecord["status"]) {
  switch (status) {
    case "created":
      return "border-white/10 bg-white/[0.04] text-white/72";
    case "commercial_confirmed":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-100";
    case "awaiting_logistics":
      return "border-amber-400/20 bg-amber-400/10 text-amber-100";
    case "scheduled":
      return "border-violet-400/20 bg-violet-400/10 text-violet-100";
    case "in_transit":
      return "border-orange-400/20 bg-orange-400/10 text-orange-100";
    case "received":
      return "border-sky-400/20 bg-sky-400/10 text-sky-100";
    case "completed":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
    case "cancelled":
    default:
      return "border-red-400/20 bg-red-400/10 text-red-100";
  }
}

function getPriorityTone(priority: OperationRecord["priority"]) {
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

function buildSummary(items: OperationRecord[], role: UserRole) {
  const total = items.length;
  const active = items.filter((item) => item.status !== "completed" && item.status !== "cancelled").length;
  const completed = items.filter((item) => item.status === "completed").length;
  const totalValue = items.reduce((acc, item) => acc + item.totalOperationValue, 0);
  const logisticsGap = items.filter(
    (item) => item.commercialProgress === 100 && item.logisticsProgress < 100
  ).length;

  if (role === "admin") {
    return [
      { label: "Operaciones visibles", value: String(total) },
      { label: "Operaciones activas", value: String(active) },
      { label: "Gap logístico", value: String(logisticsGap) },
      { label: "Valor total", value: `USD ${totalValue.toLocaleString()}` },
    ];
  }

  if (role === "frigorifico") {
    return [
      { label: "Mis operaciones", value: String(total) },
      { label: "En curso", value: String(active) },
      { label: "Recepciones completadas", value: String(completed) },
      { label: "Valor comprometido", value: `USD ${totalValue.toLocaleString()}` },
    ];
  }

  if (role === "productor") {
    return [
      { label: "Operaciones visibles", value: String(total) },
      { label: "Adjudicadas activas", value: String(active) },
      { label: "Completadas", value: String(completed) },
      { label: "Valor comercial", value: `USD ${totalValue.toLocaleString()}` },
    ];
  }

  return [
    { label: "Operaciones visibles", value: String(total) },
    { label: "Viajes activos", value: String(active) },
    { label: "Completadas", value: String(completed) },
    { label: "Valor asociado", value: `USD ${totalValue.toLocaleString()}` },
  ];
}

function buildAction(role: UserRole, item: OperationRecord) {
  if (role === "admin") return "Ver detalle";

  if (role === "frigorifico") {
    if (item.status === "created") return "Consolidar operación";
    if (item.status === "awaiting_logistics") return "Resolver logística";
    if (item.status === "received") return "Cerrar recepción";
    return "Seguir operación";
  }

  if (role === "productor") {
    if (item.status === "commercial_confirmed") return "Preparar entrega";
    if (item.status === "in_transit") return "Seguir despacho";
    return "Ver operación";
  }

  if (role === "transportista") {
    if (item.status === "awaiting_logistics") return "Tomar operación";
    if (item.status === "scheduled") return "Preparar salida";
    if (item.status === "in_transit") return "Seguir viaje";
    return "Ver ejecución";
  }

  return "Abrir";
}

function OperationsPageContent() {
  const session = getMockSession();
  const role = normalizeRole(session?.role);
  const copy = ROLE_COPY[role];

  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");

  const request = requestId ? getRequestById(requestId) : null;

  const [view, setView] = useState<ViewFilter>("all");

  const visibleOperations = useMemo(() => {
    let base = filterByRole(operations, role, session?.company);

    if (requestId) {
      base = base.filter((item) => item.requestId === requestId);
    }

    return base
      .filter((item) => matchesFilter(item, view))
      .sort((a, b) => {
        const priorityWeight = { critical: 4, high: 3, medium: 2, normal: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      });
  }, [role, session?.company, view, requestId]);

  const summary = useMemo(() => buildSummary(visibleOperations, role), [visibleOperations, role]);

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
        </div>
      ) : null}

      <div className="rounded-[26px] border border-white/10 bg-white/[0.03] px-6 py-6">
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

          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
            {[
              { key: "all", label: "Todas" },
              { key: "active", label: "Activas" },
              { key: "attention", label: "Atención" },
              { key: "completed", label: "Completadas" },
              { key: "logistics_gap", label: "Gap logístico" },
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
        {visibleOperations.length === 0 ? (
          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] px-6 py-8">
            <p className="text-sm leading-7 text-white/58">{copy.empty}</p>
          </div>
        ) : (
          visibleOperations.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]"
            >
              <div className="border-b border-white/8 px-6 py-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72">
                        {item.id}
                      </span>

                      <span
                        className={[
                          "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                          getStatusTone(item.status),
                        ].join(" ")}
                      >
                        {getOperationStatusLabel(item.status)}
                      </span>

                      <span
                        className={[
                          "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                          getPriorityTone(item.priority),
                        ].join(" ")}
                      >
                        {getOperationPriorityLabel(item.priority)}
                      </span>
                    </div>

                    <h3 className="mt-4 text-[22px] font-semibold tracking-[-0.03em] text-white">
                      {item.frigorifico}
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-white/58">
                      {item.origin} → {item.destination} · {item.quantity.toLocaleString()} {item.unit}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                      Entrega {item.deliveryDate ?? "pendiente"}
                    </span>

                    <button
                      type="button"
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
                    >
                      {buildAction(role, item)}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 px-6 py-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                        Progreso total
                      </p>
                      <p className="mt-3 text-[22px] font-semibold text-white">
                        {item.overallProgress}%
                      </p>
                      <p className="mt-2 text-xs text-white/45">{getOperationGapLabel(item)}</p>
                    </article>

                    <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                        Comercial
                      </p>
                      <p className="mt-3 text-[22px] font-semibold text-white">
                        {item.commercialProgress}%
                      </p>
                      <p className="mt-2 text-xs text-white/45">Madurez comercial</p>
                    </article>

                    <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                        Logística
                      </p>
                      <p className="mt-3 text-[22px] font-semibold text-white">
                        {item.logisticsProgress}%
                      </p>
                      <p className="mt-2 text-xs text-white/45">Ejecución logística</p>
                    </article>

                    <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                        Cumplimiento
                      </p>
                      <p className="mt-3 text-[22px] font-semibold text-white">
                        {item.compliancePercent}%
                      </p>
                      <p className="mt-2 text-xs text-white/45">Indicador operativo</p>
                    </article>
                  </div>

                  <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-white/60">Progreso general de operación</span>
                      <span className="font-semibold text-white">{item.overallProgress}%</span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-cyan-400"
                        style={{ width: `${item.overallProgress}%` }}
                      />
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-3 text-xs text-white/42">
                      <span>Creada {item.createdAt}</span>
                      <span>Retiro {item.pickupDate ?? "pendiente"}</span>
                      <span>Entrega {item.deliveryDate ?? "pendiente"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <article className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                      Valor económico
                    </p>
                    <p className="mt-3 text-[24px] font-semibold tracking-[-0.03em] text-white">
                      USD {item.totalOperationValue.toLocaleString()}
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-white/52">
                      <p>Comercial: USD {item.commercialValue.toLocaleString()}</p>
                      <p>Logística: USD {(item.freightValue ?? 0).toLocaleString()}</p>
                      <p>Margen estimado: {item.marginEstimate ? `${item.marginEstimate}%` : "—"}</p>
                    </div>
                  </article>

                  <article className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                      Participantes
                    </p>
                    <div className="mt-4 space-y-3 text-sm text-white/58">
                      <p>
                        <span className="font-medium text-white/82">Frigorífico:</span> {item.frigorifico}
                      </p>
                      <p>
                        <span className="font-medium text-white/82">Proveedor:</span> {item.supplierName}
                      </p>
                      <p>
                        <span className="font-medium text-white/82">Transportista:</span>{" "}
                        {item.transportista ?? "Sin asignar"}
                      </p>
                    </div>
                  </article>

                  <article className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                      Nota operativa
                    </p>
                    <p className="mt-3 text-sm leading-7 text-white/58">
                      {item.notes ?? "Sin observaciones registradas."}
                    </p>
                  </article>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default function OperationsPage() {
  return (
    <Suspense
      fallback={
        <section className="space-y-6 text-white">
          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] px-6 py-8">
            <p className="text-sm leading-7 text-white/58">Cargando operaciones...</p>
          </div>
        </section>
      }
    >
      <OperationsPageContent />
    </Suspense>
  );
}