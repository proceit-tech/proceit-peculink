"use client";

import { getMockSession } from "@/lib/mock/session";

type Metric = {
  label: string;
  value: string;
  helper?: string;
};

type AlertItem = {
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  action: string;
};

type FunnelStage = {
  label: string;
  value: number;
  conversion?: string;
};

type ActivityRow = {
  id: string;
  type: "Solicitud" | "Operación" | "Carga";
  company: string;
  volume: string;
  stage: string;
  status: "Crítico" | "Atención" | "Estable" | "Cerrado";
  date: string;
};

type ProfileActivity = {
  label: string;
  company: string;
  value: string;
  helper: string;
};

type InsightItem = {
  title: string;
  description: string;
};

const coreMetrics: Metric[] = [
  {
    label: "Usuarios activos",
    value: "148",
    helper: "+12% vs. período anterior",
  },
  {
    label: "Solicitudes abiertas",
    value: "24",
    helper: "7 con alta prioridad",
  },
  {
    label: "Operaciones en curso",
    value: "12",
    helper: "4 en etapa logística",
  },
  {
    label: "Comisión estimada",
    value: "USD 18.400",
    helper: "Proyección del ciclo actual",
  },
];

const operationalMetrics: Metric[] = [
  {
    label: "Ofertas recibidas",
    value: "186",
    helper: "Promedio 7,8 por solicitud",
  },
  {
    label: "Volumen negociado",
    value: "78.500",
    helper: "Cabezas equivalentes",
  },
  {
    label: "Solicitudes sin cobertura",
    value: "6",
    helper: "25% del total abierto",
  },
  {
    label: "Cargas sin transporte",
    value: "3",
    helper: "Pendientes de asignación",
  },
];

const alerts: AlertItem[] = [
  {
    severity: "high",
    title: "Solicitudes críticas sin cobertura suficiente",
    description:
      "Tres solicitudes de bovinos concentran alto volumen y continúan con cobertura inferior al 40%.",
    action: "Ver solicitudes",
  },
  {
    severity: "medium",
    title: "Operaciones cerradas sin transporte asignado",
    description:
      "Existen tres operaciones comerciales aprobadas que todavía no tienen capacidad logística confirmada.",
    action: "Revisar cargas",
  },
  {
    severity: "low",
    title: "Negociaciones con baja respuesta",
    description:
      "Cinco conversaciones superaron el tiempo objetivo de respuesta y pueden perder velocidad comercial.",
    action: "Abrir negociaciones",
  },
];

const funnel: FunnelStage[] = [
  { label: "Solicitudes publicadas", value: 24, conversion: "100%" },
  { label: "Con ofertas", value: 19, conversion: "79%" },
  { label: "En negociación", value: 13, conversion: "54%" },
  { label: "Operaciones cerradas", value: 9, conversion: "38%" },
  { label: "Transporte asignado", value: 6, conversion: "25%" },
  { label: "Operaciones finalizadas", value: 4, conversion: "17%" },
];

const recentActivity: ActivityRow[] = [
  {
    id: "SOL-2026-014",
    type: "Solicitud",
    company: "Frigorífico Sur",
    volume: "12.000 bovinos",
    stage: "Recepción de ofertas",
    status: "Atención",
    date: "Hoy · 10:42",
  },
  {
    id: "OPE-2026-009",
    type: "Operación",
    company: "Ganadera San Miguel",
    volume: "8.500 porcinos",
    stage: "Negociación cerrada",
    status: "Estable",
    date: "Hoy · 09:15",
  },
  {
    id: "CAR-2026-021",
    type: "Carga",
    company: "Ruta Sur Logística",
    volume: "4 viajes parciales",
    stage: "Pendiente de asignación",
    status: "Crítico",
    date: "Ayer · 18:20",
  },
  {
    id: "OPE-2026-007",
    type: "Operación",
    company: "Frigorífico del Este",
    volume: "5.000 avícolas",
    stage: "Transporte asignado",
    status: "Estable",
    date: "Ayer · 16:05",
  },
  {
    id: "SOL-2026-011",
    type: "Solicitud",
    company: "Frigorífico Central",
    volume: "6.200 bovinos",
    stage: "Cobertura parcial",
    status: "Atención",
    date: "Ayer · 11:30",
  },
];

const profileActivity: ProfileActivity[] = [
  {
    label: "Frigorífico más activo",
    company: "Frigorífico Sur",
    value: "9 solicitudes",
    helper: "Mayor volumen abierto del período",
  },
  {
    label: "Productor más activo",
    company: "Ganadera San Miguel",
    value: "26 ofertas",
    helper: "Mayor tasa de respuesta comercial",
  },
  {
    label: "Transportista más activo",
    company: "Ruta Sur Logística",
    value: "14 propuestas",
    helper: "Mayor participación en cargas abiertas",
  },
];

