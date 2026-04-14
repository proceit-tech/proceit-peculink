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
type RoleKey = "admin" | "frigorifico" | "productor" | "transportista";

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

const ROLE_META: Record<
  RoleKey,
  {
    label: string;
    badge: string;
    accentClass: string;
    description: string;
  }
> = {
  admin: {
    label: "Administración",
    badge: "Vista global",
    accentClass: "text-cyan-300",
    description: "Control integral del marketplace, liquidez, actividad y monetización.",
  },
  frigorifico: {
    label: "Frigorífico",
    badge: "Vista propia",
    accentClass: "text-emerald-300",
    description:
      "Seguimiento de compras, cobertura, negociación y logística del frigorífico.",
  },
  productor: {
    label: "Productor",
    badge: "Vista propia",
    accentClass: "text-amber-300",
    description:
      "Seguimiento de lotes ofertados, adjudicación, performance comercial y cumplimiento operativo del productor.",
  },
  transportista: {
    label: "Transportista",
    badge: "Vista propia",
    accentClass: "text-violet-300",
    description:
      "Seguimiento de cargas disponibles, asignaciones, utilización de flota y desempeño logístico del transportista.",
  },
};

const DASHBOARD_ADMIN: Record<PeriodKey, DashboardData> = {
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
    operationalMetrics: [
      { label: "Ofertas recibidas", value: "186", delta: "+5,4%", trend: "up" },
      { label: "Volumen negociado", value: "78.500", delta: "+4,1%", trend: "up" },
      { label: "Solicitudes sin cobertura", value: "6", delta: "-2", trend: "down" },
      { label: "Cargas sin transporte", value: "3", delta: "-1", trend: "down" },
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
    operationalMetrics: [
      { label: "Ofertas recibidas", value: "582", delta: "+7,2%", trend: "up" },
      { label: "Volumen negociado", value: "236.500", delta: "+6,4%", trend: "up" },
      { label: "Solicitudes sin cobertura", value: "13", delta: "-3", trend: "down" },
      { label: "Cargas sin transporte", value: "7", delta: "-1", trend: "down" },
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
    operationalMetrics: [
      { label: "Ofertas recibidas", value: "1.104", delta: "+10,1%", trend: "up" },
      { label: "Volumen negociado", value: "742.500", delta: "+9,8%", trend: "up" },
      { label: "Solicitudes sin cobertura", value: "35", delta: "-6", trend: "down" },
      { label: "Cargas sin transporte", value: "18", delta: "-2", trend: "down" },
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
    operationalMetrics: [
      { label: "Ofertas recibidas", value: "2.525", delta: "+12,6%", trend: "up" },
      { label: "Volumen negociado", value: "2.074.000", delta: "+11,8%", trend: "up" },
      { label: "Solicitudes sin cobertura", value: "91", delta: "-11", trend: "down" },
      { label: "Cargas sin transporte", value: "37", delta: "-4", trend: "down" },
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

const DASHBOARD_FRIGORIFICO: Record<PeriodKey, DashboardData> = {
  today: {
    hero: {
      kicker: "Panel de frigorífico",
      title: "Control operativo de compras y abastecimiento",
      description:
        "Visión ejecutiva de la operación propia del frigorífico, con foco en solicitudes abiertas, cobertura recibida, cierres del día y capacidad logística comprometida.",
    },
    coreMetrics: [
      { label: "Solicitudes propias", value: "8", delta: "+2", trend: "up" },
      { label: "Operaciones activas", value: "5", delta: "+1", trend: "up" },
      { label: "Volumen solicitado", value: "21.400", delta: "+7,8%", trend: "up" },
      { label: "Costo promedio", value: "USD 2,84/kg", delta: "-1,3%", trend: "down" },
    ],
    operationalMetrics: [
      { label: "Ofertas recibidas", value: "32", delta: "+6", trend: "up" },
      { label: "Cobertura actual", value: "78,6%", delta: "+5,2%", trend: "up" },
      { label: "Sin cobertura crítica", value: "2", delta: "-1", trend: "down" },
      { label: "Cargas pendientes", value: "3", delta: "+1", trend: "up" },
    ],
    activitySeries: [
      { label: "08h", solicitudes: 1, ofertas: 3, operaciones: 0 },
      { label: "10h", solicitudes: 2, ofertas: 7, operaciones: 1 },
      { label: "12h", solicitudes: 4, ofertas: 12, operaciones: 2 },
      { label: "14h", solicitudes: 5, ofertas: 18, operaciones: 3 },
      { label: "16h", solicitudes: 7, ofertas: 25, operaciones: 4 },
      { label: "18h", solicitudes: 8, ofertas: 32, operaciones: 5 },
    ],
    funnelSeries: [
      { stage: "Publicadas", total: 8 },
      { stage: "Con ofertas", total: 7 },
      { stage: "Negociación", total: 5 },
      { stage: "Cerradas", total: 4 },
      { stage: "Con transporte", total: 3 },
      { stage: "Recepción", total: 2 },
    ],
    alerts: [
      {
        severity: "critical",
        title: "Dos solicitudes con cobertura inferior al objetivo",
        description:
          "Las solicitudes de bovinos pesados todavía no alcanzan el volumen mínimo requerido para asegurar la faena programada.",
        action: "Ver cobertura",
      },
      {
        severity: "warning",
        title: "Cargas confirmadas sin ventana logística cerrada",
        description:
          "Tres operaciones aprobadas aún requieren confirmación final de transporte y horario de recepción.",
        action: "Revisar logística",
      },
      {
        severity: "monitor",
        title: "Oferta agresiva en un lote estratégico",
        description:
          "Una solicitud clave recibió múltiples propuestas en corto tiempo y conviene acelerar decisión comercial.",
        action: "Abrir negociación",
      },
    ],
    liquidity: {
      demand: 21400,
      supply: 16820,
      gap: 4580,
      coverage: "78,6%",
      avgFirstOffer: "2h 10m",
      avgClose: "9h 25m",
    },
    recentActivity: [
      {
        id: "SOL-FRI-2026-084",
        kind: "Solicitud",
        company: "Frigorífico Central",
        summary: "6.500 bovinos · alta prioridad de abastecimiento",
        stage: "Recepción de ofertas",
        status: "Atención",
        date: "Hoy · 11:05",
      },
      {
        id: "OPE-FRI-2026-041",
        kind: "Operación",
        company: "Agroganadera Horizonte",
        summary: "4.200 porcinos · operación cerrada",
        stage: "Cierre comercial",
        status: "Estable",
        date: "Hoy · 10:18",
      },
      {
        id: "CAR-FRI-2026-017",
        kind: "Carga",
        company: "Ruta Norte Logística",
        summary: "2 viajes programados · pendiente confirmación",
        stage: "Pendiente de salida",
        status: "Atención",
        date: "Hoy · 08:50",
      },
      {
        id: "OPE-FRI-2026-039",
        kind: "Operación",
        company: "Ganadera San José",
        summary: "3.000 bovinos · recepción confirmada",
        stage: "Recepción confirmada",
        status: "Cerrado",
        date: "Ayer · 17:40",
      },
    ],
    profileActivity: [
      {
        title: "Categoría con mayor demanda",
        company: "Bovinos pesados",
        metric: "9.800 cabezas",
        helper: "Principal necesidad del día para abastecimiento.",
      },
      {
        title: "Proveedor con mejor respuesta",
        company: "Agroganadera Horizonte",
        metric: "5 ofertas",
        helper: "Mayor velocidad y consistencia en propuestas.",
      },
      {
        title: "Operador logístico más activo",
        company: "Ruta Norte Logística",
        metric: "3 cargas",
        helper: "Mayor presencia en despachos asociados al frigorífico.",
      },
    ],
    monetization: [
      {
        label: "Ahorro estimado por competencia de oferta",
        value: "USD 3.200",
        delta: "+4,4%",
        trend: "up",
      },
      {
        label: "Costo logístico comprometido",
        value: "USD 4.900",
        delta: "+1,2%",
        trend: "up",
      },
      {
        label: "Volumen ya asegurado",
        value: "USD 41.800",
        delta: "+6,7%",
        trend: "up",
      },
    ],
    insights: [
      {
        title: "Mayor presión en bovinos de gran porte",
        description:
          "El frigorífico está concentrando su demanda en lotes de mayor escala, lo que exige cerrar rápido las mejores propuestas.",
      },
      {
        title: "Buen ritmo de primera oferta",
        description:
          "Los proveedores están reaccionando con velocidad competitiva, lo que favorece negociación temprana.",
      },
      {
        title: "La logística sigue siendo el punto más sensible",
        description:
          "El cierre comercial avanza bien, pero la confirmación de transporte todavía condiciona la operación completa.",
      },
    ],
  },

  "7d": {
    hero: {
      kicker: "Panel de frigorífico",
      title: "Control operativo de compras y abastecimiento",
      description:
        "Seguimiento semanal de solicitudes propias, adjudicación, cobertura de demanda y ejecución logística del frigorífico.",
    },
    coreMetrics: [
      { label: "Solicitudes propias", value: "26", delta: "+4", trend: "up" },
      { label: "Operaciones activas", value: "14", delta: "+3", trend: "up" },
      { label: "Volumen solicitado", value: "74.300", delta: "+9,1%", trend: "up" },
      { label: "Costo promedio", value: "USD 2,79/kg", delta: "-2,2%", trend: "down" },
    ],
    operationalMetrics: [
      { label: "Ofertas recibidas", value: "116", delta: "+12,8%", trend: "up" },
      { label: "Cobertura semanal", value: "84,2%", delta: "+3,6%", trend: "up" },
      { label: "Solicitudes críticas", value: "4", delta: "-2", trend: "down" },
      { label: "Cargas pendientes", value: "7", delta: "+1", trend: "up" },
    ],
    activitySeries: [
      { label: "Lun", solicitudes: 4, ofertas: 15, operaciones: 2 },
      { label: "Mar", solicitudes: 5, ofertas: 18, operaciones: 3 },
      { label: "Mié", solicitudes: 3, ofertas: 14, operaciones: 2 },
      { label: "Jue", solicitudes: 4, ofertas: 20, operaciones: 3 },
      { label: "Vie", solicitudes: 5, ofertas: 24, operaciones: 4 },
      { label: "Sáb", solicitudes: 3, ofertas: 13, operaciones: 2 },
      { label: "Dom", solicitudes: 2, ofertas: 12, operaciones: 1 },
    ],
    funnelSeries: [
      { stage: "Publicadas", total: 26 },
      { stage: "Con ofertas", total: 22 },
      { stage: "Negociación", total: 17 },
      { stage: "Cerradas", total: 13 },
      { stage: "Con transporte", total: 10 },
      { stage: "Recepción", total: 8 },
    ],
    alerts: [
      {
        severity: "critical",
        title: "Cuatro solicitudes aún debajo del volumen mínimo",
        description:
          "Persisten brechas de cobertura en categorías clave que pueden tensionar el plan semanal de faena.",
        action: "Ver solicitudes",
      },
      {
        severity: "warning",
        title: "Siete cargas pendientes de confirmación final",
        description:
          "La agenda logística de cierre de semana muestra operaciones aprobadas con ventana de retiro todavía abierta.",
        action: "Ver cargas",
      },
      {
        severity: "monitor",
        title: "Mejora en costo promedio por mayor competencia",
        description:
          "El frigorífico está capturando mejores condiciones en solicitudes con mayor volumen y múltiples oferentes.",
        action: "Analizar compras",
      },
    ],
    liquidity: {
      demand: 74300,
      supply: 62570,
      gap: 11730,
      coverage: "84,2%",
      avgFirstOffer: "2h 55m",
      avgClose: "11h 40m",
    },
    recentActivity: [
      {
        id: "SOL-FRI-2026-101",
        kind: "Solicitud",
        company: "Frigorífico Central",
        summary: "8.400 bovinos · cobertura parcial en curso",
        stage: "Cobertura parcial",
        status: "Atención",
        date: "Hoy · 12:35",
      },
      {
        id: "OPE-FRI-2026-052",
        kind: "Operación",
        company: "Ganadera Horizonte",
        summary: "5.100 porcinos · adjudicación confirmada",
        stage: "Adjudicada",
        status: "Estable",
        date: "Hoy · 10:55",
      },
      {
        id: "CAR-FRI-2026-026",
        kind: "Carga",
        company: "Logística Integral Sur",
        summary: "4 viajes · asignación parcial",
        stage: "Asignación parcial",
        status: "Atención",
        date: "Hoy · 09:20",
      },
      {
        id: "OPE-FRI-2026-049",
        kind: "Operación",
        company: "Estancia La Esperanza",
        summary: "3.600 bovinos · recepción finalizada",
        stage: "Recepción finalizada",
        status: "Cerrado",
        date: "Ayer · 18:10",
      },
    ],
    profileActivity: [
      {
        title: "Segmento con mayor demanda",
        company: "Bovinos terminados",
        metric: "31.200 cabezas",
        helper: "Principal componente del mix de abastecimiento semanal.",
      },
      {
        title: "Proveedor con mayor adjudicación",
        company: "Ganadera Horizonte",
        metric: "11 operaciones",
        helper: "Mejor consistencia en volumen, precio y respuesta.",
      },
      {
        title: "Logística más activa",
        company: "Logística Integral Sur",
        metric: "9 cargas",
        helper: "Mayor participación en operaciones cerradas del frigorífico.",
      },
    ],
    monetization: [
      {
        label: "Ahorro estimado por negociación",
        value: "USD 11.600",
        delta: "+6,8%",
        trend: "up",
      },
      {
        label: "Costo logístico comprometido",
        value: "USD 16.400",
        delta: "+2,7%",
        trend: "up",
      },
      {
        label: "Volumen asegurado",
        value: "USD 145.300",
        delta: "+8,5%",
        trend: "up",
      },
    ],
    insights: [
      {
        title: "Mayor disciplina en cierre comercial",
        description:
          "El frigorífico está convirtiendo mejor sus solicitudes en operaciones adjudicadas respecto al inicio del período.",
      },
      {
        title: "La cobertura está en zona saludable, pero no uniforme",
        description:
          "Las categorías principales muestran buen avance, aunque algunos lotes grandes siguen exigiendo negociación activa.",
      },
      {
        title: "Costo promedio en mejora controlada",
        description:
          "La combinación de mayor competencia y mejor timing de decisión está reduciendo el costo medio de compra.",
      },
    ],
  },

  "30d": {
    hero: {
      kicker: "Panel de frigorífico",
      title: "Control operativo de compras y abastecimiento",
      description:
        "Lectura mensual de abastecimiento, eficiencia comercial, disciplina de cierre y estabilidad logística del frigorífico.",
    },
    coreMetrics: [
      { label: "Solicitudes propias", value: "92", delta: "+14", trend: "up" },
      { label: "Operaciones activas", value: "38", delta: "+7", trend: "up" },
      { label: "Volumen solicitado", value: "268.900", delta: "+12,4%", trend: "up" },
      { label: "Costo promedio", value: "USD 2,76/kg", delta: "-3,1%", trend: "down" },
    ],
    operationalMetrics: [
      { label: "Ofertas recibidas", value: "408", delta: "+15,2%", trend: "up" },
      { label: "Cobertura mensual", value: "87,8%", delta: "+4,9%", trend: "up" },
      { label: "Solicitudes críticas", value: "11", delta: "-4", trend: "down" },
      { label: "Cargas pendientes", value: "16", delta: "+2", trend: "up" },
    ],
    activitySeries: [
      { label: "S1", solicitudes: 21, ofertas: 92, operaciones: 8 },
      { label: "S2", solicitudes: 24, ofertas: 101, operaciones: 10 },
      { label: "S3", solicitudes: 22, ofertas: 96, operaciones: 9 },
      { label: "S4", solicitudes: 25, ofertas: 119, operaciones: 11 },
    ],
    funnelSeries: [
      { stage: "Publicadas", total: 92 },
      { stage: "Con ofertas", total: 80 },
      { stage: "Negociación", total: 61 },
      { stage: "Cerradas", total: 47 },
      { stage: "Con transporte", total: 38 },
      { stage: "Recepción", total: 29 },
    ],
    alerts: [
      {
        severity: "critical",
        title: "Persisten lotes de alta escala con cobertura incompleta",
        description:
          "Las operaciones mayores todavía concentran la mayor parte de la brecha pendiente del mes.",
        action: "Ver lotes",
      },
      {
        severity: "warning",
        title: "La logística absorbe más costo al cierre del período",
        description:
          "El volumen cerrado crece con buen ritmo, pero la presión logística mensual también se incrementa.",
        action: "Analizar costos",
      },
      {
        severity: "monitor",
        title: "Mejor disciplina de adjudicación",
        description:
          "La tasa de conversión entre negociación y cierre mejora de forma sostenida en relación con el ciclo anterior.",
        action: "Ver desempeño",
      },
    ],
    liquidity: {
      demand: 268900,
      supply: 236110,
      gap: 32790,
      coverage: "87,8%",
      avgFirstOffer: "3h 20m",
      avgClose: "13h 05m",
    },
    recentActivity: [
      {
        id: "SOL-FRI-2026-214",
        kind: "Solicitud",
        company: "Frigorífico Central",
        summary: "10.800 bovinos · apertura de lote mensual",
        stage: "Publicada",
        status: "Atención",
        date: "Hoy · 14:20",
      },
      {
        id: "OPE-FRI-2026-109",
        kind: "Operación",
        company: "Estancia Santa Clara",
        summary: "6.300 porcinos · cierre confirmado",
        stage: "Cierre confirmado",
        status: "Estable",
        date: "Hoy · 11:35",
      },
      {
        id: "CAR-FRI-2026-074",
        kind: "Carga",
        company: "Ruta Centro",
        summary: "6 viajes · con programación parcial",
        stage: "Programación parcial",
        status: "Atención",
        date: "Ayer · 18:05",
      },
      {
        id: "OPE-FRI-2026-104",
        kind: "Operación",
        company: "Ganadera San José",
        summary: "5.200 bovinos · recepción finalizada",
        stage: "Recepción finalizada",
        status: "Cerrado",
        date: "Ayer · 15:44",
      },
    ],
    profileActivity: [
      {
        title: "Segmento más comprado",
        company: "Bovinos terminados",
        metric: "121.500 cabezas",
        helper: "Principal eje del abastecimiento del frigorífico en el mes.",
      },
      {
        title: "Proveedor con mayor volumen",
        company: "Estancia Santa Clara",
        metric: "19 adjudicaciones",
        helper: "Mayor participación en operaciones cerradas del período.",
      },
      {
        title: "Logística líder",
        company: "Ruta Centro",
        metric: "22 cargas",
        helper: "Mayor capacidad absorbida en la operación mensual.",
      },
    ],
    monetization: [
      {
        label: "Ahorro estimado por negociación",
        value: "USD 42.700",
        delta: "+9,8%",
        trend: "up",
      },
      {
        label: "Costo logístico comprometido",
        value: "USD 51.200",
        delta: "+4,1%",
        trend: "up",
      },
      {
        label: "Volumen asegurado",
        value: "USD 526.400",
        delta: "+11,5%",
        trend: "up",
      },
    ],
    insights: [
      {
        title: "Escala con mejor disciplina de compra",
        description:
          "El frigorífico está mostrando un proceso más maduro de abastecimiento, con mejores cierres y menor costo medio.",
      },
      {
        title: "La mejora de cobertura ya es estructural",
        description:
          "El porcentaje cubierto mensual confirma un avance operativo más estable y menos dependiente de cierres de último momento.",
      },
      {
        title: "La presión ahora se mueve hacia ejecución logística",
        description:
          "El siguiente salto de eficiencia depende más de consolidar transporte y recepción que de atraer oferta comercial.",
      },
    ],
  },

  "90d": {
    hero: {
      kicker: "Panel de frigorífico",
      title: "Control operativo de compras y abastecimiento",
      description:
        "Lectura consolidada del trimestre sobre abastecimiento, eficiencia de compra, estabilidad de cobertura y capacidad de ejecución logística del frigorífico.",
    },
    coreMetrics: [
      { label: "Solicitudes propias", value: "274", delta: "+36", trend: "up" },
      { label: "Operaciones activas", value: "101", delta: "+16", trend: "up" },
      { label: "Volumen solicitado", value: "804.500", delta: "+18,6%", trend: "up" },
      { label: "Costo promedio", value: "USD 2,71/kg", delta: "-4,5%", trend: "down" },
    ],
    operationalMetrics: [
      { label: "Ofertas recibidas", value: "1.186", delta: "+17,9%", trend: "up" },
      { label: "Cobertura trimestral", value: "89,4%", delta: "+5,8%", trend: "up" },
      { label: "Solicitudes críticas", value: "24", delta: "-8", trend: "down" },
      { label: "Cargas pendientes", value: "39", delta: "+4", trend: "up" },
    ],
    activitySeries: [
      { label: "M1", solicitudes: 82, ofertas: 351, operaciones: 29 },
      { label: "M2", solicitudes: 91, ofertas: 387, operaciones: 33 },
      { label: "M3", solicitudes: 101, ofertas: 448, operaciones: 39 },
    ],
    funnelSeries: [
      { stage: "Publicadas", total: 274 },
      { stage: "Con ofertas", total: 239 },
      { stage: "Negociación", total: 187 },
      { stage: "Cerradas", total: 142 },
      { stage: "Con transporte", total: 114 },
      { stage: "Recepción", total: 88 },
    ],
    alerts: [
      {
        severity: "critical",
        title: "Las operaciones de mayor escala siguen definiendo el gap",
        description:
          "El grueso de la brecha pendiente del trimestre está concentrado en pocos lotes de gran impacto operativo.",
        action: "Ver segmentos",
      },
      {
        severity: "warning",
        title: "El crecimiento de cierre exige más músculo logístico",
        description:
          "La capacidad de transporte y programación de recepción necesita acompañar el ritmo de adjudicación.",
        action: "Revisar capacidad",
      },
      {
        severity: "monitor",
        title: "Mejora sostenida en costo promedio",
        description:
          "La disciplina de abastecimiento del frigorífico está generando una baja real y consistente del costo medio.",
        action: "Ver evolución",
      },
    ],
    liquidity: {
      demand: 804500,
      supply: 719223,
      gap: 85277,
      coverage: "89,4%",
      avgFirstOffer: "3h 42m",
      avgClose: "14h 50m",
    },
    recentActivity: [
      {
        id: "SOL-FRI-2026-621",
        kind: "Solicitud",
        company: "Frigorífico Central",
        summary: "12.400 bovinos · nueva apertura estratégica",
        stage: "Publicada",
        status: "Atención",
        date: "Hoy · 15:08",
      },
      {
        id: "OPE-FRI-2026-301",
        kind: "Operación",
        company: "Ganadera Horizonte",
        summary: "7.100 porcinos · adjudicación final",
        stage: "Adjudicada",
        status: "Estable",
        date: "Hoy · 11:48",
      },
      {
        id: "CAR-FRI-2026-211",
        kind: "Carga",
        company: "Logística Integral Sur",
        summary: "10 viajes · coordinación abierta",
        stage: "Coordinación abierta",
        status: "Atención",
        date: "Ayer · 18:12",
      },
      {
        id: "OPE-FRI-2026-287",
        kind: "Operación",
        company: "Estancia Santa Clara",
        summary: "6.900 bovinos · recepción completada",
        stage: "Recepción completada",
        status: "Cerrado",
        date: "Ayer · 16:02",
      },
    ],
    profileActivity: [
      {
        title: "Segmento más relevante",
        company: "Bovinos premium",
        metric: "346.800 cabezas",
        helper: "Mayor peso relativo en el abastecimiento acumulado del trimestre.",
      },
      {
        title: "Proveedor con mejor desempeño",
        company: "Ganadera Horizonte",
        metric: "43 adjudicaciones",
        helper: "Mayor regularidad en respuesta, volumen y cumplimiento.",
      },
      {
        title: "Logística líder del trimestre",
        company: "Logística Integral Sur",
        metric: "57 cargas",
        helper: "Mayor volumen coordinado para recepción del frigorífico.",
      },
    ],
    monetization: [
      {
        label: "Ahorro estimado por negociación",
        value: "USD 126.900",
        delta: "+12,1%",
        trend: "up",
      },
      {
        label: "Costo logístico comprometido",
        value: "USD 154.800",
        delta: "+6,3%",
        trend: "up",
      },
      {
        label: "Volumen asegurado",
        value: "USD 1.592.400",
        delta: "+16,9%",
        trend: "up",
      },
    ],
    insights: [
      {
        title: "El abastecimiento gana previsibilidad",
        description:
          "El frigorífico muestra una curva más madura de cobertura y cierre, con menor dependencia de decisiones reactivas.",
      },
      {
        title: "La mejora del costo ya no es puntual",
        description:
          "La tendencia trimestral confirma que la competencia de oferta está beneficiando de forma estructural la compra.",
      },
      {
        title: "La expansión futura depende de ejecución",
        description:
          "El cuello principal del siguiente nivel de eficiencia pasa por logística, programación y recepción operativa.",
      },
    ],
  },
};

const DASHBOARD_PRODUCTOR: Record<PeriodKey, DashboardData> = {
  today: {
    hero: {
      kicker: "Panel de productor",
      title: "Control comercial de lotes y adjudicación",
      description:
        "Visión operativa del productor sobre lotes ofertados, solicitudes respondidas, adjudicaciones del día y cumplimiento de entregas comprometidas.",
    },
    coreMetrics: [
      { label: "Lotes ofertados", value: "11", delta: "+2", trend: "up" },
      { label: "Operaciones activas", value: "4", delta: "+1", trend: "up" },
      { label: "Volumen ofertado", value: "18.600", delta: "+5,9%", trend: "up" },
      { label: "Precio promedio logrado", value: "USD 2,93/kg", delta: "+1,4%", trend: "up" },
    ],
    operationalMetrics: [
      { label: "Solicitudes respondidas", value: "17", delta: "+4", trend: "up" },
      { label: "Tasa de adjudicación", value: "41,2%", delta: "+3,5%", trend: "up" },
      { label: "Entregas pendientes", value: "2", delta: "0", trend: "neutral" },
      { label: "Cumplimiento comprometido", value: "96,8%", delta: "+0,8%", trend: "up" },
    ],
    activitySeries: [
      { label: "08h", solicitudes: 3, ofertas: 5, operaciones: 1 },
      { label: "10h", solicitudes: 5, ofertas: 8, operaciones: 1 },
      { label: "12h", solicitudes: 8, ofertas: 11, operaciones: 2 },
      { label: "14h", solicitudes: 11, ofertas: 14, operaciones: 3 },
      { label: "16h", solicitudes: 14, ofertas: 16, operaciones: 4 },
      { label: "18h", solicitudes: 17, ofertas: 17, operaciones: 4 },
    ],
    funnelSeries: [
      { stage: "Detectadas", total: 17 },
      { stage: "Respondidas", total: 17 },
      { stage: "En análisis", total: 9 },
      { stage: "Adjudicadas", total: 7 },
      { stage: "Programadas", total: 4 },
      { stage: "Entregadas", total: 2 },
    ],
    alerts: [
      {
        severity: "critical",
        title: "Dos entregas exigen confirmación final",
        description:
          "Hay operaciones adjudicadas con ventana de carga abierta y coordinación pendiente para cumplimiento total.",
        action: "Ver entregas",
      },
      {
        severity: "warning",
        title: "Tres solicitudes estratégicas siguen sin respuesta",
        description:
          "Existen oportunidades de volumen relevante que aún no fueron atendidas y podrían perderse.",
        action: "Responder solicitudes",
      },
      {
        severity: "monitor",
        title: "Mejora en precio promedio de adjudicación",
        description:
          "La calidad de las oportunidades del día está permitiendo capturar mejores condiciones comerciales.",
        action: "Ver desempeño",
      },
    ],
    liquidity: {
      demand: 18600,
      supply: 15090,
      gap: 3510,
      coverage: "81,1%",
      avgFirstOffer: "1h 42m",
      avgClose: "7h 30m",
    },
    recentActivity: [
      {
        id: "PRO-LOT-2026-071",
        kind: "Solicitud",
        company: "Frigorífico Central",
        summary: "2.800 bovinos · solicitud atendida",
        stage: "Oferta enviada",
        status: "Estable",
        date: "Hoy · 10:22",
      },
      {
        id: "PRO-OPE-2026-034",
        kind: "Operación",
        company: "Frigorífico Sur",
        summary: "3.400 porcinos · adjudicación confirmada",
        stage: "Adjudicada",
        status: "Estable",
        date: "Hoy · 09:40",
      },
      {
        id: "PRO-CAR-2026-011",
        kind: "Carga",
        company: "Ruta Centro",
        summary: "1 viaje comprometido · pendiente retiro",
        stage: "Pendiente de carga",
        status: "Atención",
        date: "Hoy · 08:10",
      },
      {
        id: "PRO-OPE-2026-031",
        kind: "Operación",
        company: "Frigorífico del Este",
        summary: "2.100 bovinos · entrega completada",
        stage: "Entregada",
        status: "Cerrado",
        date: "Ayer · 17:22",
      },
    ],
    profileActivity: [
      {
        title: "Lote con mejor desempeño",
        company: "Bovinos terminados",
        metric: "USD 2,97/kg",
        helper: "Mejor precio promedio alcanzado en el día.",
      },
      {
        title: "Comprador más activo",
        company: "Frigorífico Central",
        metric: "6 solicitudes",
        helper: "Mayor volumen de oportunidades recibidas.",
      },
      {
        title: "Canal más eficiente",
        company: "Operaciones directas",
        metric: "4 cierres",
        helper: "Canal con mayor tasa de adjudicación actual.",
      },
    ],
    monetization: [
      {
        label: "Ingreso proyectado del día",
        value: "USD 54.500",
        delta: "+5,1%",
        trend: "up",
      },
      {
        label: "Prima por mejor precio",
        value: "USD 1.800",
        delta: "+2,4%",
        trend: "up",
      },
      {
        label: "Volumen ya comprometido",
        value: "USD 32.900",
        delta: "+6,3%",
        trend: "up",
      },
    ],
    insights: [
      {
        title: "El productor está reaccionando con buena velocidad",
        description:
          "La tasa de respuesta del día está permitiendo capturar oportunidades antes de que se cierre la competencia.",
      },
      {
        title: "Sube la calidad de adjudicación",
        description:
          "Las operaciones ganadas muestran mejor precio promedio y mejor combinación de volumen y condición comercial.",
      },
      {
        title: "El foco operativo está en cumplimiento",
        description:
          "El siguiente punto crítico ya no es responder, sino asegurar carga y entrega sin fricción.",
      },
    ],
  },

  "7d": {
    hero: {
      kicker: "Panel de productor",
      title: "Control comercial de lotes y adjudicación",
      description:
        "Seguimiento semanal del productor sobre volumen ofertado, adjudicaciones, precio logrado y cumplimiento de entregas programadas.",
    },
    coreMetrics: [
      { label: "Lotes ofertados", value: "39", delta: "+6", trend: "up" },
      { label: "Operaciones activas", value: "16", delta: "+3", trend: "up" },
      { label: "Volumen ofertado", value: "68.400", delta: "+8,7%", trend: "up" },
      { label: "Precio promedio logrado", value: "USD 2,95/kg", delta: "+1,9%", trend: "up" },
    ],
    operationalMetrics: [
      { label: "Solicitudes respondidas", value: "87", delta: "+12", trend: "up" },
      { label: "Tasa de adjudicación", value: "44,8%", delta: "+4,2%", trend: "up" },
      { label: "Entregas pendientes", value: "5", delta: "-1", trend: "down" },
      { label: "Cumplimiento semanal", value: "97,4%", delta: "+0,9%", trend: "up" },
    ],
    activitySeries: [
      { label: "Lun", solicitudes: 11, ofertas: 13, operaciones: 2 },
      { label: "Mar", solicitudes: 13, ofertas: 15, operaciones: 3 },
      { label: "Mié", solicitudes: 12, ofertas: 13, operaciones: 2 },
      { label: "Jue", solicitudes: 15, ofertas: 16, operaciones: 3 },
      { label: "Vie", solicitudes: 16, ofertas: 18, operaciones: 4 },
      { label: "Sáb", solicitudes: 11, ofertas: 12, operaciones: 1 },
      { label: "Dom", solicitudes: 9, ofertas: 10, operaciones: 1 },
    ],
    funnelSeries: [
      { stage: "Detectadas", total: 87 },
      { stage: "Respondidas", total: 87 },
      { stage: "En análisis", total: 48 },
      { stage: "Adjudicadas", total: 39 },
      { stage: "Programadas", total: 21 },
      { stage: "Entregadas", total: 16 },
    ],
    alerts: [
      {
        severity: "critical",
        title: "Cinco entregas aún requieren coordinación final",
        description:
          "Hay operaciones adjudicadas que todavía no cerraron todos los detalles de retiro y documentación.",
        action: "Ver entregas",
      },
      {
        severity: "warning",
        title: "Dos lotes relevantes perdieron timing de respuesta",
        description:
          "Algunas oportunidades de escala media salieron del radar y redujeron potencial de adjudicación.",
        action: "Analizar tiempos",
      },
      {
        severity: "monitor",
        title: "Sólida mejora en precio promedio semanal",
        description:
          "El productor está logrando mejor captura de valor en lotes con mayor competitividad.",
        action: "Ver precios",
      },
    ],
    liquidity: {
      demand: 68400,
      supply: 56320,
      gap: 12080,
      coverage: "82,3%",
      avgFirstOffer: "1h 58m",
      avgClose: "8h 55m",
    },
    recentActivity: [
      {
        id: "PRO-LOT-2026-116",
        kind: "Solicitud",
        company: "Frigorífico Oeste",
        summary: "4.100 bovinos · propuesta enviada",
        stage: "Oferta enviada",
        status: "Estable",
        date: "Hoy · 11:48",
      },
      {
        id: "PRO-OPE-2026-061",
        kind: "Operación",
        company: "Frigorífico Central",
        summary: "3.800 porcinos · adjudicación cerrada",
        stage: "Adjudicada",
        status: "Estable",
        date: "Hoy · 10:14",
      },
      {
        id: "PRO-CAR-2026-019",
        kind: "Carga",
        company: "Logística Integral Sur",
        summary: "2 viajes · programación pendiente",
        stage: "Programación pendiente",
        status: "Atención",
        date: "Hoy · 08:42",
      },
      {
        id: "PRO-OPE-2026-058",
        kind: "Operación",
        company: "Frigorífico Sur",
        summary: "2.900 bovinos · entrega finalizada",
        stage: "Entregada",
        status: "Cerrado",
        date: "Ayer · 18:06",
      },
    ],
    profileActivity: [
      {
        title: "Categoría con mejor precio",
        company: "Bovinos premium",
        metric: "USD 3,04/kg",
        helper: "Mayor valorización media de la semana.",
      },
      {
        title: "Comprador con más cierres",
        company: "Frigorífico Central",
        metric: "9 adjudicaciones",
        helper: "Mayor consistencia de demanda efectiva.",
      },
      {
        title: "Lote con mayor salida",
        company: "Porcinos terminados",
        metric: "14.200 cabezas",
        helper: "Mayor rotación y volumen comprometido.",
      },
    ],
    monetization: [
      {
        label: "Ingreso proyectado semanal",
        value: "USD 201.700",
        delta: "+8,2%",
        trend: "up",
      },
      {
        label: "Prima capturada por precio",
        value: "USD 7.400",
        delta: "+3,6%",
        trend: "up",
      },
      {
        label: "Volumen ya comprometido",
        value: "USD 118.500",
        delta: "+9,1%",
        trend: "up",
      },
    ],
    insights: [
      {
        title: "La operación comercial está más madura",
        description:
          "El productor responde mejor, gana más adjudicaciones y convierte con más consistencia que en semanas anteriores.",
      },
      {
        title: "Sube la captura de precio",
        description:
          "Los lotes mejor posicionados están obteniendo condiciones de venta superiores al promedio histórico reciente.",
      },
      {
        title: "La atención operativa se desplaza a entrega",
        description:
          "El punto de control más importante ya es la coordinación post-cierre para sostener cumplimiento casi total.",
      },
    ],
  },

  "30d": {
    hero: {
      kicker: "Panel de productor",
      title: "Control comercial de lotes y adjudicación",
      description:
        "Lectura mensual del productor sobre rendimiento comercial, tasa de adjudicación, precio obtenido y disciplina de cumplimiento operativo.",
    },
    coreMetrics: [
      { label: "Lotes ofertados", value: "141", delta: "+21", trend: "up" },
      { label: "Operaciones activas", value: "52", delta: "+8", trend: "up" },
      { label: "Volumen ofertado", value: "246.300", delta: "+13,5%", trend: "up" },
      { label: "Precio promedio logrado", value: "USD 2,98/kg", delta: "+2,7%", trend: "up" },
    ],
    operationalMetrics: [
      { label: "Solicitudes respondidas", value: "301", delta: "+34", trend: "up" },
      { label: "Tasa de adjudicación", value: "46,8%", delta: "+4,8%", trend: "up" },
      { label: "Entregas pendientes", value: "13", delta: "-3", trend: "down" },
      { label: "Cumplimiento mensual", value: "97,9%", delta: "+1,1%", trend: "up" },
    ],
    activitySeries: [
      { label: "S1", solicitudes: 66, ofertas: 71, operaciones: 11 },
      { label: "S2", solicitudes: 74, ofertas: 76, operaciones: 13 },
      { label: "S3", solicitudes: 78, ofertas: 79, operaciones: 13 },
      { label: "S4", solicitudes: 83, ofertas: 86, operaciones: 15 },
    ],
    funnelSeries: [
      { stage: "Detectadas", total: 301 },
      { stage: "Respondidas", total: 301 },
      { stage: "En análisis", total: 168 },
      { stage: "Adjudicadas", total: 141 },
      { stage: "Programadas", total: 79 },
      { stage: "Entregadas", total: 52 },
    ],
    alerts: [
      {
        severity: "critical",
        title: "Trece entregas requieren disciplina fina de ejecución",
        description:
          "El volumen adjudicado del mes exige coordinación estable para mantener el alto nivel de cumplimiento.",
        action: "Ver cronograma",
      },
      {
        severity: "warning",
        title: "Mayor presión de competencia en lotes medianos",
        description:
          "El productor mantiene buen nivel de cierre, pero algunos segmentos intermedios muestran puja más agresiva.",
        action: "Analizar segmentos",
      },
      {
        severity: "monitor",
        title: "La tasa de adjudicación sigue mejorando",
        description:
          "El desempeño mensual confirma que la operación comercial está capturando más oportunidades efectivas.",
        action: "Ver evolución",
      },
    ],
    liquidity: {
      demand: 246300,
      supply: 209112,
      gap: 37188,
      coverage: "84,9%",
      avgFirstOffer: "2h 08m",
      avgClose: "9h 40m",
    },
    recentActivity: [
      {
        id: "PRO-LOT-2026-407",
        kind: "Solicitud",
        company: "Frigorífico Central",
        summary: "5.200 bovinos · propuesta enviada",
        stage: "Oferta enviada",
        status: "Estable",
        date: "Hoy · 13:35",
      },
      {
        id: "PRO-OPE-2026-189",
        kind: "Operación",
        company: "Frigorífico Capital",
        summary: "4.600 porcinos · adjudicación cerrada",
        stage: "Adjudicada",
        status: "Estable",
        date: "Hoy · 10:58",
      },
      {
        id: "PRO-CAR-2026-088",
        kind: "Carga",
        company: "Ruta Norte Logística",
        summary: "4 viajes · coordinación parcial",
        stage: "Coordinación parcial",
        status: "Atención",
        date: "Ayer · 17:54",
      },
      {
        id: "PRO-OPE-2026-183",
        kind: "Operación",
        company: "Frigorífico Oeste",
        summary: "3.700 bovinos · entrega completada",
        stage: "Entregada",
        status: "Cerrado",
        date: "Ayer · 15:26",
      },
    ],
    profileActivity: [
      {
        title: "Segmento más rentable",
        company: "Bovinos premium",
        metric: "USD 3,09/kg",
        helper: "Mayor precio promedio sostenido del mes.",
      },
      {
        title: "Comprador más relevante",
        company: "Frigorífico Central",
        metric: "31 adjudicaciones",
        helper: "Principal generador de cierres efectivos.",
      },
      {
        title: "Volumen con mejor salida",
        company: "Porcinos terminados",
        metric: "58.400 cabezas",
        helper: "Mayor volumen total comprometido en el período.",
      },
    ],
    monetization: [
      {
        label: "Ingreso proyectado mensual",
        value: "USD 734.200",
        delta: "+12,4%",
        trend: "up",
      },
      {
        label: "Prima capturada por precio",
        value: "USD 24.900",
        delta: "+5,3%",
        trend: "up",
      },
      {
        label: "Volumen ya comprometido",
        value: "USD 441.600",
        delta: "+13,1%",
        trend: "up",
      },
    ],
    insights: [
      {
        title: "El productor entra en una fase comercial sólida",
        description:
          "La operación ya no depende de pocos cierres aislados, sino de una base más amplia y consistente de adjudicación.",
      },
      {
        title: "El precio promedio mejora con disciplina",
        description:
          "No solo aumenta el volumen comprometido, también mejora la calidad económica de los cierres.",
      },
      {
        title: "La prioridad se mueve a ejecución sin fallas",
        description:
          "Con más volumen adjudicado, la ventaja competitiva está en cumplir sin fricción y sostener reputación operativa.",
      },
    ],
  },

  "90d": {
    hero: {
      kicker: "Panel de productor",
      title: "Control comercial de lotes y adjudicación",
      description:
        "Lectura consolidada del trimestre sobre tracción comercial del productor, captura de precio, adjudicación y cumplimiento de entregas.",
    },
    coreMetrics: [
      { label: "Lotes ofertados", value: "428", delta: "+64", trend: "up" },
      { label: "Operaciones activas", value: "151", delta: "+22", trend: "up" },
      { label: "Volumen ofertado", value: "742.800", delta: "+18,9%", trend: "up" },
      { label: "Precio promedio logrado", value: "USD 3,01/kg", delta: "+3,4%", trend: "up" },
    ],
    operationalMetrics: [
      { label: "Solicitudes respondidas", value: "886", delta: "+102", trend: "up" },
      { label: "Tasa de adjudicación", value: "48,3%", delta: "+5,4%", trend: "up" },
      { label: "Entregas pendientes", value: "31", delta: "-6", trend: "down" },
      { label: "Cumplimiento trimestral", value: "98,1%", delta: "+1,3%", trend: "up" },
    ],
    activitySeries: [
      { label: "M1", solicitudes: 272, ofertas: 281, operaciones: 44 },
      { label: "M2", solicitudes: 294, ofertas: 299, operaciones: 51 },
      { label: "M3", solicitudes: 320, ofertas: 306, operaciones: 56 },
    ],
    funnelSeries: [
      { stage: "Detectadas", total: 886 },
      { stage: "Respondidas", total: 886 },
      { stage: "En análisis", total: 481 },
      { stage: "Adjudicadas", total: 428 },
      { stage: "Programadas", total: 239 },
      { stage: "Entregadas", total: 151 },
    ],
    alerts: [
      {
        severity: "critical",
        title: "El mayor riesgo se traslada a la ejecución post-cierre",
        description:
          "El volumen acumulado exige sostener precisión logística y documental para no erosionar la tasa de cumplimiento.",
        action: "Ver operaciones",
      },
      {
        severity: "warning",
        title: "La competencia crece en segmentos de alto valor",
        description:
          "Los mejores lotes del productor enfrentan mayor puja, lo que demanda velocidad y selectividad comercial.",
        action: "Analizar precios",
      },
      {
        severity: "monitor",
        title: "La captura de precio es estructuralmente mejor",
        description:
          "El trimestre confirma una mejora consistente de precio promedio frente al período anterior.",
        action: "Ver tendencia",
      },
    ],
    liquidity: {
      demand: 742800,
      supply: 642480,
      gap: 100320,
      coverage: "86,5%",
      avgFirstOffer: "2h 20m",
      avgClose: "10h 18m",
    },
    recentActivity: [
      {
        id: "PRO-LOT-2026-891",
        kind: "Solicitud",
        company: "Frigorífico Capital",
        summary: "6.700 bovinos · oportunidad estratégica atendida",
        stage: "Oferta enviada",
        status: "Estable",
        date: "Hoy · 14:42",
      },
      {
        id: "PRO-OPE-2026-402",
        kind: "Operación",
        company: "Frigorífico Central",
        summary: "5.400 porcinos · adjudicación consolidada",
        stage: "Adjudicada",
        status: "Estable",
        date: "Hoy · 11:36",
      },
      {
        id: "PRO-CAR-2026-194",
        kind: "Carga",
        company: "Logística Integral Sur",
        summary: "7 viajes · agenda en confirmación",
        stage: "Agenda en confirmación",
        status: "Atención",
        date: "Ayer · 18:20",
      },
      {
        id: "PRO-OPE-2026-395",
        kind: "Operación",
        company: "Frigorífico Oeste",
        summary: "4.900 bovinos · entrega finalizada",
        stage: "Entregada",
        status: "Cerrado",
        date: "Ayer · 15:58",
      },
    ],
    profileActivity: [
      {
        title: "Segmento estrella",
        company: "Bovinos premium",
        metric: "USD 3,12/kg",
        helper: "Mayor valorización media del trimestre.",
      },
      {
        title: "Comprador con mejor continuidad",
        company: "Frigorífico Central",
        metric: "87 adjudicaciones",
        helper: "Mayor estabilidad de cierre y repetición comercial.",
      },
      {
        title: "Canal más sólido",
        company: "Operaciones recurrentes",
        metric: "151 cierres",
        helper: "Canal con mejor conversión y menor fricción operativa.",
      },
    ],
    monetization: [
      {
        label: "Ingreso proyectado trimestral",
        value: "USD 2.248.700",
        delta: "+17,6%",
        trend: "up",
      },
      {
        label: "Prima capturada por precio",
        value: "USD 81.400",
        delta: "+7,2%",
        trend: "up",
      },
      {
        label: "Volumen ya comprometido",
        value: "USD 1.361.200",
        delta: "+18,4%",
        trend: "up",
      },
    ],
    insights: [
      {
        title: "El productor ya compite en otro nivel",
        description:
          "La combinación de respuesta rápida, mejor tasa de adjudicación y mayor captura de precio confirma una operación más madura.",
      },
      {
        title: "El precio logrado mejora sin perder volumen",
        description:
          "El crecimiento trimestral no se apoya solo en cantidad, sino también en una mejora real de la calidad del cierre.",
      },
      {
        title: "La ventaja futura será reputación de cumplimiento",
        description:
          "Con el volumen actual, la siguiente palanca estratégica es sostener cumplimiento impecable y previsibilidad operativa.",
      },
    ],
  },
};

const DASHBOARD_TRANSPORTISTA: Record<PeriodKey, DashboardData> = {
  today: {
    hero: {
      kicker: "Panel de transportista",
      title: "Control operativo de cargas y asignaciones",
      description:
        "Visión diaria del transportista sobre cargas disponibles, asignaciones activas, utilización de flota y cumplimiento de salidas programadas.",
    },
    coreMetrics: [
      { label: "Cargas visibles", value: "14", delta: "+3", trend: "up" },
      { label: "Asignaciones activas", value: "6", delta: "+1", trend: "up" },
      { label: "Viajes comprometidos", value: "9", delta: "+2", trend: "up" },
      { label: "Ingreso promedio por viaje", value: "USD 620", delta: "+1,8%", trend: "up" },
    ],
    operationalMetrics: [
      { label: "Tasa de adjudicación", value: "42,9%", delta: "+3,1%", trend: "up" },
      { label: "Utilización de flota", value: "76,4%", delta: "+4,4%", trend: "up" },
      { label: "Salidas pendientes", value: "2", delta: "0", trend: "neutral" },
      { label: "Cumplimiento horario", value: "95,2%", delta: "+0,7%", trend: "up" },
    ],
    activitySeries: [
      { label: "08h", solicitudes: 4, ofertas: 3, operaciones: 1 },
      { label: "10h", solicitudes: 6, ofertas: 4, operaciones: 2 },
      { label: "12h", solicitudes: 8, ofertas: 5, operaciones: 3 },
      { label: "14h", solicitudes: 10, ofertas: 6, operaciones: 4 },
      { label: "16h", solicitudes: 12, ofertas: 7, operaciones: 5 },
      { label: "18h", solicitudes: 14, ofertas: 8, operaciones: 6 },
    ],
    funnelSeries: [
      { stage: "Disponibles", total: 14 },
      { stage: "Postuladas", total: 8 },
      { stage: "Preasignadas", total: 7 },
      { stage: "Asignadas", total: 6 },
      { stage: "En curso", total: 4 },
      { stage: "Finalizadas", total: 2 },
    ],
    alerts: [
      {
        severity: "critical",
        title: "Dos salidas pendientes aún sin confirmación final",
        description:
          "Hay viajes comprometidos con ventana próxima que todavía requieren validación de horario y punto de retiro.",
        action: "Ver salidas",
      },
      {
        severity: "warning",
        title: "Capacidad ociosa en una franja de flota",
        description:
          "Parte de la capacidad del día todavía no está capturando suficientes oportunidades de carga.",
        action: "Ver capacidad",
      },
      {
        severity: "monitor",
        title: "Mejora de ingreso medio por viaje",
        description:
          "La calidad de las cargas adjudicadas del día muestra mejor rentabilidad unitaria.",
        action: "Ver ingresos",
      },
    ],
    liquidity: {
      demand: 14,
      supply: 11,
      gap: 3,
      coverage: "78,6%",
      avgFirstOffer: "1h 12m",
      avgClose: "4h 18m",
    },
    recentActivity: [
      {
        id: "TRA-CAR-2026-053",
        kind: "Carga",
        company: "Frigorífico Central",
        summary: "2 viajes · propuesta aceptada",
        stage: "Asignada",
        status: "Estable",
        date: "Hoy · 10:50",
      },
      {
        id: "TRA-OPE-2026-021",
        kind: "Operación",
        company: "Ganadera Horizonte",
        summary: "1 retiro · ruta confirmada",
        stage: "Ruta confirmada",
        status: "Estable",
        date: "Hoy · 09:35",
      },
      {
        id: "TRA-CAR-2026-049",
        kind: "Carga",
        company: "Frigorífico Sur",
        summary: "1 viaje · pendiente horario",
        stage: "Pendiente horario",
        status: "Atención",
        date: "Hoy · 08:24",
      },
      {
        id: "TRA-OPE-2026-019",
        kind: "Operación",
        company: "Frigorífico del Este",
        summary: "2 viajes · entrega completada",
        stage: "Finalizada",
        status: "Cerrado",
        date: "Ayer · 17:15",
      },
    ],
    profileActivity: [
      {
        title: "Ruta con mayor demanda",
        company: "Corredor Centro-Sur",
        metric: "4 cargas",
        helper: "Mayor concentración de oportunidades del día.",
      },
      {
        title: "Cliente más activo",
        company: "Frigorífico Central",
        metric: "5 solicitudes",
        helper: "Mayor volumen de cargas visibles para el transportista.",
      },
      {
        title: "Activo con mejor rendimiento",
        company: "Flota refrigerada",
        metric: "82% uso",
        helper: "Mayor utilización y mejor retorno operativo.",
      },
    ],
    monetization: [
      {
        label: "Ingreso proyectado del día",
        value: "USD 5.580",
        delta: "+4,8%",
        trend: "up",
      },
      {
        label: "Costo operativo estimado",
        value: "USD 2.960",
        delta: "+1,5%",
        trend: "up",
      },
      {
        label: "Margen estimado",
        value: "USD 2.620",
        delta: "+6,1%",
        trend: "up",
      },
    ],
    insights: [
      {
        title: "El transportista captura mejor las oportunidades valiosas",
        description:
          "Las cargas adjudicadas del día presentan mejor ingreso promedio y mejor ajuste a la capacidad disponible.",
      },
      {
        title: "La utilización de flota va en ascenso",
        description:
          "El porcentaje de uso mejora y reduce espacios ociosos durante la jornada.",
      },
      {
        title: "El punto de atención está en coordinación final",
        description:
          "La principal fricción restante está en cerrar detalles de salida y horario de algunos viajes.",
      },
    ],
  },

  "7d": {
    hero: {
      kicker: "Panel de transportista",
      title: "Control operativo de cargas y asignaciones",
      description:
        "Seguimiento semanal del transportista sobre postulaciones, asignaciones, uso de flota y cumplimiento de viajes comprometidos.",
    },
    coreMetrics: [
      { label: "Cargas visibles", value: "58", delta: "+9", trend: "up" },
      { label: "Asignaciones activas", value: "21", delta: "+4", trend: "up" },
      { label: "Viajes comprometidos", value: "34", delta: "+5", trend: "up" },
      { label: "Ingreso promedio por viaje", value: "USD 638", delta: "+2,6%", trend: "up" },
    ],
    operationalMetrics: [
      { label: "Tasa de adjudicación", value: "46,5%", delta: "+4,1%", trend: "up" },
      { label: "Utilización de flota", value: "81,2%", delta: "+5,7%", trend: "up" },
      { label: "Salidas pendientes", value: "5", delta: "-1", trend: "down" },
      { label: "Cumplimiento horario", value: "96,1%", delta: "+0,9%", trend: "up" },
    ],
    activitySeries: [
      { label: "Lun", solicitudes: 8, ofertas: 5, operaciones: 2 },
      { label: "Mar", solicitudes: 9, ofertas: 6, operaciones: 3 },
      { label: "Mié", solicitudes: 7, ofertas: 5, operaciones: 2 },
      { label: "Jue", solicitudes: 10, ofertas: 7, operaciones: 4 },
      { label: "Vie", solicitudes: 11, ofertas: 8, operaciones: 4 },
      { label: "Sáb", solicitudes: 7, ofertas: 4, operaciones: 3 },
      { label: "Dom", solicitudes: 6, ofertas: 3, operaciones: 3 },
    ],
    funnelSeries: [
      { stage: "Disponibles", total: 58 },
      { stage: "Postuladas", total: 38 },
      { stage: "Preasignadas", total: 29 },
      { stage: "Asignadas", total: 21 },
      { stage: "En curso", total: 13 },
      { stage: "Finalizadas", total: 10 },
    ],
    alerts: [
      {
        severity: "critical",
        title: "Cinco salidas aún pendientes de validación",
        description:
          "Una parte de los viajes de la semana sigue abierta en términos de horario final o punto de carga.",
        action: "Ver agenda",
      },
      {
        severity: "warning",
        title: "Capacidad subutilizada en un corredor secundario",
        description:
          "Hay margen para capturar más cargas en una ruta con menor competencia y buena disponibilidad de flota.",
        action: "Ver rutas",
      },
      {
        severity: "monitor",
        title: "Mejora semanal de rentabilidad unitaria",
        description:
          "El ingreso medio por viaje sube junto con una mejor selección de cargas adjudicadas.",
        action: "Ver rentabilidad",
      },
    ],
    liquidity: {
      demand: 58,
      supply: 49,
      gap: 9,
      coverage: "84,5%",
      avgFirstOffer: "1h 26m",
      avgClose: "4h 52m",
    },
    recentActivity: [
      {
        id: "TRA-CAR-2026-133",
        kind: "Carga",
        company: "Frigorífico Capital",
        summary: "3 viajes · adjudicación recibida",
        stage: "Asignada",
        status: "Estable",
        date: "Hoy · 11:42",
      },
      {
        id: "TRA-OPE-2026-067",
        kind: "Operación",
        company: "Frigorífico Central",
        summary: "2 retiros · ventana confirmada",
        stage: "En ejecución",
        status: "Estable",
        date: "Hoy · 10:06",
      },
      {
        id: "TRA-CAR-2026-128",
        kind: "Carga",
        company: "Frigorífico Oeste",
        summary: "1 viaje · pendiente confirmación",
        stage: "Pendiente confirmación",
        status: "Atención",
        date: "Hoy · 08:58",
      },
      {
        id: "TRA-OPE-2026-062",
        kind: "Operación",
        company: "Ganadera San José",
        summary: "2 viajes · finalizados",
        stage: "Finalizada",
        status: "Cerrado",
        date: "Ayer · 18:09",
      },
    ],
    profileActivity: [
      {
        title: "Ruta con mejor salida",
        company: "Corredor Norte-Centro",
        metric: "12 cargas",
        helper: "Ruta con mayor conversión semanal.",
      },
      {
        title: "Cliente con más asignaciones",
        company: "Frigorífico Capital",
        metric: "9 viajes",
        helper: "Mayor generación de trabajo efectivo.",
      },
      {
        title: "Activo más eficiente",
        company: "Flota mixta",
        metric: "84% uso",
        helper: "Mejor equilibrio entre capacidad y adjudicación.",
      },
    ],
    monetization: [
      {
        label: "Ingreso proyectado semanal",
        value: "USD 21.700",
        delta: "+7,2%",
        trend: "up",
      },
      {
        label: "Costo operativo estimado",
        value: "USD 11.900",
        delta: "+2,4%",
        trend: "up",
      },
      {
        label: "Margen estimado",
        value: "USD 9.800",
        delta: "+9,1%",
        trend: "up",
      },
    ],
    insights: [
      {
        title: "La flota se usa con más eficiencia",
        description:
          "La utilización semanal confirma mejor aprovechamiento de la capacidad disponible.",
      },
      {
        title: "Sube la calidad de asignación",
        description:
          "El transportista no solo consigue más viajes, sino que captura mejores condiciones por unidad.",
      },
      {
        title: "La agenda operativa gana previsibilidad",
        description:
          "El cumplimiento horario y la reducción de pendientes muestran una operación más ordenada.",
      },
    ],
  },

  "30d": {
    hero: {
      kicker: "Panel de transportista",
      title: "Control operativo de cargas y asignaciones",
      description:
        "Lectura mensual del transportista sobre tracción comercial, aprovechamiento de flota, rentabilidad de viajes y cumplimiento logístico.",
    },
    coreMetrics: [
      { label: "Cargas visibles", value: "214", delta: "+31", trend: "up" },
      { label: "Asignaciones activas", value: "76", delta: "+11", trend: "up" },
      { label: "Viajes comprometidos", value: "121", delta: "+17", trend: "up" },
      { label: "Ingreso promedio por viaje", value: "USD 652", delta: "+3,8%", trend: "up" },
    ],
    operationalMetrics: [
      { label: "Tasa de adjudicación", value: "48,7%", delta: "+5,3%", trend: "up" },
      { label: "Utilización de flota", value: "84,6%", delta: "+6,4%", trend: "up" },
      { label: "Salidas pendientes", value: "13", delta: "-3", trend: "down" },
      { label: "Cumplimiento horario", value: "96,9%", delta: "+1,2%", trend: "up" },
    ],
    activitySeries: [
      { label: "S1", solicitudes: 49, ofertas: 28, operaciones: 16 },
      { label: "S2", solicitudes: 53, ofertas: 31, operaciones: 18 },
      { label: "S3", solicitudes: 51, ofertas: 30, operaciones: 19 },
      { label: "S4", solicitudes: 61, ofertas: 34, operaciones: 23 },
    ],
    funnelSeries: [
      { stage: "Disponibles", total: 214 },
      { stage: "Postuladas", total: 123 },
      { stage: "Preasignadas", total: 97 },
      { stage: "Asignadas", total: 76 },
      { stage: "En curso", total: 46 },
      { stage: "Finalizadas", total: 35 },
    ],
    alerts: [
      {
        severity: "critical",
        title: "La expansión operativa exige mantener disciplina de agenda",
        description:
          "El volumen mensual crece y obliga a sostener coordinación precisa para evitar fricción en picos de operación.",
        action: "Ver planificación",
      },
      {
        severity: "warning",
        title: "Hay margen de mejora en un corredor con baja captura",
        description:
          "Una parte de la capacidad disponible todavía no está convirtiendo suficiente volumen en cierta ruta secundaria.",
        action: "Analizar corredor",
      },
      {
        severity: "monitor",
        title: "La rentabilidad por viaje sigue mejorando",
        description:
          "La combinación de mejor asignación y mejor ocupación está elevando el resultado económico por unidad.",
        action: "Ver métricas",
      },
    ],
    liquidity: {
      demand: 214,
      supply: 186,
      gap: 28,
      coverage: "86,9%",
      avgFirstOffer: "1h 38m",
      avgClose: "5h 14m",
    },
    recentActivity: [
      {
        id: "TRA-CAR-2026-451",
        kind: "Carga",
        company: "Frigorífico Central",
        summary: "4 viajes · adjudicación mensual relevante",
        stage: "Asignada",
        status: "Estable",
        date: "Hoy · 13:12",
      },
      {
        id: "TRA-OPE-2026-221",
        kind: "Operación",
        company: "Frigorífico Sur",
        summary: "3 retiros · ejecución confirmada",
        stage: "En ejecución",
        status: "Estable",
        date: "Hoy · 10:47",
      },
      {
        id: "TRA-CAR-2026-444",
        kind: "Carga",
        company: "Ganadera Horizonte",
        summary: "2 viajes · pendiente ventana",
        stage: "Pendiente ventana",
        status: "Atención",
        date: "Ayer · 18:26",
      },
      {
        id: "TRA-OPE-2026-214",
        kind: "Operación",
        company: "Frigorífico Oeste",
        summary: "3 viajes · completados",
        stage: "Finalizada",
        status: "Cerrado",
        date: "Ayer · 15:18",
      },
    ],
    profileActivity: [
      {
        title: "Ruta dominante",
        company: "Corredor Centro-Sur",
        metric: "41 viajes",
        helper: "Mayor volumen adjudicado del mes.",
      },
      {
        title: "Cliente con mayor recurrencia",
        company: "Frigorífico Central",
        metric: "28 asignaciones",
        helper: "Principal generador de trabajo recurrente.",
      },
      {
        title: "Activo más rentable",
        company: "Flota refrigerada",
        metric: "USD 701/viaje",
        helper: "Mayor ingreso medio por servicio ejecutado.",
      },
    ],
    monetization: [
      {
        label: "Ingreso proyectado mensual",
        value: "USD 78.900",
        delta: "+11,4%",
        trend: "up",
      },
      {
        label: "Costo operativo estimado",
        value: "USD 42.800",
        delta: "+3,7%",
        trend: "up",
      },
      {
        label: "Margen estimado",
        value: "USD 36.100",
        delta: "+15,2%",
        trend: "up",
      },
    ],
    insights: [
      {
        title: "El transportista entra en un nivel operativo más sólido",
        description:
          "La combinación de mejor adjudicación, mejor uso de flota y más viajes ejecutados confirma una operación más madura.",
      },
      {
        title: "La rentabilidad mejora con selección de cargas",
        description:
          "No solo sube el número de viajes, también mejora la calidad económica media de los que se ejecutan.",
      },
      {
        title: "La coordinación fina sigue siendo clave",
        description:
          "El crecimiento mensual exige sostener control fuerte sobre agenda, ventanas y puntos de retiro.",
      },
    ],
  },

  "90d": {
    hero: {
      kicker: "Panel de transportista",
      title: "Control operativo de cargas y asignaciones",
      description:
        "Lectura consolidada del trimestre sobre crecimiento logístico, uso de flota, eficiencia de adjudicación y rentabilidad operativa del transportista.",
    },
    coreMetrics: [
      { label: "Cargas visibles", value: "621", delta: "+88", trend: "up" },
      { label: "Asignaciones activas", value: "208", delta: "+29", trend: "up" },
      { label: "Viajes comprometidos", value: "338", delta: "+46", trend: "up" },
      { label: "Ingreso promedio por viaje", value: "USD 667", delta: "+4,6%", trend: "up" },
    ],
    operationalMetrics: [
      { label: "Tasa de adjudicación", value: "50,4%", delta: "+6,1%", trend: "up" },
      { label: "Utilización de flota", value: "87,3%", delta: "+7,2%", trend: "up" },
      { label: "Salidas pendientes", value: "31", delta: "-5", trend: "down" },
      { label: "Cumplimiento horario", value: "97,2%", delta: "+1,4%", trend: "up" },
    ],
    activitySeries: [
      { label: "M1", solicitudes: 191, ofertas: 110, operaciones: 61 },
      { label: "M2", solicitudes: 204, ofertas: 118, operaciones: 69 },
      { label: "M3", solicitudes: 226, ofertas: 127, operaciones: 78 },
    ],
    funnelSeries: [
      { stage: "Disponibles", total: 621 },
      { stage: "Postuladas", total: 355 },
      { stage: "Preasignadas", total: 281 },
      { stage: "Asignadas", total: 208 },
      { stage: "En curso", total: 126 },
      { stage: "Finalizadas", total: 95 },
    ],
    alerts: [
      {
        severity: "critical",
        title: "La escala operativa exige consistencia de ejecución",
        description:
          "El nivel trimestral de viajes ya requiere control fuerte de agenda, mantenimiento y coordinación para sostener el estándar logrado.",
        action: "Ver control operativo",
      },
      {
        severity: "warning",
        title: "Hay capacidad marginal sin captura plena en ciertos corredores",
        description:
          "Todavía existe oportunidad para elevar ocupación en algunas rutas menos saturadas.",
        action: "Ver mapas",
      },
      {
        severity: "monitor",
        title: "La mejora de rentabilidad es estructural",
        description:
          "La tendencia del trimestre confirma mejor adjudicación, mejor ingreso por viaje y mejor resultado económico global.",
        action: "Ver tendencia",
      },
    ],
    liquidity: {
      demand: 621,
      supply: 548,
      gap: 73,
      coverage: "88,2%",
      avgFirstOffer: "1h 44m",
      avgClose: "5h 36m",
    },
    recentActivity: [
      {
        id: "TRA-CAR-2026-902",
        kind: "Carga",
        company: "Frigorífico Capital",
        summary: "5 viajes · bloque adjudicado",
        stage: "Asignada",
        status: "Estable",
        date: "Hoy · 14:30",
      },
      {
        id: "TRA-OPE-2026-448",
        kind: "Operación",
        company: "Frigorífico Central",
        summary: "4 retiros · operación consolidada",
        stage: "En ejecución",
        status: "Estable",
        date: "Hoy · 11:12",
      },
      {
        id: "TRA-CAR-2026-894",
        kind: "Carga",
        company: "Ganadera Horizonte",
        summary: "3 viajes · agenda abierta",
        stage: "Agenda abierta",
        status: "Atención",
        date: "Ayer · 18:38",
      },
      {
        id: "TRA-OPE-2026-441",
        kind: "Operación",
        company: "Frigorífico Sur",
        summary: "4 viajes · completados",
        stage: "Finalizada",
        status: "Cerrado",
        date: "Ayer · 16:11",
      },
    ],
    profileActivity: [
      {
        title: "Ruta más fuerte del trimestre",
        company: "Corredor Norte-Centro-Sur",
        metric: "117 viajes",
        helper: "Mayor volumen acumulado de trabajo adjudicado.",
      },
      {
        title: "Cliente más estratégico",
        company: "Frigorífico Central",
        metric: "83 asignaciones",
        helper: "Mayor recurrencia y mejor continuidad operativa.",
      },
      {
        title: "Activo con mejor retorno",
        company: "Flota refrigerada premium",
        metric: "USD 724/viaje",
        helper: "Mayor rendimiento unitario del trimestre.",
      },
    ],
    monetization: [
      {
        label: "Ingreso proyectado trimestral",
        value: "USD 225.400",
        delta: "+16,2%",
        trend: "up",
      },
      {
        label: "Costo operativo estimado",
        value: "USD 120.800",
        delta: "+4,8%",
        trend: "up",
      },
      {
        label: "Margen estimado",
        value: "USD 104.600",
        delta: "+21,7%",
        trend: "up",
      },
    ],
    insights: [
      {
        title: "El transportista ya opera en escala superior",
        description:
          "La evolución trimestral muestra una operación más robusta, con mejor uso de activos y mejor volumen adjudicado.",
      },
      {
        title: "Sube la rentabilidad sin sacrificar cumplimiento",
        description:
          "La mejora económica viene acompañada de disciplina operativa y buen desempeño horario.",
      },
      {
        title: "La ventaja futura está en consistencia de flota",
        description:
          "Con el crecimiento actual, el diferencial competitivo será sostener ocupación alta con mínima fricción operativa.",
      },
    ],
  },
};

const DASHBOARD_BY_ROLE: Record<RoleKey, Record<PeriodKey, DashboardData>> = {
  admin: DASHBOARD_ADMIN,
  frigorifico: DASHBOARD_FRIGORIFICO,
  productor: DASHBOARD_PRODUCTOR,
  transportista: DASHBOARD_TRANSPORTISTA,
};

function normalizeRole(role: unknown): RoleKey {
  if (role === "admin") return "admin";
  if (role === "frigorifico") return "frigorifico";
  if (role === "productor") return "productor";
  if (role === "transportista") return "transportista";
  return "admin";
}

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

function getRoleIndicatorClass(role: RoleKey) {
  switch (role) {
    case "admin":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-100";
    case "frigorifico":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
    case "productor":
      return "border-amber-400/20 bg-amber-400/10 text-amber-100";
    case "transportista":
      return "border-violet-400/20 bg-violet-400/10 text-violet-100";
    default:
      return "border-white/10 bg-white/[0.04] text-white/75";
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
        <span className={["text-xs font-medium", getDeltaClass(item.trend)].join(" ")}>
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
  const role = normalizeRole(session?.role);
  const roleMeta = ROLE_META[role];
  const [period, setPeriod] = useState<PeriodKey>("7d");

  const data = useMemo(() => {
    return DASHBOARD_BY_ROLE[role]?.[period] ?? DASHBOARD_ADMIN[period];
  }, [role, period]);

  return (
    <div className="space-y-5">
      <section className="rounded-[26px] border border-white/10 bg-white/[0.02] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-400/85">
                {data.hero.kicker}
              </p>

              <span
                className={[
                  "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                  getRoleIndicatorClass(role),
                ].join(" ")}
              >
                {roleMeta.badge}
              </span>
            </div>

            <h1 className="mt-2 text-[34px] font-semibold leading-[1.02] tracking-[-0.04em] text-white">
              {data.hero.title}
            </h1>

            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-white/58">
              {data.hero.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72">
                Perfil activo: {roleMeta.label}
              </span>
              <span className="text-sm text-white/46">{roleMeta.description}</span>
            </div>
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
        <SectionShell
          kicker="Evolución temporal"
          title={role === "admin" ? "Actividad del marketplace" : "Actividad operativa propia"}
        >
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

        <SectionShell
          kicker="Embudo operativo"
          title={role === "admin" ? "Conversión del flujo" : "Conversión operativa"}
        >
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

                <p className="mt-3 text-sm leading-7 text-white/58">{alert.description}</p>

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

        <SectionShell
          kicker="Equilibrio operativo"
          title={role === "admin" ? "Liquidez (oferta vs demanda)" : "Cobertura (oferta vs demanda)"}
        >
          <div className="space-y-5">
            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-white/60">
                    {role === "admin" ? "Demanda total activa" : "Demanda propia activa"}
                  </span>
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
                  <span className="text-white/60">
                    {role === "admin" ? "Oferta confirmada" : "Oferta cubierta"}
                  </span>
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

        <SectionShell
          kicker={role === "admin" ? "Adopción" : "Lectura operativa"}
          title={role === "admin" ? "Actividad por perfil" : "Indicadores clave"}
        >
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
                <p className="mt-3 text-[22px] font-semibold text-cyan-200">{item.metric}</p>
                <p className="mt-2 text-sm leading-7 text-white/58">{item.helper}</p>
              </article>
            ))}
          </div>
        </SectionShell>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionShell
          kicker={role === "admin" ? "Modelo económico" : "Economía operativa"}
          title={role === "admin" ? "Monetización" : "Impacto económico"}
        >
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
                <p className="mt-3 text-sm leading-7 text-white/58">{item.description}</p>
              </article>
            ))}
          </div>
        </SectionShell>
      </div>
    </div>
  );
}