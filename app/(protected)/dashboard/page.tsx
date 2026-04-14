"use client";

import { getMockSession } from "@/lib/mock/session";

export default function DashboardPage() {
  const session = getMockSession();
  const role = session?.role ?? "frigorifico";

  const content = getDashboardContent(role);

  return (
    <section className="space-y-6 text-white">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-400/80">
          {content.kicker}
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          {content.title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
          {content.description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {content.metrics.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
              {item.label}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-400/80">
          Vista operativa
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
          {content.panelTitle}
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
          {content.panelDescription}
        </p>
      </div>
    </section>
  );
}

function getDashboardContent(role: string) {
  switch (role) {
    case "productor":
      return {
        kicker: "Panel del productor",
        title: "Resumen comercial de oportunidades y ofertas",
        description:
          "Consulta solicitudes activas, presenta propuestas competitivas y acompaña negociaciones abiertas con frigoríficos.",
        metrics: [
          { label: "Oportunidades activas", value: "18" },
          { label: "Ofertas enviadas", value: "42" },
          { label: "Negociaciones abiertas", value: "9" },
          { label: "Volumen ofertado", value: "31.200" },
        ],
        panelTitle: "Actividad comercial priorizada",
        panelDescription:
          "El entorno del productor está preparado para visualizar oportunidades vigentes, enviar ofertas y gestionar seguimiento comercial por operación.",
      };

    case "transportista":
      return {
        kicker: "Panel del transportista",
        title: "Resumen logístico de cargas y propuestas",
        description:
          "Accede a cargas disponibles, presenta propuestas totales o parciales y gestiona operaciones asignadas en curso.",
        metrics: [
          { label: "Cargas disponibles", value: "26" },
          { label: "Propuestas enviadas", value: "17" },
          { label: "Operaciones asignadas", value: "6" },
          { label: "Capacidad comprometida", value: "14.800" },
        ],
        panelTitle: "Operación logística preparada",
        panelDescription:
          "El entorno del transportista está enfocado en capturar demanda logística, presentar condiciones de transporte y seguir operaciones ya adjudicadas.",
      };

    case "frigorifico":
    default:
      return {
        kicker: "Panel ejecutivo",
        title: "Resumen general de la operación",
        description:
          "Visualiza solicitudes activas, ofertas recibidas, cargas en negociación y operaciones logísticas en curso dentro del ecosistema PecuLink.",
        metrics: [
          { label: "Solicitudes activas", value: "24" },
          { label: "Ofertas recibidas", value: "186" },
          { label: "Operaciones abiertas", value: "12" },
          { label: "Volumen negociado", value: "78.500" },
        ],
        panelTitle: "Flujo operativo listo para presentación",
        panelDescription:
          "El sistema ya está preparado para mostrar el recorrido principal: publicación de solicitudes, recepción de ofertas, negociación, contratación y asignación de transporte.",
      };
  }
}