const monetizationMetrics: Metric[] = [
  {
    label: "Comisión promedio por operación",
    value: "USD 2.044",
    helper: "Sobre operaciones cerradas",
  },
  {
    label: "Ingreso proyectado por logística",
    value: "USD 5.600",
    helper: "Asignaciones de transporte",
  },
  {
    label: "Ingreso proyectado comercial",
    value: "USD 12.800",
    helper: "Cierre productor ↔ frigorífico",
  },
];

const insights: InsightItem[] = [
  {
    title: "Alta demanda no cubierta en bovinos",
    description:
      "La mayor brecha del marketplace continúa concentrada en bovinos, especialmente en operaciones de volumen superior a 10.000 cabezas.",
  },
  {
    title: "Cuello de botella en asignación logística",
    description:
      "Las operaciones comerciales avanzan más rápido que la capacidad de transporte disponible en algunas rutas prioritarias.",
  },
  {
    title: "Buen nivel de liquidez en solicitudes medianas",
    description:
      "Las solicitudes de tamaño medio están recibiendo más ofertas y cerrando con mejor velocidad que las de gran escala.",
  },
];

function getSeverityStyles(severity: AlertItem["severity"]) {
  switch (severity) {
    case "high":
      return {
        badge: "Crítico",
        className:
          "border-red-400/20 bg-red-400/10 text-red-100",
      };
    case "medium":
      return {
        badge: "Atención",
        className:
          "border-amber-400/20 bg-amber-400/10 text-amber-100",
      };
    case "low":
    default:
      return {
        badge: "Seguimiento",
        className:
          "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
      };
  }
}

function getStatusStyles(status: ActivityRow["status"]) {
  switch (status) {
    case "Crítico":
      return "border-red-400/20 bg-red-400/10 text-red-100";
    case "Atención":
      return "border-amber-400/20 bg-amber-400/10 text-amber-100";
    case "Estable":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-100";
    case "Cerrado":
    default:
      return "border-white/10 bg-white/5 text-white/80";
  }
}

function SectionCard({
  kicker,
  title,
  children,
  right,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="border-b border-white/8 px-6 py-5 sm:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400/85">
              {kicker}
            </p>
            <h3 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-white">
              {title}
            </h3>
          </div>
          {right ? <div>{right}</div> : null}
        </div>
      </div>

      <div className="px-6 py-6 sm:px-7">{children}</div>
    </section>
  );
}

