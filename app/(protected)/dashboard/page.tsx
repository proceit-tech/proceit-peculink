"use client";

import { useMemo, useState } from "react";
import { getMockSession } from "@/lib/mock/session";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

type PeriodKey = "today" | "7d" | "30d" | "90d";

type Metric = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
};

type AlertItem = {
  severity: "critical" | "warning" | "monitor";
  title: string;
  description: string;
  action: string;
};

type ActivityItem = {
  id: string;
  kind: "Solicitud" | "Operación" | "Carga";
  company: string;
  summary: string;
  stage: string;
  status: "Crítico" | "Atención" | "Estable" | "Cerrado";
  date: string;
};

type ProfileItem = {
  title: string;
  company: string;
  metric: string;
  helper: string;
};

type InsightItem = {
  title: string;
  description: string;
};

type DashboardData = {
  hero: {
    kicker: string;
    title: string;
    description: string;
  };
  coreMetrics: Metric[];
  operationalMetrics: Metric[];
  activitySeries: Array<{
    label: string;
    solicitudes: number;
    ofertas: number;
    operaciones: number;
  }>;
  funnelSeries: Array<{
    stage: string;
    total: number;
  }>;
  alerts: AlertItem[];
  liquidity: {
    demand: number;
    supply: number;
    gap: number;
    coverage: string;
    avgFirstOffer: string;
    avgClose: string;
  };
  recentActivity: ActivityItem[];
  profileActivity: ProfileItem[];
  monetization: Metric[];
  insights: InsightItem[];
};

const PERIOD_OPTIONS: Array<{ key: PeriodKey; label: string }> = [
  { key: "today", label: "Hoy" },
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
];

