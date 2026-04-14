"use client";

import Link from "next/link";
import {
  getCoveragePercent,
  getCoverageLabel,
  getLivestockLabel,
  getRequestStatusLabel,
  type RequestRecord,
} from "@/lib/mock/requests";
import {
  getOfferCommercialValue,
  getOfferKindLabel,
  getOfferStatusLabel,
  type OfferRecord,
} from "@/lib/mock/offers";
import {
  getFreightAssignmentPercent,
  getFreightStatusLabel,
  getVehicleTypeLabel,
  getFreightValue,
  type FreightRecord,
} from "@/lib/mock/freight";
import {
  getOperationGapLabel,
  getOperationStatusLabel,
  type OperationRecord,
} from "@/lib/mock/operations";

type Props = {
  request: RequestRecord;
  offers: OfferRecord[];
  freight: FreightRecord[];
  operation: OperationRecord | null;
};

function StepDot({ tone = "cyan" }: { tone?: "cyan" | "amber" | "violet" | "emerald" }) {
  const toneClass =
    tone === "amber"
      ? "bg-amber-400 shadow-[0_0_22px_rgba(251,191,36,0.45)]"
      : tone === "violet"
        ? "bg-violet-400 shadow-[0_0_22px_rgba(167,139,250,0.45)]"
        : tone === "emerald"
          ? "bg-emerald-400 shadow-[0_0_22px_rgba(52,211,153,0.45)]"
          : "bg-cyan-400 shadow-[0_0_22px_rgba(34,211,238,0.45)]";

  return <span className={["h-3.5 w-3.5 rounded-full", toneClass].join(" ")} />;
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-4">
      <p className="text-sm text-white/42">{text}</p>
    </div>
  );
}

function StepRail({ showLine = true, tone }: { showLine?: boolean; tone: "cyan" | "amber" | "violet" | "emerald" }) {
  return (
    <div className="flex flex-col items-center pt-2">
      <StepDot tone={tone} />
      {showLine ? <span className="mt-3 h-full min-h-[120px] w-px bg-white/10" /> : null}
    </div>
  );
}

