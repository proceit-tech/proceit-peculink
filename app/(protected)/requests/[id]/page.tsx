"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getRequestById,
  getOffersByRequestId,
  getFreightByRequestId,
  getOperationByRequestId,
} from "@/lib/mock/relations";
import {
  getCoveragePercent,
  getCoverageLabel,
  getEstimatedGrossValue,
  getLivestockLabel,
  getPriorityLabel,
  getRequestStatusLabel,
} from "@/lib/mock/requests";
import RequestLifecycleTimeline from "@/components/timeline/request-lifecycle-timeline";

export default function RequestDetailPage() {
  const params = useParams();
  const requestId = String(params?.id ?? "");

  const request = getRequestById(requestId);

  if (!request) {
    return (
      <section className="space-y-6 text-white">
        <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

          <div className="px-6 py-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-400/80">
              Request Detail
            </p>

            <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-white">
              Solicitud no encontrada
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
              No fue posible localizar la solicitud solicitada dentro del mock actual.
            </p>

            <div className="mt-6">
              <Link
                href="/requests"
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
              >
                Volver a solicitudes
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const relatedOffers = getOffersByRequestId(requestId);
  const relatedFreight = getFreightByRequestId(requestId);
  const relatedOperation = getOperationByRequestId(requestId);

  const coveragePercent = getCoveragePercent(request);
  const estimatedGross = getEstimatedGrossValue(request);

  const totalOfferValue = relatedOffers.reduce((acc, item) => {
    const value =
      item.kind === "supply"
        ? (item.pricePerUnit ?? 0) * item.quantityOffered
        : item.freightPrice ?? 0;

    return acc + value;
  }, 0);

  const totalFreightValue = relatedFreight.reduce((acc, item) => acc + (item.totalFreightValue ?? 0), 0);

  const operationValue = relatedOperation?.totalOperationValue ?? 0;

  return (
    <section className="space-y-6 text-white">
      <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

        <div className="px-6 py-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-400/80">
                Request Detail
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                  {request.id}
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72">
                  {getRequestStatusLabel(request.status)}
                </span>

                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                  {getPriorityLabel(request.priority)}
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                  Necesario para {request.neededBy}
                </span>
              </div>

              <h1 className="mt-4 text-[32px] font-semibold tracking-[-0.04em] text-white">
                {request.frigorifico}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">
                {getLivestockLabel(request.type)} · {request.quantity.toLocaleString()}{" "}
                {request.unit} · origen {request.origin} · destino {request.destination}
              </p>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/50">
                Esta vista concentra el ciclo completo de la solicitud: demanda inicial,
                respuesta comercial, cobertura logística y consolidación operacional en una sola lectura.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/requests"
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
              >
                Volver a solicitudes
              </Link>

              <Link
                href={`/offers?requestId=${request.id}`}
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
              >
                Ver offers
              </Link>

              <Link
                href={`/freight?requestId=${request.id}`}
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
              >
                Ver freight
              </Link>

              <Link
                href={`/operations?requestId=${request.id}`}
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
              >
                Ver operation
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-[22px] border border-white/10 bg-white/[0.03] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
            Cobertura
          </p>
          <p className="mt-3 text-[24px] font-semibold tracking-[-0.03em] text-white">
            {coveragePercent}%
          </p>
          <p className="mt-2 text-xs text-white/45">{getCoverageLabel(request)}</p>
        </article>

        <article className="rounded-[22px] border border-white/10 bg-white/[0.03] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
            Offers
          </p>
          <p className="mt-3 text-[24px] font-semibold tracking-[-0.03em] text-white">
            {relatedOffers.length}
          </p>
          <p className="mt-2 text-xs text-white/45">Propuestas vinculadas</p>
        </article>

        <article className="rounded-[22px] border border-white/10 bg-white/[0.03] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
            Freight
          </p>
          <p className="mt-3 text-[24px] font-semibold tracking-[-0.03em] text-white">
            {relatedFreight.length}
          </p>
          <p className="mt-2 text-xs text-white/45">Bloques logísticos</p>
        </article>

        <article className="rounded-[22px] border border-white/10 bg-white/[0.03] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
            Operación
          </p>
          <p className="mt-3 text-[20px] font-semibold tracking-[-0.03em] text-white">
            {relatedOperation ? relatedOperation.id : "No creada"}
          </p>
          <p className="mt-2 text-xs text-white/45">Consolidación final</p>
        </article>

        <article className="rounded-[22px] border border-white/10 bg-white/[0.03] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
            Valor estimado
          </p>
          <p className="mt-3 text-[20px] font-semibold tracking-[-0.03em] text-white">
            {estimatedGross > 0 ? `USD ${estimatedGross.toLocaleString()}` : "—"}
          </p>
          <p className="mt-2 text-xs text-white/45">
            Offers: USD {totalOfferValue.toLocaleString()}
          </p>
        </article>
      </div>

      <RequestLifecycleTimeline
        request={request}
        offers={relatedOffers}
        freight={relatedFreight}
        operation={relatedOperation}
      />

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
            Lectura ejecutiva
          </p>

          <div className="mt-4 space-y-3 text-sm leading-7 text-white/58">
            <p>
              La solicitud parte desde <span className="text-white/82">{request.frigorifico}</span>{" "}
              con una cobertura actual de <span className="text-white/82">{coveragePercent}%</span>,
              y ya generó <span className="text-white/82">{relatedOffers.length}</span> offers,
              <span className="text-white/82"> {relatedFreight.length}</span> bloques logísticos
              y una operación consolidada de{" "}
              <span className="text-white/82">
                {relatedOperation ? relatedOperation.id : "aún no creada"}
              </span>
              .
            </p>

            <p>
              El valor económico observado en la capa comercial alcanza{" "}
              <span className="text-white/82">USD {totalOfferValue.toLocaleString()}</span>,
              mientras que la capa logística representa{" "}
              <span className="text-white/82">USD {totalFreightValue.toLocaleString()}</span>
              {relatedOperation
                ? ` y la operación consolidada totaliza USD ${operationValue.toLocaleString()}.`
                : "."}
            </p>

            <p>
              Este detalle ya cuenta la historia completa del ciclo: demanda, respuesta comercial,
              logística y consolidación operacional en una sola vista.
            </p>
          </div>
        </article>

        <article className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
            Nota operativa
          </p>

          <p className="mt-4 text-sm leading-7 text-white/58">
            {request.notes ?? "Sin observaciones registradas para esta solicitud."}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/offers?requestId=${request.id}`}
              className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.05]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                Capa comercial
              </p>
              <p className="mt-3 text-[18px] font-semibold text-white">
                {relatedOffers.length} offers
              </p>
              <p className="mt-2 text-xs text-white/45">
                Abrir análisis de propuestas vinculadas
              </p>
            </Link>

            <Link
              href={`/freight?requestId=${request.id}`}
              className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.05]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                Capa logística
              </p>
              <p className="mt-3 text-[18px] font-semibold text-white">
                {relatedFreight.length} bloques
              </p>
              <p className="mt-2 text-xs text-white/45">
                Abrir cobertura y ejecución logística
              </p>
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}