export default function DashboardPage() {
  const session = getMockSession();
  const role = session?.role ?? "admin";

  if (role !== "admin") {
    return (
      <section className="rounded-[28px] border border-white/10 bg-white/[0.03] px-7 py-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400/85">
          Acceso restringido
        </p>
        <h2 className="mt-2 text-[32px] font-semibold tracking-[-0.03em] text-white">
          Este panel está reservado para administración
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
          El perfil actual no tiene acceso a la vista ejecutiva del marketplace.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/10 bg-white/[0.02] px-7 py-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400/85">
          Panel de administración
        </p>
        <h1 className="mt-3 text-[48px] font-semibold leading-[1.02] tracking-[-0.045em] text-white">
          Control general del marketplace
        </h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-white/62">
          Vista ejecutiva para supervisar liquidez, eficiencia operativa,
          adopción de usuarios y monetización del ecosistema PecuLink.
        </p>
      </section>

      <SectionCard kicker="Resumen ejecutivo" title="KPIs Core">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {coreMetrics.map((item) => (
            <article
              key={item.label}
              className="rounded-[24px] border border-white/10 bg-white/[0.03] px-6 py-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">
                {item.label}
              </p>
              <p className="mt-4 text-[28px] font-semibold tracking-[-0.03em] text-white">
                {item.value}
              </p>
              {item.helper ? (
                <p className="mt-2 text-sm text-white/52">{item.helper}</p>
              ) : null}
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard kicker="Rendimiento operativo" title="KPIs Operacionales">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {operationalMetrics.map((item) => (
            <article
              key={item.label}
              className="rounded-[24px] border border-white/10 bg-white/[0.03] px-6 py-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">
                {item.label}
              </p>
              <p className="mt-4 text-[28px] font-semibold tracking-[-0.03em] text-white">
                {item.value}
              </p>
              {item.helper ? (
                <p className="mt-2 text-sm text-white/52">{item.helper}</p>
              ) : null}
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        kicker="Atención inmediata"
        title="Alertas"
        right={
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            3 alertas activas
          </div>
        }
      >
        <div className="grid gap-4 xl:grid-cols-3">
          {alerts.map((alert) => {
            const styles = getSeverityStyles(alert.severity);

            return (
              <article
                key={alert.title}
                className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={[
                      "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
                      styles.className,
                    ].join(" ")}
                  >
                    {styles.badge}
                  </span>
                </div>

                <h4 className="mt-4 text-lg font-semibold tracking-tight text-white">
                  {alert.title}
                </h4>

                <p className="mt-3 text-sm leading-7 text-white/58">
                  {alert.description}
                </p>

                <button
                  type="button"
                  className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
                >
                  {alert.action}
                </button>
              </article>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard kicker="Embudo operativo" title="Flujo del marketplace">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {funnel.map((stage, index) => (
            <article
              key={stage.label}
              className="rounded-[22px] border border-white/10 bg-white/[0.03] px-5 py-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
                Etapa {index + 1}
              </p>
              <p className="mt-3 text-sm font-medium leading-6 text-white/78">
                {stage.label}
              </p>
              <p className="mt-4 text-[30px] font-semibold tracking-[-0.03em] text-white">
                {stage.value}
              </p>
              {stage.conversion ? (
                <p className="mt-2 text-sm text-cyan-300/85">
                  Conversión {stage.conversion}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard kicker="Equilibrio del mercado" title="Liquidez (oferta vs demanda)">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">
                  Relación general
                </p>
                <h4 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-white">
                  Oferta y demanda del marketplace
                </h4>
              </div>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100">
                Gap monitoreado
              </span>
            </div>

            <div className="mt-8 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-white/68">Demanda total activa</span>
                  <span className="font-semibold text-white">92.000</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full w-[88%] rounded-full bg-white/80" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-white/68">Oferta confirmada</span>
                  <span className="font-semibold text-cyan-200">78.500</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full w-[76%] rounded-full bg-cyan-400" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-white/68">Gap pendiente</span>
                  <span className="font-semibold text-amber-200">13.500</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full w-[14%] rounded-full bg-amber-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">
              Indicadores de liquidez
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-4">
                <p className="text-sm text-white/56">Tasa de cobertura</p>
                <p className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-white">
                  85,3%
                </p>
              </div>

              <div className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-4">
                <p className="text-sm text-white/56">Tiempo medio hasta primera oferta</p>
                <p className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-white">
                  3h 20m
                </p>
              </div>

              <div className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-4">
                <p className="text-sm text-white/56">Tiempo medio hasta cierre</p>
                <p className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-white">
                  18h 40m
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard kicker="Operación viva" title="Actividad reciente">
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]">
          <div className="grid grid-cols-[1.1fr_1.3fr_1fr_1.1fr_0.9fr_0.8fr] border-b border-white/8 px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
            <div>Tipo</div>
            <div>Actor principal</div>
            <div>Volumen</div>
            <div>Etapa</div>
            <div>Estado</div>
            <div>Fecha</div>
          </div>

          <div className="divide-y divide-white/6">
            {recentActivity.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1.1fr_1.3fr_1fr_1.1fr_0.9fr_0.8fr] items-center px-6 py-4"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{row.type}</p>
                  <p className="mt-1 text-xs text-white/42">{row.id}</p>
                </div>

                <div className="text-sm text-white/76">{row.company}</div>
                <div className="text-sm text-white/76">{row.volume}</div>
                <div className="text-sm text-white/76">{row.stage}</div>

                <div>
                  <span
                    className={[
                      "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                      getStatusStyles(row.status),
                    ].join(" ")}
                  >
                    {row.status}
                  </span>
                </div>

                <div className="text-sm text-white/48">{row.date}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard kicker="Adopción por perfil" title="Actividad por perfil">
        <div className="grid gap-4 xl:grid-cols-3">
          {profileActivity.map((item) => (
            <article
              key={item.label}
              className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
                {item.label}
              </p>
              <h4 className="mt-3 text-[22px] font-semibold tracking-[-0.03em] text-white">
                {item.company}
              </h4>
              <p className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-cyan-200">
                {item.value}
              </p>
              <p className="mt-2 text-sm leading-7 text-white/58">{item.helper}</p>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard kicker="Modelo económico" title="Monetización">
        <div className="grid gap-4 xl:grid-cols-3">
          {monetizationMetrics.map((item) => (
            <article
              key={item.label}
              className="rounded-[24px] border border-white/10 bg-white/[0.03] px-6 py-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">
                {item.label}
              </p>
              <p className="mt-4 text-[28px] font-semibold tracking-[-0.03em] text-white">
                {item.value}
              </p>
              {item.helper ? (
                <p className="mt-2 text-sm text-white/52">{item.helper}</p>
              ) : null}
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard kicker="Lectura estratégica" title="Insights">
        <div className="grid gap-4 xl:grid-cols-3">
          {insights.map((item) => (
            <article
              key={item.title}
              className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6"
            >
              <h4 className="text-lg font-semibold tracking-tight text-white">
                {item.title}
              </h4>
              <p className="mt-3 text-sm leading-7 text-white/58">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}