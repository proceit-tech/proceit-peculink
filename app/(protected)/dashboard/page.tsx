export default function DashboardPage() {
  return (
    <section className="space-y-6 text-white">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-400/80">
          Panel ejecutivo
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Resumen general de la operación
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
          Visualiza solicitudes activas, ofertas recibidas, cargas en negociación
          y operaciones logísticas en curso dentro del ecosistema PecuLink.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Solicitudes activas", value: "24" },
          { label: "Ofertas recibidas", value: "186" },
          { label: "Operaciones abiertas", value: "12" },
          { label: "Volumen negociado", value: "78.500" },
        ].map((item) => (
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
          Estado del marketplace
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
          Flujo operativo listo para presentación
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
          El sistema ya está preparado para mostrar el recorrido principal:
          publicación de solicitudes, recepción de ofertas, negociación,
          contratación y asignación de transporte.
        </p>
      </div>
    </section>
  );
}