export default function RequestLifecycleTimeline({
  request,
  offers,
  freight,
  operation,
}: Props) {
  const coverage = getCoveragePercent(request);
  const totalOfferValue = offers.reduce((acc, item) => acc + getOfferCommercialValue(item), 0);
  const totalFreightValue = freight.reduce((acc, item) => acc + getFreightValue(item), 0);
  const acceptedOffers = offers.filter((item) => item.status === "accepted").length;
  const activeFreight = freight.filter((item) =>
    ["assigned", "scheduled", "in_transit"].includes(item.status)
  ).length;

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.015)_100%)]">
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

      <div className="p-6">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-400/80">
            Lifecycle Timeline
          </p>

          <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-white">
            Flujo completo de la solicitud
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">
            Vista narrativa premium del ciclo completo: creación de la solicitud,
            respuesta comercial, capa logística y consolidación operacional.
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
              Cobertura request
            </p>
            <p className="mt-3 text-[22px] font-semibold text-white">{coverage}%</p>
            <p className="mt-2 text-xs text-white/45">{getCoverageLabel(request)}</p>
          </article>

          <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
              Valor offers
            </p>
            <p className="mt-3 text-[22px] font-semibold text-white">
              USD {totalOfferValue.toLocaleString()}
            </p>
            <p className="mt-2 text-xs text-white/45">{offers.length} propuestas registradas</p>
          </article>

          <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
              Valor freight
            </p>
            <p className="mt-3 text-[22px] font-semibold text-white">
              USD {totalFreightValue.toLocaleString()}
            </p>
            <p className="mt-2 text-xs text-white/45">{freight.length} bloques logísticos</p>
          </article>

          <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
              Operación final
            </p>
            <p className="mt-3 text-[22px] font-semibold text-white">
              {operation ? `${operation.overallProgress}%` : "Pendiente"}
            </p>
            <p className="mt-2 text-xs text-white/45">
              {operation ? getOperationGapLabel(operation) : "Sin operación consolidada"}
            </p>
          </article>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-[80px_1fr]">
            <StepRail tone="cyan" />

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
                    Step 01
                  </p>

                  <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
                    Request / Demanda
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-white/58">
                    {request.id} · {request.frigorifico} · {getLivestockLabel(request.type)} ·{" "}
                    {request.quantity.toLocaleString()} {request.unit}
                  </p>
                </div>

                <span className="inline-flex w-fit items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                  {getRequestStatusLabel(request.status)}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Cobertura
                  </p>
                  <p className="mt-3 text-[22px] font-semibold text-white">{coverage}%</p>
                  <p className="mt-2 text-xs text-white/45">{getCoverageLabel(request)}</p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Origen
                  </p>
                  <p className="mt-3 text-[18px] font-semibold text-white">{request.origin}</p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Destino
                  </p>
                  <p className="mt-3 text-[18px] font-semibold text-white">{request.destination}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[80px_1fr]">
            <StepRail tone="amber" />

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300">
                    Step 02
                  </p>

                  <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
                    Offers / Respuesta comercial
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-white/58">
                    Las ofertas muestran quién respondió, en qué condición, con qué volumen y con qué valor económico.
                  </p>
                </div>

                <Link
                  href={`/offers?requestId=${request.id}`}
                  className="inline-flex w-fit items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
                >
                  Ver offers relacionadas
                </Link>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Total offers
                  </p>
                  <p className="mt-3 text-[22px] font-semibold text-white">{offers.length}</p>
                  <p className="mt-2 text-xs text-white/45">Respuestas recibidas</p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Aceptadas
                  </p>
                  <p className="mt-3 text-[22px] font-semibold text-white">{acceptedOffers}</p>
                  <p className="mt-2 text-xs text-white/45">Ofertas adjudicadas</p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Valor agregado
                  </p>
                  <p className="mt-3 text-[22px] font-semibold text-white">
                    USD {totalOfferValue.toLocaleString()}
                  </p>
                  <p className="mt-2 text-xs text-white/45">Suma comercial observada</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {offers.length === 0 ? (
                  <EmptyBlock text="Esta solicitud todavía no tiene offers relacionadas." />
                ) : (
                  offers.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4"
                    >
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72">
                              {item.id}
                            </span>
                            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                              {getOfferStatusLabel(item.status)}
                            </span>
                          </div>

                          <h4 className="mt-3 text-[18px] font-semibold text-white">
                            {item.supplierName}
                          </h4>

                          <p className="mt-1 text-sm text-white/58">
                            {getOfferKindLabel(item.kind)} · {item.quantityOffered.toLocaleString()}{" "}
                            {item.unit}
                          </p>
                        </div>

                        <div className="text-left xl:text-right">
                          <p className="text-[18px] font-semibold text-white">
                            USD {getOfferCommercialValue(item).toLocaleString()}
                          </p>
                          <p className="mt-1 text-xs text-white/42">Score {item.score}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[80px_1fr]">
            <StepRail tone="violet" />

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300">
                    Step 03
                  </p>

                  <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
                    Freight / Capa logística
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-white/58">
                    Esta etapa muestra si la operación ya tiene cobertura logística, capacidad asignada y ruta de ejecución.
                  </p>
                </div>

                <Link
                  href={`/freight?requestId=${request.id}`}
                  className="inline-flex w-fit items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
                >
                  Ver freight relacionada
                </Link>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Bloques freight
                  </p>
                  <p className="mt-3 text-[22px] font-semibold text-white">{freight.length}</p>
                  <p className="mt-2 text-xs text-white/45">Registros logísticos</p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Activos
                  </p>
                  <p className="mt-3 text-[22px] font-semibold text-white">{activeFreight}</p>
                  <p className="mt-2 text-xs text-white/45">En asignación o ejecución</p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Valor logístico
                  </p>
                  <p className="mt-3 text-[22px] font-semibold text-white">
                    USD {totalFreightValue.toLocaleString()}
                  </p>
                  <p className="mt-2 text-xs text-white/45">Costo observado/propuesto</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {freight.length === 0 ? (
                  <EmptyBlock text="Esta solicitud todavía no tiene bloques logísticos vinculados." />
                ) : (
                  freight.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4"
                    >
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72">
                              {item.id}
                            </span>
                            <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-100">
                              {getFreightStatusLabel(item.status)}
                            </span>
                          </div>

                          <h4 className="mt-3 text-[18px] font-semibold text-white">
                            {item.transportista ?? "Sin operador asignado"}
                          </h4>

                          <p className="mt-1 text-sm text-white/58">
                            {item.origin} → {item.destination} · {getVehicleTypeLabel(item.vehicleType)}
                          </p>
                        </div>

                        <div className="text-left xl:text-right">
                          <p className="text-[18px] font-semibold text-white">
                            {getFreightAssignmentPercent(item)}%
                          </p>
                          <p className="mt-1 text-xs text-white/42">Cobertura logística</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[80px_1fr]">
            <StepRail showLine={false} tone="emerald" />

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                    Step 04
                  </p>

                  <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
                    Operation / Consolidación final
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-white/58">
                    Esta etapa unifica el ciclo completo en una operación consolidada con progreso,
                    participantes y valor total.
                  </p>
                </div>

                <Link
                  href={`/operations?requestId=${request.id}`}
                  className="inline-flex w-fit items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
                >
                  Ver operación
                </Link>
              </div>

              <div className="mt-5">
                {!operation ? (
                  <EmptyBlock text="Todavía no existe una operación consolidada para esta solicitud." />
                ) : (
                  <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72">
                            {operation.id}
                          </span>
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                            {getOperationStatusLabel(operation.status)}
                          </span>
                        </div>

                        <h4 className="mt-3 text-[18px] font-semibold text-white">
                          {operation.frigorifico}
                        </h4>

                        <p className="mt-1 text-sm text-white/58">
                          {operation.origin} → {operation.destination} ·{" "}
                          {operation.quantity.toLocaleString()} {operation.unit}
                        </p>
                      </div>

                      <div className="text-left xl:text-right">
                        <p className="text-[18px] font-semibold text-white">
                          {operation.overallProgress}%
                        </p>
                        <p className="mt-1 text-xs text-white/42">
                          {getOperationGapLabel(operation)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${operation.overallProgress}%` }}
                      />
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <div className="rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-4">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                          Comercial
                        </p>
                        <p className="mt-2 text-[20px] font-semibold text-white">
                          {operation.commercialProgress}%
                        </p>
                      </div>

                      <div className="rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-4">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                          Logística
                        </p>
                        <p className="mt-2 text-[20px] font-semibold text-white">
                          {operation.logisticsProgress}%
                        </p>
                      </div>

                      <div className="rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-4">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                          Valor total
                        </p>
                        <p className="mt-2 text-[20px] font-semibold text-white">
                          USD {operation.totalOperationValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}