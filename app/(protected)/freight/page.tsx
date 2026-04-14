"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getMockSession } from "@/lib/mock/session";
import type { UserRole } from "@/lib/mock/users";
import {
  freightRecords,
  getFreightAssignmentPercent,
  getFreightGap,
  getFreightPriorityLabel,
  getFreightStatusLabel,
  getFreightValue,
  getVehicleTypeLabel,
  type FreightRecord,
} from "@/lib/mock/freight";
import {
  getOperationByRequestId,
  getRequestById,
} from "@/lib/mock/relations";

type ViewFilter = "all" | "open" | "attention" | "assigned" | "completed";

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
    kicker: "Transporte",
    title: "Control global de ejecución logística",
    description:
      "Vista ejecutiva de toda la capa logística del marketplace, con foco en asignación, cumplimiento, cobertura y capacidad operativa.",
    empty: "No hay registros logísticos visibles para administración.",
  },
  frigorifico: {
    kicker: "Mi logística",
    title: "Control de transporte sobre tus operaciones",
    description:
      "Seguimiento de cargas vinculadas a tus solicitudes, con foco en propuesta, asignación, programación y cumplimiento de entrega.",
    empty: "No hay operaciones logísticas visibles para este frigorífico.",
  },
  productor: {
    kicker: "Seguimiento logístico",
    title: "Visibilidad de transporte sobre operaciones adjudicadas",
    description:
      "Lectura de la capa logística asociada a tus operaciones, para validar avance, asignación y nivel de cumplimiento.",
    empty: "No hay registros logísticos visibles para este productor.",
  },
  transportista: {
    kicker: "Mis cargas",
    title: "Gestión operativa de propuestas y viajes",
    description:
      "Control de cargas visibles, asignadas y ejecutadas por tu operación logística, con foco en ocupación, agenda y cumplimiento.",
    empty: "No hay cargas visibles para este transportista.",
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

function filterByRole(items: FreightRecord[], role: UserRole, company?: string) {
  if (role === "admin") return items;

  if (role === "frigorifico") {
    const slug = getCompanySlug(company);
    return items.filter((item) => item.frigorificoSlug === slug);
  }

  if (role === "productor") {
    return items.filter((item) =>
      ["assigned", "scheduled", "in_transit", "delivered", "completed"].includes(item.status)
    );
  }

  if (role === "transportista") {
    const slug = getCompanySlug(company);
    return items.filter(
      (item) =>
        item.visibleToTransportistas &&
        (item.transportistaSlug === slug ||
          !item.transportistaSlug ||
          ["awaiting_proposals", "proposal_received", "assigned", "scheduled", "in_transit"].includes(
            item.status
          ))
    );
  }

  return items;
}

function matchesFilter(item: FreightRecord, filter: ViewFilter) {
  if (filter === "all") return true;

  if (filter === "open") {
    return ["open", "awaiting_proposals", "proposal_received"].includes(item.status);
  }

  if (filter === "attention") {
    return (
      item.priority === "critical" ||
      item.priority === "high" ||
      getFreightAssignmentPercent(item) < 60 ||
      item.status === "proposal_received"
    );
  }

  if (filter === "assigned") {
    return ["assigned", "scheduled", "in_transit"].includes(item.status);
  }

  if (filter === "completed") {
    return ["delivered", "completed"].includes(item.status);
  }

  return true;
}

function getStatusTone(status: FreightRecord["status"]) {
  switch (status) {
    case "open":
      return "border-white/10 bg-white/[0.04] text-white/70";
    case "awaiting_proposals":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-100";
    case "proposal_received":
      return "border-amber-400/20 bg-amber-400/10 text-amber-100";
    case "assigned":
      return "border-violet-400/20 bg-violet-400/10 text-violet-100";
    case "scheduled":
      return "border-sky-400/20 bg-sky-400/10 text-sky-100";
    case "in_transit":
      return "border-orange-400/20 bg-orange-400/10 text-orange-100";
    case "delivered":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
    case "completed":
      return "border-white/10 bg-white/[0.04] text-white/55";
    case "cancelled":
    default:
      return "border-red-400/20 bg-red-400/10 text-red-100";
  }
}

function getPriorityTone(priority: FreightRecord["priority"]) {
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

function buildSummary(items: FreightRecord[], role: UserRole) {
  const total = items.length;
  const active = items.filter((item) =>
    ["awaiting_proposals", "proposal_received", "assigned", "scheduled", "in_transit"].includes(
      item.status
    )
  ).length;
  const completed = items.filter((item) => ["delivered", "completed"].includes(item.status)).length;
  const value = items.reduce((acc, item) => acc + getFreightValue(item), 0);
  const pendingUnits = items.reduce((acc, item) => acc + getFreightGap(item), 0);

  if (role === "admin") {
    return [
      { label: "Registros visibles", value: String(total) },
      { label: "Operaciones activas", value: String(active) },
      { label: "Unidades pendientes", value: String(pendingUnits) },
      { label: "Valor logístico", value: `USD ${value.toLocaleString()}` },
    ];
  }

  if (role === "frigorifico") {
    return [
      { label: "Mi logística", value: String(total) },
      { label: "En ejecución", value: String(active) },
      { label: "Capacidad faltante", value: String(pendingUnits) },
      { label: "Costo estimado", value: `USD ${value.toLocaleString()}` },
    ];
  }

  if (role === "productor") {
    return [
      { label: "Operaciones visibles", value: String(total) },
      { label: "En ejecución", value: String(active) },
      { label: "Entregadas", value: String(completed) },
      { label: "Valor asociado", value: `USD ${value.toLocaleString()}` },
    ];
  }

  return [
    { label: "Cargas visibles", value: String(total) },
    { label: "Activas", value: String(active) },
    { label: "Completadas", value: String(completed) },
    { label: "Valor potencial", value: `USD ${value.toLocaleString()}` },
  ];
}

function buildAction(role: UserRole, item: FreightRecord) {
  if (role === "admin") return "Ver detalle";

  if (role === "frigorifico") {
    if (item.status === "awaiting_proposals") return "Buscar transporte";
    if (item.status === "proposal_received") return "Evaluar propuesta";
    if (item.status === "assigned") return "Confirmar agenda";
    return "Abrir logística";
  }

  if (role === "productor") {
    if (item.status === "in_transit") return "Seguir entrega";
    return "Ver avance";
  }

  if (role === "transportista") {
    if (item.status === "awaiting_proposals") return "Enviar propuesta";
    if (item.status === "proposal_received") return "Mejorar propuesta";
    if (item.status === "assigned" || item.status === "scheduled") return "Ejecutar";
    if (item.status === "in_transit") return "Seguir viaje";
    return "Ver carga";
  }

  return "Abrir";
}

function FreightPageContent() {
  const session = getMockSession();
  const role = normalizeRole(session?.role);
  const copy = ROLE_COPY[role];

  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");

  const request = requestId ? getRequestById(requestId) : null;
  const operation = requestId ? getOperationByRequestId(requestId) : null;

  const [view, setView] = useState<ViewFilter>("all");

  const visibleRecords = useMemo(() => {
    let base = filterByRole(freightRecords, role, session?.company);

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

  const summary = useMemo(() => buildSummary(visibleRecords, role), [visibleRecords, role]);

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
            Operación: {operation ? operation.status : "Sin operación"}
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
              { key: "open", label: "Abiertas" },
              { key: "attention", label: "Atención" },
              { key: "assigned", label: "Asignadas" },
              { key: "completed", label: "Completadas" },
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
        {visibleRecords.length === 0 ? (
          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] px-6 py-8">
            <p className="text-sm leading-7 text-white/58">{copy.empty}</p>
          </div>
        ) : (
          visibleRecords.map((item) => {
            const assignmentPercent = getFreightAssignmentPercent(item);
            const gap = getFreightGap(item);
            const value = getFreightValue(item);

            return (
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
                          {getFreightStatusLabel(item.status)}
                        </span>

                        <span
                          className={[
                            "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                            getPriorityTone(item.priority),
                          ].join(" ")}
                        >
                          {getFreightPriorityLabel(item.priority)}
                        </span>
                      </div>

                      <h3 className="mt-4 text-[22px] font-semibold tracking-[-0.03em] text-white">
                        {item.frigorifico}
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-white/58">
                        {item.origin} → {item.destination} · {item.distanceKm.toLocaleString()} km ·{" "}
                        {getVehicleTypeLabel(item.vehicleType)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                        Retiro {item.pickupDate}
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
                          Asignación
                        </p>
                        <p className="mt-3 text-[22px] font-semibold text-white">
                          {assignmentPercent}%
                        </p>
                        <p className="mt-2 text-xs text-white/45">
                          {item.assignedVehicles}/{item.requiredVehicles} unidades
                        </p>
                      </article>

                      <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                          Gap
                        </p>
                        <p className="mt-3 text-[22px] font-semibold text-white">
                          {gap}
                        </p>
                        <p className="mt-2 text-xs text-white/45">Unidades aún faltantes</p>
                      </article>

                      <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                          Valor
                        </p>
                        <p className="mt-3 text-[22px] font-semibold text-white">
                          USD {value.toLocaleString()}
                        </p>
                        <p className="mt-2 text-xs text-white/45">Costo logístico estimado/propuesto</p>
                      </article>

                      <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                          Cumplimiento
                        </p>
                        <p className="mt-3 text-[22px] font-semibold text-white">
                          {item.compliancePercent}%
                        </p>
                        <p className="mt-2 text-xs text-white/45">Nivel operativo registrado</p>
                      </article>
                    </div>

                    <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-white/60">Cobertura logística</span>
                        <span className="font-semibold text-white">
                          {item.assignedVehicles} / {item.requiredVehicles} vehículos
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full bg-cyan-400"
                          style={{ width: `${assignmentPercent}%` }}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-white/42">
                        <span>Entrega estimada {item.deliveryDate}</span>
                        <span>{assignmentPercent}% asignado</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <article className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                        Responsable logístico
                      </p>
                      <p className="mt-3 text-[22px] font-semibold tracking-[-0.03em] text-white">
                        {item.transportista ?? "Sin asignar"}
                      </p>
                      <p className="mt-2 text-sm text-white/52">
                        {item.transportistaEmail ?? "Aún sin operador confirmado"}
                      </p>
                    </article>

                    <article className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                        Lectura operativa
                      </p>
                      <div className="mt-4 space-y-3 text-sm text-white/58">
                        <p>
                          <span className="font-medium text-white/82">Carga:</span> {item.cargoType}
                        </p>
                        <p>
                          <span className="font-medium text-white/82">Cantidad:</span>{" "}
                          {item.quantity.toLocaleString()} {item.unit}
                        </p>
                        <p>
                          <span className="font-medium text-white/82">Vehículo:</span>{" "}
                          {getVehicleTypeLabel(item.vehicleType)}
                        </p>
                        <p>
                          <span className="font-medium text-white/82">Prioridad:</span>{" "}
                          {getFreightPriorityLabel(item.priority)}
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
            );
          })
        )}
      </div>
    </section>
  );
}

export default function FreightPage() {
  return (
    <Suspense
      fallback={
        <section className="space-y-6 text-white">
          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] px-6 py-8">
            <p className="text-sm leading-7 text-white/58">Cargando capa logística...</p>
          </div>
        </section>
      }
    >
      <FreightPageContent />
    </Suspense>
  );
}