const DASHBOARD_BY_PERIOD: Record<PeriodKey, DashboardData> = {
  today: {
    hero: {
      kicker: "Panel de administración",
      title: "Control general del marketplace",
      description:
        "Visibilidad ejecutiva del estado actual de la plataforma, con foco en liquidez, operaciones activas y monetización del día.",
    },
    coreMetrics: [
      { label: "Usuarios activos", value: "148", delta: "+6,2%", trend: "up" },
      { label: "Solicitudes abiertas", value: "24", delta: "+3", trend: "up" },
      { label: "Operaciones activas", value: "12", delta: "+1", trend: "up" },
      { label: "Comisión estimada", value: "USD 18.400", delta: "+4,8%", trend: "up" },
    ],
    activitySeries: [
      { label: "08h", solicitudes: 4, ofertas: 18, operaciones: 1 },
      { label: "10h", solicitudes: 7, ofertas: 26, operaciones: 2 },
      { label: "12h", solicitudes: 10, ofertas: 38, operaciones: 4 },
      { label: "14h", solicitudes: 14, ofertas: 57, operaciones: 6 },
      { label: "16h", solicitudes: 18, ofertas: 75, operaciones: 9 },
      { label: "18h", solicitudes: 24, ofertas: 96, operaciones: 12 },
    ],
    funnelSeries: [
      { stage: "Publicadas", total: 24 },
      { stage: "Con ofertas", total: 19 },
      { stage: "Negociación", total: 13 },
      { stage: "Cerradas", total: 9 },
      { stage: "Con transporte", total: 6 },
      { stage: "Finalizadas", total: 4 },
    ],
    alerts: [
      {
        severity: "critical",
        title: "Solicitudes críticas sin cobertura",
        description:
          "Tres solicitudes de bovinos continúan con cobertura inferior al 40% y afectan el volumen del día.",
        action: "Ver solicitudes",
      },
      {
        severity: "warning",
        title: "Operaciones cerradas sin transporte",
        description:
          "Existen tres operaciones aprobadas sin capacidad logística confirmada para despacho.",
        action: "Revisar cargas",
      },
      {
        severity: "monitor",
        title: "Negociaciones con baja respuesta",
        description:
          "Cinco conversaciones superaron el tiempo objetivo y pueden perder velocidad comercial.",
        action: "Abrir negociaciones",
      },
    ],
    liquidity: {
      demand: 92000,
      supply: 78500,
      gap: 13500,
      coverage: "85,3%",
      avgFirstOffer: "3h 20m",
      avgClose: "18h 40m",
    },
    recentActivity: [
      {
        id: "SOL-2026-014",
        kind: "Solicitud",
        company: "Frigorífico Sur",
        summary: "12.000 bovinos · recepción de ofertas",
        stage: "Recepción de ofertas",
        status: "Atención",
        date: "Hoy · 10:42",
      },
      {
        id: "OPE-2026-009",
        kind: "Operación",
        company: "Ganadera San Miguel",
        summary: "8.500 porcinos · negociación cerrada",
        stage: "Negociación cerrada",
        status: "Estable",
        date: "Hoy · 09:15",
      },
      {
        id: "CAR-2026-021",
        kind: "Carga",
        company: "Ruta Sur Logística",
        summary: "4 viajes parciales · sin asignación",
        stage: "Pendiente de asignación",
        status: "Crítico",
        date: "Ayer · 18:20",
      },
      {
        id: "OPE-2026-007",
        kind: "Operación",
        company: "Frigorífico del Este",
        summary: "5.000 avícolas · transporte asignado",
        stage: "Transporte asignado",
        status: "Estable",
        date: "Ayer · 16:05",
      },
    ],
    profileActivity: [
      {
        title: "Frigorífico más activo",
        company: "Frigorífico Sur",
        metric: "9 solicitudes",
        helper: "Mayor volumen abierto del día",
      },
      {
        title: "Productor más activo",
        company: "Ganadera San Miguel",
        metric: "26 ofertas",
        helper: "Mejor ritmo de respuesta comercial",
      },
      {
        title: "Transportista más activo",
        company: "Ruta Sur Logística",
        metric: "14 propuestas",
        helper: "Mayor participación en cargas abiertas",
      },
    ],
    monetization: [
      {
        label: "Comisión promedio por operación",
        value: "USD 2.044",
        delta: "+2,1%",
        trend: "up",
      },
      {
        label: "Ingreso logístico estimado",
        value: "USD 5.600",
        delta: "+3,8%",
        trend: "up",
      },
      {
        label: "Ingreso comercial estimado",
        value: "USD 12.800",
        delta: "+5,2%",
        trend: "up",
      },
    ],
    insights: [
      {
        title: "Alta demanda no cubierta en bovinos",
        description:
          "El mayor gap del marketplace sigue concentrado en operaciones bovinas de escala alta.",
      },
      {
        title: "Cuello de botella en asignación logística",
        description:
          "El cierre comercial está avanzando más rápido que la capacidad de transporte disponible.",
      },
      {
        title: "Buen desempeño en solicitudes medianas",
        description:
          "Las solicitudes de volumen medio reciben mejores tasas de oferta y cierran con mayor velocidad.",
      },
    ],
  },

  "7d": {
    hero: {
      kicker: "Panel de administración",
      title: "Control general del marketplace",
      description:
        "Seguimiento de desempeño semanal, adopción de actores y eficiencia del flujo comercial y logístico.",
    },
    coreMetrics: [
      { label: "Usuarios activos", value: "382", delta: "+9,4%", trend: "up" },
      { label: "Solicitudes abiertas", value: "71", delta: "+11", trend: "up" },
      { label: "Operaciones activas", value: "29", delta: "+5", trend: "up" },
      { label: "Comisión estimada", value: "USD 46.900", delta: "+8,1%", trend: "up" },
    ],
    activitySeries: [
      { label: "Lun", solicitudes: 18, ofertas: 64, operaciones: 7 },
      { label: "Mar", solicitudes: 24, ofertas: 82, operaciones: 9 },
      { label: "Mié", solicitudes: 20, ofertas: 77, operaciones: 8 },
      { label: "Jue", solicitudes: 29, ofertas: 105, operaciones: 11 },
      { label: "Vie", solicitudes: 33, ofertas: 118, operaciones: 14 },
      { label: "Sáb", solicitudes: 22, ofertas: 80, operaciones: 7 },
      { label: "Dom", solicitudes: 15, ofertas: 56, operaciones: 5 },
    ],
    funnelSeries: [
      { stage: "Publicadas", total: 71 },
      { stage: "Con ofertas", total: 58 },
      { stage: "Negociación", total: 43 },
      { stage: "Cerradas", total: 32 },
      { stage: "Con transporte", total: 25 },
      { stage: "Finalizadas", total: 18 },
    ],
    alerts: [
      {
        severity: "critical",
        title: "Concentración de demanda en bovinos",
        description:
          "La demanda semanal se concentró en pocas operaciones de gran escala con menor cobertura relativa.",
        action: "Analizar cobertura",
      },
      {
        severity: "warning",
        title: "Rutas con baja oferta logística",
        description:
          "Dos corredores operativos presentan baja participación de transportistas.",
        action: "Ver rutas",
      },
      {
        severity: "monitor",
        title: "Respuesta comercial desigual",
        description:
          "Los tiempos de primera oferta se alargaron en solicitudes fuera del corredor principal.",
        action: "Ver tiempos",
      },
    ],
    liquidity: {
      demand: 276000,
      supply: 236500,
      gap: 39500,
      coverage: "85,7%",
      avgFirstOffer: "4h 05m",
      avgClose: "21h 10m",
    },
    recentActivity: [
      {
        id: "SOL-2026-061",
        kind: "Solicitud",
        company: "Frigorífico Central",
        summary: "16.000 bovinos · cobertura parcial",
        stage: "Cobertura parcial",
        status: "Atención",
        date: "Hoy · 13:05",
      },
      {
        id: "OPE-2026-033",
        kind: "Operación",
        company: "Ganadera Horizonte",
        summary: "10.200 porcinos · operación cerrada",
        stage: "Cerrada",
        status: "Estable",
        date: "Hoy · 11:22",
      },
      {
        id: "CAR-2026-039",
        kind: "Carga",
        company: "Trans Log Norte",
        summary: "6 viajes · pendiente de salida",
        stage: "Pendiente de salida",
        status: "Atención",
        date: "Hoy · 08:40",
      },
      {
        id: "OPE-2026-028",
        kind: "Operación",
        company: "Frigorífico del Este",
        summary: "7.400 avícolas · finalizada",
        stage: "Finalizada",
        status: "Cerrado",
        date: "Ayer · 19:10",
      },
    ],
    profileActivity: [
      {
        title: "Frigorífico más activo",
        company: "Frigorífico Central",
        metric: "18 solicitudes",
        helper: "Mayor tracción comercial de la semana",
      },
      {
        title: "Productor más activo",
        company: "Ganadera Horizonte",
        metric: "41 ofertas",
        helper: "Mayor tasa de adjudicación semanal",
      },
      {
        title: "Transportista más activo",
        company: "Trans Log Norte",
        metric: "22 propuestas",
        helper: "Mayor cobertura logística semanal",
      },
    ],
    monetization: [
      {
        label: "Comisión promedio por operación",
        value: "USD 1.996",
        delta: "+1,7%",
        trend: "up",
      },
      {
        label: "Ingreso logístico estimado",
        value: "USD 14.300",
        delta: "+6,0%",
        trend: "up",
      },
      {
        label: "Ingreso comercial estimado",
        value: "USD 32.600",
        delta: "+8,9%",
        trend: "up",
      },
    ],
    insights: [
      {
        title: "Mejor conversión en solicitudes medianas",
        description:
          "Las solicitudes de volumen intermedio muestran el mejor balance entre velocidad y tasa de cierre.",
      },
      {
        title: "Necesidad de reforzar transporte regional",
        description:
          "La capacidad logística todavía limita el cierre completo en algunas zonas secundarias.",
      },
      {
        title: "Oferta suficiente en porcinos",
        description:
          "El segmento porcino muestra mejor liquidez relativa y menor tiempo medio hasta cierre.",
      },
    ],
  },

  "30d": {
    hero: {
      kicker: "Panel de administración",
      title: "Control general del marketplace",
      description:
        "Vista mensual del crecimiento del marketplace, calidad del matching y proyección de monetización.",
    },
    coreMetrics: [
      { label: "Usuarios activos", value: "1.420", delta: "+14,8%", trend: "up" },
      { label: "Solicitudes abiertas", value: "214", delta: "+26", trend: "up" },
      { label: "Operaciones activas", value: "84", delta: "+12", trend: "up" },
      { label: "Comisión estimada", value: "USD 168.700", delta: "+13,2%", trend: "up" },
    ],
    activitySeries: [
      { label: "S1", solicitudes: 72, ofertas: 246, operaciones: 26 },
      { label: "S2", solicitudes: 81, ofertas: 279, operaciones: 31 },
      { label: "S3", solicitudes: 75, ofertas: 261, operaciones: 28 },
      { label: "S4", solicitudes: 93, ofertas: 318, operaciones: 37 },
    ],
    funnelSeries: [
      { stage: "Publicadas", total: 214 },
      { stage: "Con ofertas", total: 179 },
      { stage: "Negociación", total: 136 },
      { stage: "Cerradas", total: 101 },
      { stage: "Con transporte", total: 82 },
      { stage: "Finalizadas", total: 63 },
    ],
    alerts: [
      {
        severity: "critical",
        title: "Gap persistente en demanda bovina de gran escala",
        description:
          "Las solicitudes superiores a 15.000 cabezas siguen mostrando el mayor desbalance entre oferta y demanda.",
        action: "Ver segmentos",
      },
      {
        severity: "warning",
        title: "Capacidad logística insuficiente en picos semanales",
        description:
          "Las últimas dos semanas reflejan saturación en la asignación de transporte durante cierres simultáneos.",
        action: "Revisar logística",
      },
      {
        severity: "monitor",
        title: "Ritmo desigual entre regiones",
        description:
          "El desempeño comercial sigue concentrado en pocas áreas con menor expansión fuera del corredor principal.",
        action: "Ver regiones",
      },
    ],
    liquidity: {
      demand: 864000,
      supply: 742500,
      gap: 121500,
      coverage: "85,9%",
      avgFirstOffer: "4h 40m",
      avgClose: "23h 15m",
    },
    recentActivity: [
      {
        id: "SOL-2026-188",
        kind: "Solicitud",
        company: "Frigorífico Oeste",
        summary: "18.500 bovinos · nueva apertura",
        stage: "Publicada",
        status: "Atención",
        date: "Hoy · 14:10",
      },
      {
        id: "OPE-2026-094",
        kind: "Operación",
        company: "Ganadera del Norte",
        summary: "11.300 porcinos · cerrada",
        stage: "Cerrada",
        status: "Estable",
        date: "Hoy · 10:55",
      },
      {
        id: "CAR-2026-102",
        kind: "Carga",
        company: "Ruta Centro",
        summary: "8 viajes · con transporte parcial",
        stage: "Asignación parcial",
        status: "Atención",
        date: "Ayer · 17:48",
      },
      {
        id: "OPE-2026-081",
        kind: "Operación",
        company: "Frigorífico Sur",
        summary: "9.000 avícolas · finalizada",
        stage: "Finalizada",
        status: "Cerrado",
        date: "Ayer · 15:30",
      },
    ],
    profileActivity: [
      {
        title: "Frigorífico más activo",
        company: "Frigorífico Oeste",
        metric: "46 solicitudes",
        helper: "Mayor generación de demanda mensual",
      },
      {
        title: "Productor más activo",
        company: "Ganadera del Norte",
        metric: "98 ofertas",
        helper: "Mayor volumen adjudicado del período",
      },
      {
        title: "Transportista más activo",
        company: "Ruta Centro",
        metric: "57 propuestas",
        helper: "Mayor presencia en operaciones logísticas",
      },
    ],
    monetization: [
      {
        label: "Comisión promedio por operación",
        value: "USD 1.670",
        delta: "+2,9%",
        trend: "up",
      },
      {
        label: "Ingreso logístico estimado",
        value: "USD 48.200",
        delta: "+9,1%",
        trend: "up",
      },
      {
        label: "Ingreso comercial estimado",
        value: "USD 120.500",
        delta: "+14,7%",
        trend: "up",
      },
    ],
    insights: [
      {
        title: "Crecimiento sostenido en adopción",
        description:
          "La base activa mensual está creciendo con mejor ritmo en demanda que en logística, lo que sugiere una oportunidad clara de balance operativo.",
      },
      {
        title: "Mayor eficiencia en operaciones medianas",
        description:
          "El mejor rendimiento del ciclo se sigue concentrando en operaciones de escala media con alta competencia de oferta.",
      },
      {
        title: "Potencial de monetización al alza",
        description:
          "La expansión del cierre comercial y el mejor ticket promedio sostienen una proyección positiva de ingresos.",
      },
    ],
  },

  "90d": {
    hero: {
      kicker: "Panel de administración",
      title: "Control general del marketplace",
      description:
        "Lectura consolidada de crecimiento, madurez operativa y potencial de escalabilidad del marketplace.",
    },
    coreMetrics: [
      { label: "Usuarios activos", value: "3.980", delta: "+21,6%", trend: "up" },
      { label: "Solicitudes abiertas", value: "602", delta: "+74", trend: "up" },
      { label: "Operaciones activas", value: "228", delta: "+31", trend: "up" },
      { label: "Comisión estimada", value: "USD 492.300", delta: "+18,4%", trend: "up" },
    ],
    activitySeries: [
      { label: "M1", solicitudes: 218, ofertas: 752, operaciones: 82 },
      { label: "M2", solicitudes: 246, ofertas: 831, operaciones: 94 },
      { label: "M3", solicitudes: 281, ofertas: 942, operaciones: 111 },
    ],
    funnelSeries: [
      { stage: "Publicadas", total: 602 },
      { stage: "Con ofertas", total: 511 },
      { stage: "Negociación", total: 392 },
      { stage: "Cerradas", total: 301 },
      { stage: "Con transporte", total: 241 },
      { stage: "Finalizadas", total: 187 },
    ],
    alerts: [
      {
        severity: "critical",
        title: "Brecha estructural en cobertura de gran escala",
        description:
          "Las operaciones más grandes mantienen el mayor gap acumulado y condicionan la velocidad total del marketplace.",
        action: "Ver segmentos",
      },
      {
        severity: "warning",
        title: "Escalamiento logístico por debajo del crecimiento comercial",
        description:
          "La logística no está creciendo al mismo ritmo que la demanda y la oferta comercial adjudicada.",
        action: "Revisar capacidad",
      },
      {
        severity: "monitor",
        title: "Concentración operativa en pocos actores",
        description:
          "La actividad relevante sigue muy concentrada en un grupo reducido de empresas líderes.",
        action: "Ver concentración",
      },
    ],
    liquidity: {
      demand: 2410000,
      supply: 2074000,
      gap: 336000,
      coverage: "86,1%",
      avgFirstOffer: "4h 55m",
      avgClose: "24h 30m",
    },
    recentActivity: [
      {
        id: "SOL-2026-402",
        kind: "Solicitud",
        company: "Frigorífico Capital",
        summary: "22.000 bovinos · nueva apertura",
        stage: "Publicada",
        status: "Atención",
        date: "Hoy · 15:10",
      },
      {
        id: "OPE-2026-201",
        kind: "Operación",
        company: "Ganadera Horizonte",
        summary: "14.200 porcinos · cerrada",
        stage: "Cerrada",
        status: "Estable",
        date: "Hoy · 11:50",
      },
      {
        id: "CAR-2026-224",
        kind: "Carga",
        company: "Logística Integral Sur",
        summary: "10 viajes · con asignación parcial",
        stage: "Asignación parcial",
        status: "Atención",
        date: "Ayer · 18:05",
      },
      {
        id: "OPE-2026-190",
        kind: "Operación",
        company: "Frigorífico del Este",
        summary: "11.800 avícolas · finalizada",
        stage: "Finalizada",
        status: "Cerrado",
        date: "Ayer · 16:28",
      },
    ],
    profileActivity: [
      {
        title: "Frigorífico más activo",
        company: "Frigorífico Capital",
        metric: "121 solicitudes",
        helper: "Mayor volumen acumulado del trimestre",
      },
      {
        title: "Productor más activo",
        company: "Ganadera Horizonte",
        metric: "256 ofertas",
        helper: "Mayor participación comercial del trimestre",
      },
      {
        title: "Transportista más activo",
        company: "Logística Integral Sur",
        metric: "141 propuestas",
        helper: "Mayor tracción logística acumulada",
      },
    ],
    monetization: [
      {
        label: "Comisión promedio por operación",
        value: "USD 1.636",
        delta: "+3,4%",
        trend: "up",
      },
      {
        label: "Ingreso logístico estimado",
        value: "USD 144.700",
        delta: "+12,2%",
        trend: "up",
      },
      {
        label: "Ingreso comercial estimado",
        value: "USD 347.600",
        delta: "+19,1%",
        trend: "up",
      },
    ],
    insights: [
      {
        title: "Escalabilidad validada en demanda y cierre",
        description:
          "El marketplace demuestra tracción creciente, especialmente en volumen comercial adjudicado y capacidad de cierre operativo.",
      },
      {
        title: "Logística como palanca crítica de expansión",
        description:
          "El siguiente salto de eficiencia depende de ampliar y balancear la red de transporte disponible.",
      },
      {
        title: "Concentración ofrece oportunidad de diversificación",
        description:
          "Existe espacio claro para ampliar la base activa y reducir dependencia de pocos actores dominantes.",
      },
    ],
  },
};

