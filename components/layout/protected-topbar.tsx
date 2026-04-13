"use client";

export default function ProtectedTopbar() {
  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-400/80">
            PecuLink
          </span>
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Panel de control
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
              Perfil activo
            </p>
            <p className="text-sm font-semibold text-white">Frigorífico SUL</p>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-white">
            Frigorífico
          </div>
        </div>
      </div>
    </header>
  );
}