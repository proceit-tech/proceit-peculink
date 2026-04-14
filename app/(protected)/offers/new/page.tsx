"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMockSession } from "@/lib/mock/session";
import type { UserRole } from "@/lib/mock/users";
import { getRequestById } from "@/lib/mock/relations";
import {
  getCoveragePercent,
  getLivestockLabel,
  getPriorityLabel,
  getRequestStatusLabel,
} from "@/lib/mock/requests";

type OfferPriority = "normal" | "medium" | "high" | "critical";
type OfferKind = "supply";
type UnitType = "cabezas" | "kg" | "ton";

type FormValues = {
  supplierName: string;
  quantityOffered: string;
  unit: UnitType;
  pricePerUnit: string;
  origin: string;
  estimatedResponseHours: string;
  availableFrom: string;
  priority: OfferPriority;
  notes: string;
  contactName: string;
  contactPhone: string;
  internalReference: string;
  acceptsPartialAward: boolean;
  hasImmediateAvailability: boolean;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const ROLE_ALLOWED: UserRole[] = ["admin", "productor"];

const PRIORITY_OPTIONS: Array<{
  value: OfferPriority;
  label: string;
  hint: string;
}> = [
  {
    value: "normal",
    label: "Normal",
    hint: "Oferta estándar sin presión adicional.",
  },
  {
    value: "medium",
    label: "Media",
    hint: "Oferta competitiva con buena velocidad de respuesta.",
  },
  {
    value: "high",
    label: "Alta",
    hint: "Oferta prioritaria con intención clara de adjudicación.",
  },
  {
    value: "critical",
    label: "Crítica",
    hint: "Oferta muy agresiva o estratégica para cierre inmediato.",
  },
];

const UNIT_OPTIONS: Array<{ value: UnitType; label: string }> = [
  { value: "cabezas", label: "Cabezas" },
  { value: "kg", label: "Kg" },
  { value: "ton", label: "Ton" },
];

const RESPONSE_TIME_OPTIONS = [
  { value: "2", label: "2 horas" },
  { value: "6", label: "6 horas" },
  { value: "12", label: "12 horas" },
  { value: "24", label: "24 horas" },
  { value: "48", label: "48 horas" },
  { value: "72", label: "72 horas" },
];

const INITIAL_VALUES: FormValues = {
  supplierName: "",
  quantityOffered: "",
  unit: "cabezas",
  pricePerUnit: "",
  origin: "",
  estimatedResponseHours: "24",
  availableFrom: "",
  priority: "medium",
  notes: "",
  contactName: "",
  contactPhone: "",
  internalReference: "",
  acceptsPartialAward: true,
  hasImmediateAvailability: false,
};

function normalizeRole(role: unknown): UserRole {
  if (role === "admin") return "admin";
  if (role === "frigorifico") return "frigorifico";
  if (role === "productor") return "productor";
  if (role === "transportista") return "transportista";
  return "admin";
}

function getPriorityTone(priority: OfferPriority) {
  switch (priority) {
    case "critical":
      return "border-red-400/20 bg-red-400/10 text-red-100";
    case "high":
      return "border-amber-400/20 bg-amber-400/10 text-amber-100";
    case "medium":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-100";
    case "normal":
    default:
      return "border-white/10 bg-white/[0.04] text-white/72";
  }
}

function validateForm(values: FormValues) {
  const errors: FormErrors = {};

  if (!values.supplierName.trim()) {
    errors.supplierName = "Indica el nombre del productor o proveedor.";
  }

  if (!values.quantityOffered.trim()) {
    errors.quantityOffered = "Indica la cantidad ofertada.";
  } else {
    const quantity = Number(values.quantityOffered);
    if (Number.isNaN(quantity) || quantity <= 0) {
      errors.quantityOffered = "La cantidad ofertada debe ser mayor que cero.";
    }
  }

  if (!values.pricePerUnit.trim()) {
    errors.pricePerUnit = "Indica el precio por unidad.";
  } else {
    const price = Number(values.pricePerUnit);
    if (Number.isNaN(price) || price <= 0) {
      errors.pricePerUnit = "El precio por unidad debe ser mayor que cero.";
    }
  }

  if (!values.origin.trim()) {
    errors.origin = "Indica el origen real de la oferta.";
  }

  if (!values.availableFrom.trim()) {
    errors.availableFrom = "Indica la fecha de disponibilidad.";
  }

  if (!values.contactName.trim()) {
    errors.contactName = "Indica el responsable comercial.";
  }

  if (!values.contactPhone.trim()) {
    errors.contactPhone = "Indica un teléfono de contacto.";
  }

  if (values.notes.trim().length > 1200) {
    errors.notes = "La nota comercial no debe superar 1200 caracteres.";
  }

  if (values.internalReference.trim().length > 80) {
    errors.internalReference = "La referencia interna no debe superar 80 caracteres.";
  }

  return errors;
}

function FieldShell({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white/88">{label}</span>
        {required ? (
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
            Required
          </span>
        ) : null}
      </div>

      {hint ? <p className="text-xs leading-6 text-white/42">{hint}</p> : null}

      {children}

      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  error = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  error?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={[
        "w-full rounded-2xl border bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition",
        "placeholder:text-white/28",
        error
          ? "border-red-400/30 focus:border-red-300/60"
          : "border-white/10 focus:border-cyan-400/40",
      ].join(" ")}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  error = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={6}
      className={[
        "w-full rounded-2xl border bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition",
        "placeholder:text-white/28",
        error
          ? "border-red-400/30 focus:border-red-300/60"
          : "border-white/10 focus:border-cyan-400/40",
      ].join(" ")}
    />
  );
}

function SelectInput({
  value,
  onChange,
  children,
  error = false,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={[
        "w-full rounded-2xl border bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition",
        error
          ? "border-red-400/30 focus:border-red-300/60"
          : "border-white/10 focus:border-cyan-400/40",
      ].join(" ")}
    >
      {children}
    </select>
  );
}

function OffersNewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = getMockSession();
  const role = normalizeRole(session?.role);

  const requestId = searchParams.get("requestId");
  const request = requestId ? getRequestById(requestId) : null;

  const [values, setValues] = useState<FormValues>({
    ...INITIAL_VALUES,
    supplierName: session?.company ?? "",
    origin: "",
    unit: "cabezas",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const canAccess = ROLE_ALLOWED.includes(role);

  const quantityNumber = Number(values.quantityOffered || 0);
  const pricePerUnitNumber = Number(values.pricePerUnit || 0);
  const totalCommercialValue =
    quantityNumber > 0 && pricePerUnitNumber > 0
      ? quantityNumber * pricePerUnitNumber
      : 0;

  const coveragePercent = request ? getCoveragePercent(request) : 0;
  const requestedQuantity = request ? Number(request.quantity) : 0;
  const offeredCoveragePercent =
    requestedQuantity > 0 && quantityNumber > 0
      ? Math.min(100, Math.round((quantityNumber / requestedQuantity) * 100))
      : 0;

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!requestId || !request) {
      return;
    }

    const validation = validateForm(values);
    setErrors(validation);
    setSubmitMessage(null);

    if (Object.keys(validation).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        kind: "supply" as OfferKind,
        requestId,
        supplierRole: "productor",
        supplierName: values.supplierName.trim(),
        quantityOffered: Number(values.quantityOffered),
        unit: values.unit,
        pricePerUnit: Number(values.pricePerUnit),
        origin: values.origin.trim(),
        destination: request.destination,
        responseTimeHours: Number(values.estimatedResponseHours),
        availableFrom: values.availableFrom,
        priority: values.priority,
        notes: values.notes.trim() || null,
        contactName: values.contactName.trim(),
        contactPhone: values.contactPhone.trim(),
        internalReference: values.internalReference.trim() || null,
        acceptsPartialAward: values.acceptsPartialAward,
        hasImmediateAvailability: values.hasImmediateAvailability,
        createdByRole: role,
        createdAt: new Date().toISOString(),
        derivedMetrics: {
          totalCommercialValue,
          offeredCoveragePercent,
        },
      };

      console.log("NEW_SUPPLY_OFFER_PAYLOAD", payload);

      await new Promise((resolve) => setTimeout(resolve, 900));

      setSubmitMessage(
        "Oferta creada en modo mock. Redirigiendo al grupo de offers de la demanda..."
      );
      setTimeout(() => {
        router.push(`/offers?requestId=${requestId}`);
      }, 800);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!canAccess) {
    return (
      <section className="space-y-6 text-white">
        <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

          <div className="px-6 py-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-400/80">
              Acceso restringido
            </p>
            <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-white">
              Este perfil no puede crear ofertas de productor
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
              La oferta comercial sobre demanda está habilitada para administración y productor.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/offers"
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
              >
                Volver a offers
              </Link>

              <Link
                href="/requests"
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
              >
                Ver solicitudes
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!requestId) {
    return (
      <section className="space-y-6 text-white">
        <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

          <div className="px-6 py-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-400/80">
              Vinculación requerida
            </p>
            <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-white">
              Esta oferta debe estar vinculada a una demanda
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
              Para crear una oferta de productor, abre esta pantalla con un requestId
              válido, por ejemplo desde el detalle de una solicitud o desde el listado de oportunidades.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/requests"
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
              >
                Ir a solicitudes
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!request) {
    return (
      <section className="space-y-6 text-white">
        <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

          <div className="px-6 py-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-400/80">
              Demanda no encontrada
            </p>
            <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-white">
              No existe la solicitud vinculada
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
              El requestId informado no corresponde a una demanda válida dentro del mock actual.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
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

  return (
    <section className="space-y-6 text-white">
      <div className="overflow-hidden rounded-[26px] border border-cyan-400/20 bg-cyan-400/[0.06]">
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

        <div className="px-6 py-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300/90">
                Demanda vinculada
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link
                  href={`/requests/${request.id}`}
                  className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-400/15"
                >
                  {request.id}
                </Link>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72">
                  {getRequestStatusLabel(request.status)}
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72">
                  {getPriorityLabel(request.priority)}
                </span>
              </div>

              <h1 className="mt-4 text-[28px] font-semibold tracking-[-0.04em] text-white">
                Crear oferta comercial sobre esta demanda
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62">
                {request.frigorifico} · {getLivestockLabel(request.type)} ·{" "}
                {request.quantity.toLocaleString()} {request.unit} · {request.origin} →{" "}
                {request.destination}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/requests/${request.id}`}
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white"
              >
                Ver request
              </Link>

              <Link
                href={`/offers?requestId=${request.id}`}
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white"
              >
                Ver offers
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

        <div className="px-6 py-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-400/80">
                Nueva oferta
              </p>

              <h2 className="mt-2 text-[32px] font-semibold tracking-[-0.04em] text-white">
                Oferta del productor vinculada a la demanda
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">
                Registra una propuesta comercial concreta sobre esta solicitud, con volumen,
                precio, velocidad de respuesta y condiciones de disponibilidad.
              </p>
            </div>

            <span
              className={[
                "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                getPriorityTone(values.priority),
              ].join(" ")}
            >
              Prioridad {values.priority}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <article className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
            <div className="px-6 py-6">
              <div className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
                  Identidad comercial
                </p>
                <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
                  Base de la propuesta
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FieldShell
                  label="Productor / proveedor"
                  hint="Nombre visible del proveedor que envía la oferta."
                  required
                  error={errors.supplierName}
                >
                  <TextInput
                    value={values.supplierName}
                    onChange={(value) => updateField("supplierName", value)}
                    placeholder="Ej. Ganadera Santa Rosa"
                    error={!!errors.supplierName}
                  />
                </FieldShell>

                <FieldShell
                  label="Referencia interna"
                  hint="Código interno del proveedor para control comercial."
                  error={errors.internalReference}
                >
                  <TextInput
                    value={values.internalReference}
                    onChange={(value) => updateField("internalReference", value)}
                    placeholder="Ej. OFR-SUP-009"
                    error={!!errors.internalReference}
                  />
                </FieldShell>

                <FieldShell
                  label="Prioridad de la oferta"
                  hint="Intensidad comercial con la que se presenta esta propuesta."
                  required
                >
                  <SelectInput
                    value={values.priority}
                    onChange={(value) => updateField("priority", value as OfferPriority)}
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-[#0b1220]">
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                </FieldShell>

                <FieldShell
                  label="Tiempo estimado de respuesta"
                  hint="Velocidad comprometida para atender seguimiento comercial."
                  required
                >
                  <SelectInput
                    value={values.estimatedResponseHours}
                    onChange={(value) => updateField("estimatedResponseHours", value)}
                  >
                    {RESPONSE_TIME_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-[#0b1220]">
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                </FieldShell>
              </div>
            </div>
          </article>

          <article className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
            <div className="px-6 py-6">
              <div className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
                  Volumen y precio
                </p>
                <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
                  Configuración económica de la oferta
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FieldShell
                  label="Cantidad ofertada"
                  hint="Volumen que realmente puedes comprometer."
                  required
                  error={errors.quantityOffered}
                >
                  <TextInput
                    type="number"
                    value={values.quantityOffered}
                    onChange={(value) => updateField("quantityOffered", value)}
                    placeholder="Ej. 90"
                    error={!!errors.quantityOffered}
                  />
                </FieldShell>

                <FieldShell
                  label="Unidad"
                  hint="Unidad comercial utilizada por la oferta."
                  required
                >
                  <SelectInput
                    value={values.unit}
                    onChange={(value) => updateField("unit", value as UnitType)}
                  >
                    {UNIT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-[#0b1220]">
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                </FieldShell>

                <FieldShell
                  label="Precio por unidad"
                  hint="Valor económico unitario de la propuesta."
                  required
                  error={errors.pricePerUnit}
                >
                  <TextInput
                    type="number"
                    value={values.pricePerUnit}
                    onChange={(value) => updateField("pricePerUnit", value)}
                    placeholder="Ej. 430"
                    error={!!errors.pricePerUnit}
                  />
                </FieldShell>

                <FieldShell
                  label="Origen de la oferta"
                  hint="Ubicación real desde donde sale el abastecimiento."
                  required
                  error={errors.origin}
                >
                  <TextInput
                    value={values.origin}
                    onChange={(value) => updateField("origin", value)}
                    placeholder="Ej. San Pedro"
                    error={!!errors.origin}
                  />
                </FieldShell>

                <FieldShell
                  label="Disponible desde"
                  hint="Fecha a partir de la cual el volumen está disponible."
                  required
                  error={errors.availableFrom}
                >
                  <TextInput
                    type="date"
                    value={values.availableFrom}
                    onChange={(value) => updateField("availableFrom", value)}
                    error={!!errors.availableFrom}
                  />
                </FieldShell>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <input
                    type="checkbox"
                    checked={values.acceptsPartialAward}
                    onChange={(event) =>
                      updateField("acceptsPartialAward", event.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent"
                  />
                  <div>
                    <p className="text-sm font-medium text-white/88">
                      Acepta adjudicación parcial
                    </p>
                    <p className="mt-1 text-xs leading-6 text-white/42">
                      Permite cerrar solo una parte del volumen ofertado si la demanda así lo
                      requiere.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <input
                    type="checkbox"
                    checked={values.hasImmediateAvailability}
                    onChange={(event) =>
                      updateField("hasImmediateAvailability", event.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent"
                  />
                  <div>
                    <p className="text-sm font-medium text-white/88">
                      Disponibilidad inmediata
                    </p>
                    <p className="mt-1 text-xs leading-6 text-white/42">
                      Señal fuerte para acelerar shortlist, negociación o adjudicación.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </article>

          <article className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
            <div className="px-6 py-6">
              <div className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
                  Contacto y observaciones
                </p>
                <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
                  Soporte comercial de la oferta
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FieldShell
                  label="Responsable comercial"
                  hint="Persona responsable del seguimiento de esta oferta."
                  required
                  error={errors.contactName}
                >
                  <TextInput
                    value={values.contactName}
                    onChange={(value) => updateField("contactName", value)}
                    placeholder="Ej. Juan Pérez"
                    error={!!errors.contactName}
                  />
                </FieldShell>

                <FieldShell
                  label="Teléfono de contacto"
                  hint="Canal directo para negociación y cierre."
                  required
                  error={errors.contactPhone}
                >
                  <TextInput
                    value={values.contactPhone}
                    onChange={(value) => updateField("contactPhone", value)}
                    placeholder="Ej. +595 981 000000"
                    error={!!errors.contactPhone}
                  />
                </FieldShell>
              </div>

              <div className="mt-5">
                <FieldShell
                  label="Nota comercial"
                  hint="Contexto adicional de calidad, disponibilidad, documentación o condiciones."
                  error={errors.notes}
                >
                  <TextArea
                    value={values.notes}
                    onChange={(value) => updateField("notes", value)}
                    placeholder="Ej. Lote disponible con documentación completa, posibilidad de embarque rápido y coordinación flexible según ventana de retiro."
                    error={!!errors.notes}
                  />
                </FieldShell>
              </div>
            </div>
          </article>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creando oferta..." : "Crear oferta"}
            </button>

            <button
              type="button"
              onClick={() => {
                setValues({
                  ...INITIAL_VALUES,
                  supplierName: session?.company ?? "",
                });
                setErrors({});
                setSubmitMessage(null);
              }}
              className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
            >
              Limpiar formulario
            </button>

            {submitMessage ? <p className="text-sm text-emerald-300">{submitMessage}</p> : null}
          </div>
        </form>

        <aside className="space-y-6">
          <article className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
            <div className="px-6 py-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
                Resumen de la demanda
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Request
                  </p>
                  <p className="mt-2 text-[18px] font-semibold text-white">{request.id}</p>
                  <p className="mt-2 text-xs text-white/45">
                    {getRequestStatusLabel(request.status)}
                  </p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Frigorífico
                  </p>
                  <p className="mt-2 text-[18px] font-semibold text-white">
                    {request.frigorifico}
                  </p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Demanda
                  </p>
                  <p className="mt-2 text-[18px] font-semibold text-white">
                    {request.quantity.toLocaleString()} {request.unit}
                  </p>
                  <p className="mt-2 text-xs text-white/45">{getLivestockLabel(request.type)}</p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Cobertura actual
                  </p>
                  <p className="mt-2 text-[18px] font-semibold text-white">
                    {coveragePercent}%
                  </p>
                  <p className="mt-2 text-xs text-white/45">
                    Prioridad {getPriorityLabel(request.priority)}
                  </p>
                </div>
              </div>
            </div>
          </article>

          <article className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
            <div className="px-6 py-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
                Lectura de tu oferta
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Cobertura ofrecida
                  </p>
                  <p className="mt-2 text-[18px] font-semibold text-white">
                    {offeredCoveragePercent}%
                  </p>
                  <p className="mt-2 text-xs text-white/45">
                    Sobre el volumen total solicitado
                  </p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Valor comercial
                  </p>
                  <p className="mt-2 text-[18px] font-semibold text-white">
                    {totalCommercialValue > 0
                      ? `USD ${totalCommercialValue.toLocaleString()}`
                      : "No calculado"}
                  </p>
                  <p className="mt-2 text-xs text-white/45">
                    Cantidad ofertada × precio por unidad
                  </p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Tiempo de respuesta
                  </p>
                  <p className="mt-2 text-[18px] font-semibold text-white">
                    {values.estimatedResponseHours} h
                  </p>
                  <p className="mt-2 text-xs text-white/45">
                    Compromiso de atención comercial
                  </p>
                </div>
              </div>
            </div>
          </article>

          <article className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
            <div className="px-6 py-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
                Criterios recomendados
              </p>

              <div className="mt-5 space-y-4">
                {PRIORITY_OPTIONS.map((item) => {
                  const active = item.value === values.priority;

                  return (
                    <div
                      key={item.value}
                      className={[
                        "rounded-[18px] border px-4 py-4",
                        active
                          ? getPriorityTone(item.value)
                          : "border-white/10 bg-white/[0.03] text-white/72",
                      ].join(" ")}
                    >
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="mt-1 text-xs leading-6 opacity-80">{item.hint}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}

export default function NewSupplyOfferPage() {
  return (
    <Suspense
      fallback={
        <section className="space-y-6 text-white">
          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] px-6 py-8">
            <p className="text-sm leading-7 text-white/58">Cargando oferta comercial...</p>
          </div>
        </section>
      }
    >
      <OffersNewPageContent />
    </Suspense>
  );
}