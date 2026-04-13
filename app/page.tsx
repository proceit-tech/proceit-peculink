import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#05070A] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400/80">
          PecuLink
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight">
          Marketplace ganadero B2B
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
          Plataforma digital para conectar frigoríficos, productores y transportistas
          en un flujo integrado de solicitud, oferta, negociación y operación logística.
        </p>

        <div className="mt-8">
          <Link
            href="/login"
            className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400/15"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  );
}