function getStatusClass(status: ActivityItem["status"]) {
  switch (status) {
    case "Crítico":
      return "border-red-400/20 bg-red-400/10 text-red-100";
    case "Atención":
      return "border-amber-400/20 bg-amber-400/10 text-amber-100";
    case "Estable":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-100";
    case "Cerrado":
    default:
      return "border-white/10 bg-white/[0.04] text-white/75";
  }
}

function getSeverityClass(severity: AlertItem["severity"]) {
  switch (severity) {
    case "critical":
      return "border-red-400/20 bg-red-400/10 text-red-100";
    case "warning":
      return "border-amber-400/20 bg-amber-400/10 text-amber-100";
    case "monitor":
    default:
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-100";
  }
}

function getDeltaClass(trend: Metric["trend"]) {
  switch (trend) {
    case "up":
      return "text-cyan-300";
    case "down":
      return "text-red-300";
    case "neutral":
    default:
      return "text-white/45";
  }
}

function SectionShell({
  kicker,
  title,
  right,
  children,
}: {
  kicker: string;
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[26px] border border-white/10 bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="border-b border-white/8 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-400/85">
              {kicker}
            </p>
            <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.025em] text-white">
              {title}
            </h2>
          </div>
          {right ? <div>{right}</div> : null}
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

function MetricCard({ item }: { item: Metric }) {
  return (
    <article className="rounded-[22px] border border-white/10 bg-white/[0.03] px-5 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
        {item.label}
      </p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-[22px] font-semibold tracking-[-0.03em] text-white">
          {item.value}
        </p>
        <span
          className={[
            "text-xs font-medium",
            getDeltaClass(item.trend),
          ].join(" ")}
        >
          {item.delta}
        </span>
      </div>
    </article>
  );
}

function PeriodSelector({
  period,
  onChange,
}: {
  period: PeriodKey;
  onChange: (value: PeriodKey) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
      {PERIOD_OPTIONS.map((option) => {
        const active = option.key === period;

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={[
              "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-200",
              active
                ? "bg-cyan-400/10 text-cyan-100"
                : "text-white/45 hover:text-white/80",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0B1015] px-3 py-2 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
      <p className="text-xs font-semibold text-white">{label}</p>
      <div className="mt-2 space-y-1">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4 text-xs">
            <span className="text-white/55">{item.name}</span>
            <span className="font-medium text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const session = getMockSession();
  const role = session?.role ?? "admin";
  const [period, setPeriod] = useState<PeriodKey>("7d");

  const data = useMemo(() => DASHBOARD_BY_PERIOD[period], [period]);

  if (role !== "admin") {
    return (
      <section className="rounded-[26px] border border-white/10 bg-white/[0.03] px-6 py-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-400/85">
          Acceso restringido
        </p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-white">
          Este panel está reservado para administración
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
          El perfil actual no tiene acceso a la vista ejecutiva del marketplace.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[26px] border border-white/10 bg-white/[0.02] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-400/85">
              {data.hero.kicker}
            </p>
            <h1 className="mt-2 text-[34px] font-semibold leading-[1.02] tracking-[-0.04em] text-white">
              {data.hero.title}
            </h1>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-white/58">
              {data.hero.description}
            </p>
          </div>

          <PeriodSelector period={period} onChange={setPeriod} />
        </div>
      </section>

      <SectionShell kicker="Resumen ejecutivo" title="KPIs Core">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.coreMetrics.map((item) => (
            <MetricCard key={item.label} item={item} />
          ))}
        </div>
      </SectionShell>

      <SectionShell kicker="Rendimiento operativo" title="KPIs Operacionales">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.operationalMetrics.map((item) => (
            <MetricCard key={item.label} item={item} />
          ))}
        </div>
      </SectionShell>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.95fr]">
        <SectionShell kicker="Evolución temporal" title="Actividad del marketplace">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.activitySeries}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="solicitudes"
                  stroke="rgba(255,255,255,0.75)"
                  strokeWidth={2.2}
                  dot={false}
                  name="Solicitudes"
                />
                <Line
                  type="monotone"
                  dataKey="ofertas"
                  stroke="rgba(34,211,238,0.95)"
                  strokeWidth={2.2}
                  dot={false}
                  name="Ofertas"
                />
                <Line
                  type="monotone"
                  dataKey="operaciones"
                  stroke="rgba(255,191,71,0.95)"
                  strokeWidth={2.2}
                  dot={false}
                  name="Operaciones"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionShell>

        <SectionShell kicker="Embudo operativo" title="Conversión del flujo">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.funnelSeries}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="stage"
                  tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="total"
                  radius={[10, 10, 0, 0]}
                  fill="rgba(34,211,238,0.85)"
                  name="Total"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionShell>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionShell
          kicker="Atención inmediata"
          title="Alertas"
          right={
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/58">
              {data.alerts.length} activas
            </div>
          }
        >
          <div className="space-y-4">
            {data.alerts.map((alert) => (
              <article
                key={alert.title}
                className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5"
              >
                <span
                  className={[
                    "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                    getSeverityClass(alert.severity),
                  ].join(" ")}
                >
                  {alert.severity === "critical"
                    ? "Crítico"
                    : alert.severity === "warning"
                    ? "Atención"
                    : "Seguimiento"}
                </span>

                <h3 className="mt-4 text-[18px] font-semibold tracking-tight text-white">
                  {alert.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-white/58">
                  {alert.description}
                </p>

                <button
                  type="button"
                  className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
                >
                  {alert.action}
                </button>
              </article>
            ))}
          </div>
        </SectionShell>

        <SectionShell kicker="Equilibrio del mercado" title="Liquidez (oferta vs demanda)">
          <div className="space-y-5">
            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-white/60">Demanda total activa</span>
                  <span className="font-semibold text-white">
                    {data.liquidity.demand.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full w-[88%] rounded-full bg-white/75" />
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-white/60">Oferta confirmada</span>
                  <span className="font-semibold text-cyan-200">
                    {data.liquidity.supply.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full w-[76%] rounded-full bg-cyan-400" />
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-white/60">Gap pendiente</span>
                  <span className="font-semibold text-amber-200">
                    {data.liquidity.gap.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full w-[14%] rounded-full bg-amber-400" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                  Cobertura
                </p>
                <p className="mt-3 text-[22px] font-semibold text-white">
                  {data.liquidity.coverage}
                </p>
              </article>

              <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                  Primera oferta
                </p>
                <p className="mt-3 text-[22px] font-semibold text-white">
                  {data.liquidity.avgFirstOffer}
                </p>
              </article>

              <article className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                  Cierre medio
                </p>
                <p className="mt-3 text-[22px] font-semibold text-white">
                  {data.liquidity.avgClose}
                </p>
              </article>
            </div>
          </div>
        </SectionShell>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <SectionShell kicker="Operación viva" title="Actividad reciente">
          <div className="space-y-3">
            {data.recentActivity.map((item) => (
              <article
                key={item.id}
                className="rounded-[20px] border border-white/10 bg-white/[0.03] px-5 py-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72">
                        {item.kind}
                      </span>
                      <span className="text-xs text-white/35">{item.id}</span>
                    </div>

                    <h4 className="mt-3 text-[16px] font-semibold tracking-tight text-white">
                      {item.company}
                    </h4>
                    <p className="mt-1 text-sm text-white/58">{item.summary}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                    <span className="text-sm text-white/52">{item.stage}</span>
                    <span
                      className={[
                        "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                        getStatusClass(item.status),
                      ].join(" ")}
                    >
                      {item.status}
                    </span>
                    <span className="text-sm text-white/42">{item.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </SectionShell>

        <SectionShell kicker="Adopción" title="Actividad por perfil">
          <div className="space-y-4">
            {data.profileActivity.map((item) => (
              <article
                key={item.title}
                className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                  {item.title}
                </p>
                <h4 className="mt-3 text-[18px] font-semibold tracking-tight text-white">
                  {item.company}
                </h4>
                <p className="mt-3 text-[22px] font-semibold text-cyan-200">
                  {item.metric}
                </p>
                <p className="mt-2 text-sm leading-7 text-white/58">{item.helper}</p>
              </article>
            ))}
          </div>
        </SectionShell>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionShell kicker="Modelo económico" title="Monetización">
          <div className="grid gap-4">
            {data.monetization.map((item) => (
              <MetricCard key={item.label} item={item} />
            ))}
          </div>
        </SectionShell>

        <SectionShell kicker="Lectura estratégica" title="Insights">
          <div className="space-y-4">
            {data.insights.map((item) => (
              <article
                key={item.title}
                className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5"
              >
                <h4 className="text-[17px] font-semibold tracking-tight text-white">
                  {item.title}
                </h4>
                <p className="mt-3 text-sm leading-7 text-white/58">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </SectionShell>
      </div>
    </div>
  );
}