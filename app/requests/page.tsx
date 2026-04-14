import { requests } from "@/lib/mock/requests";

export default function RequestsPage() {
  return (
    <section className="space-y-6 text-white">

      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-400/80">
          Solicitudes
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Demandas de frigoríficos
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
          Visualiza las solicitudes activas publicadas por frigoríficos y responde con ofertas de productores.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-white/50">
            <tr>
              <th className="px-6 py-4">Frigorífico</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Cantidad</th>
              <th className="px-6 py-4">Origen</th>
              <th className="px-6 py-4">Destino</th>
              <th className="px-6 py-4">Estado</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((req) => (
              <tr
                key={req.id}
                className="border-b border-white/5 hover:bg-white/5 transition"
              >
                <td className="px-6 py-4 font-medium">
                  {req.frigorifico}
                </td>

                <td className="px-6 py-4 capitalize">
                  {req.type}
                </td>

                <td className="px-6 py-4">
                  {req.quantity.toLocaleString()} {req.unit}
                </td>

                <td className="px-6 py-4">
                  {req.origin}
                </td>

                <td className="px-6 py-4">
                  {req.destination}
                </td>

                <td className="px-6 py-4">
                  <span className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold">
                    {getStatusLabel(req.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </section>
  );
}

function getStatusLabel(status: string) {
  switch (status) {
    case "open":
      return "Abierta";
    case "negotiating":
      return "En negociación";
    case "partial":
      return "Parcial";
    case "closed":
      return "Cerrada";
    default:
      return status;
  }
}