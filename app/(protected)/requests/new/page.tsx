"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getMockSession } from "@/lib/mock/session";
import type { UserRole } from "@/lib/mock/users";

type Priority = "normal" | "medium" | "high" | "critical";
type LivestockType = "bovino" | "porcino" | "ovino" | "aves" | "mixto";
type UnitType = "cabezas" | "kg" | "ton";
type DemandVisibility = "marketplace" | "private_network" | "restricted";
type TransportMode = "required" | "optional" | "not_required";

type FormValues = {
  frigorificoName: string;
  livestockType: LivestockType;
  quantity: string;
  unit: UnitType;
  origin: string;
  destination: string;
  neededBy: string;
  priority: Priority;
  priceTarget: string;
  transportMode: TransportMode;
  visibleToTransportistas: boolean;
  partialCoverageAllowed: boolean;
  visibility: DemandVisibility;
  notes: string;
  contactName: string;
  contactPhone: string;
  internalReference: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const ROLE_ALLOWED: UserRole[] = ["admin", "frigorifico"];

const LIVESTOCK_OPTIONS: Array<{ value: LivestockType; label: string; description: string }> = [
  { value: "bovino", label: "Bovino", description: "Compra de ganado bovino" },
  { value: "porcino", label: "Porcino", description: "Compra de ganado porcino" },
  { value: "ovino", label: "Ovino", description: "Compra de ganado ovino" },
  { value: "aves", label: "Aves", description: "Compra de aves / lote avícola" },
  { value: "mixto", label: "Mixto", description: "Demanda combinada o excepcional" },
];

const PRIORITY_OPTIONS: Array<{ value: Priority; label: string; hint: string }> = [
  { value: "normal", label: "Normal", hint: "Ejecución estándar sin presión inmediata." },
  { value: "medium", label: "Media", hint: "Necesita tracción comercial razonable." },
  { value: "high", label: "Alta", hint: "Debe moverse con prioridad operativa." },
  { value: "critical", label: "Crítica", hint: "Riesgo directo para la operación si no se cubre." },
];

const UNIT_OPTIONS: Array<{ value: UnitType; label: string }> = [
  { value: "cabezas", label: "Cabezas" },
  { value: "kg", label: "Kg" },
  { value: "ton", label: "Ton" },
];

const VISIBILITY_OPTIONS: Array<{ value: DemandVisibility; label: string; hint: string }> = [
  {
    value: "marketplace",
    label: "Marketplace abierto",
    hint: "Visible para toda la red habilitada según reglas del sistema.",
  },
  {
    value: "private_network",
    label: "Red privada",
    hint: "Visible solo para una red comercial más controlada.",
  },
  {
    value: "restricted",
    label: "Restringida",
    hint: "Uso más reservado para operación dirigida.",
  },
];

const TRANSPORT_OPTIONS: Array<{ value: TransportMode; label: string; hint: string }> = [
  {
    value: "required",
    label: "Transporte requerido",
    hint: "La solicitud ya nace con necesidad logística.",
  },
  {
    value: "optional",
    label: "Transporte opcional",
    hint: "Se puede evaluar logística según cierre comercial.",
  },
  {
    value: "not_required",
    label: "Sin transporte",
    hint: "No requiere capa logística dentro del marketplace.",
  },
];

const INITIAL_VALUES: FormValues = {
  frigorificoName: "",
  livestockType: "bovino",
  quantity: "",
  unit: "cabezas",
  origin: "",
  destination: "",
  neededBy: "",
  priority: "medium",
  priceTarget: "",
  transportMode: "required",
  visibleToTransportistas: true,
  partialCoverageAllowed: true,
  visibility: "marketplace",
  notes: "",
  contactName: "",
  contactPhone: "",
  internalReference: "",
};

function normalizeRole(role: unknown): UserRole {
  if (role === "admin") return "admin";
  if (role === "frigorifico") return "frigorifico";
  if (role === "productor") return "productor";
  if (role === "transportista") return "transportista";
  return "admin";
}

function getPriorityTone(priority: Priority) {
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

function getRoleCopy(role: UserRole) {
  if (role === "admin") {
    return {
      kicker: "Nueva solicitud",
      title: "Creación estratégica de demanda marketplace",
      description:
        "Registra una nueva solicitud con lectura ejecutiva, parámetros comerciales y condiciones logísticas para activar el ciclo completo del marketplace.",
    };
  }

  return {
    kicker: "Nueva demanda",
    title: "Registrar demanda de compra del frigorífico",
    description:
      "Crea una nueva solicitud con volumen, prioridad, destino, target económico y reglas de visibilidad para activar respuesta comercial y logística.",
  };
}

function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.frigorificoName.trim()) {
    errors.frigorificoName = "Indica el nombre del frigorífico o unidad compradora.";
  }

  if (!values.quantity.trim()) {
    errors.quantity = "Indica la cantidad requerida.";
  } else {
    const quantity = Number(values.quantity);
    if (Number.isNaN(quantity) || quantity <= 0) {
      errors.quantity = "La cantidad debe ser mayor que cero.";
    }
  }

  if (!values.origin.trim()) {
    errors.origin = "Indica el origen operativo.";
  }

  if (!values.destination.trim()) {
    errors.destination = "Indica el destino operativo.";
  }

  if (!values.neededBy.trim()) {
    errors.neededBy = "Indica la fecha objetivo de necesidad.";
  }

  if (values.priceTarget.trim()) {
    const price = Number(values.priceTarget);
    if (Number.isNaN(price) || price < 0) {
      errors.priceTarget = "El target económico debe ser un número válido.";
    }
  }

  if (!values.contactName.trim()) {
    errors.contactName = "Indica el responsable de contacto.";
  }

  if (!values.contactPhone.trim()) {
    errors.contactPhone = "Indica un teléfono de contacto.";
  }

  if (values.notes.trim().length > 1200) {
    errors.notes = "La nota operativa no debe superar 1200 caracteres.";
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

export default function NewRequestPage() {
  const router = useRouter();
  const session = getMockSession();
  const role = normalizeRole(session?.role);
  const copy = getRoleCopy(role);

  const [values, setValues] = useState<FormValues>({
    ...INITIAL_VALUES,
    frigorificoName: session?.company ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const quantityNumber = Number(values.quantity || 0);
  const priceTargetNumber = Number(values.priceTarget || 0);
  const grossEstimate =
    quantityNumber > 0 && priceTargetNumber > 0 ? quantityNumber * priceTargetNumber : 0;

  const summary = useMemo(() => {
    const transportRequired = values.transportMode === "required";
    const transportOptional = values.transportMode === "optional";

    return {
      transportLabel: transportRequired
        ? "Transporte requerido"
        : transportOptional
          ? "Transporte opcional"
          : "Sin transporte",
      visibilityLabel:
        values.visibility === "marketplace"
          ? "Marketplace abierto"
          : values.visibility === "private_network"
            ? "Red privada"
            : "Restringida",
      grossEstimate,
    };
  }, [grossEstimate, values.transportMode, values.visibility]);

  const canAccess = ROLE_ALLOWED.includes(role);

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateForm(values);
    setErrors(validation);
    setSubmitMessage(null);

    if (Object.keys(validation).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        frigorifico: values.frigorificoName.trim(),
        type: values.livestockType,
        quantity: Number(values.quantity),
        unit: values.unit,
        origin: values.origin.trim(),
        destination: values.destination.trim(),
        neededBy: values.neededBy,
        priority: values.priority,
        priceTarget: values.priceTarget.trim() ? Number(values.priceTarget) : null,
        transportRequired: values.transportMode === "required",
        transportOptional: values.transportMode === "optional",
        visibleToTransportistas:
          values.transportMode === "not_required" ? false : values.visibleToTransportistas,
        partialCoverageAllowed: values.partialCoverageAllowed,
        visibility: values.visibility,
        notes: values.notes.trim() || null,
        contactName: values.contactName.trim(),
        contactPhone: values.contactPhone.trim(),
        internalReference: values.internalReference.trim() || null,
        source: "manual_form",
        createdByRole: role,
        createdAt: new Date().toISOString(),
      };

      console.log("NEW_REQUEST_PAYLOAD", payload);

      await new Promise((resolve) => setTimeout(resolve, 900));

      setSubmitMessage("Solicitud creada en modo mock. Redirigiendo al hub de solicitudes...");
      setTimeout(() => {
        router.push("/requests");
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
              Este perfil no puede crear demandas
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
              La creación de solicitudes está habilitada para administración y frigorífico.
              Los perfiles de productor y transportista participan respondiendo a demandas existentes.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/requests"
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
              >
                Volver a solicitudes
              </Link>

              <Link
                href="/offers"
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
              >
                Ir a offers
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 text-white">
      <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

        <div className="px-6 py-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-400/80">
                {copy.kicker}
              </p>

              <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.04em] text-white">
                {copy.title}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">
                {copy.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/requests"
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
              >
                Volver a solicitudes
              </Link>

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
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <article className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
            <div className="px-6 py-6">
              <div className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
                  Identidad de la demanda
                </p>
                <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
                  Base comercial y operacional
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FieldShell
                  label="Frigorífico / unidad compradora"
                  hint="Nombre visible de la operación que origina la demanda."
                  required
                  error={errors.frigorificoName}
                >
                  <TextInput
                    value={values.frigorificoName}
                    onChange={(value) => updateField("frigorificoName", value)}
                    placeholder="Ej. Frigorífico San Miguel"
                    error={!!errors.frigorificoName}
                  />
                </FieldShell>

                <FieldShell
                  label="Referencia interna"
                  hint="Código o referencia de uso interno para trazabilidad."
                  error={errors.internalReference}
                >
                  <TextInput
                    value={values.internalReference}
                    onChange={(value) => updateField("internalReference", value)}
                    placeholder="Ej. DEM-ABR-014"
                    error={!!errors.internalReference}
                  />
                </FieldShell>

                <FieldShell
                  label="Tipo de ganado"
                  hint="Clasifica la naturaleza principal de la solicitud."
                  required
                >
                  <SelectInput
                    value={values.livestockType}
                    onChange={(value) => updateField("livestockType", value as LivestockType)}
                  >
                    {LIVESTOCK_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-[#0b1220]">
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                </FieldShell>

                <FieldShell
                  label="Prioridad"
                  hint="Define presión comercial y urgencia operativa."
                  required
                >
                  <SelectInput
                    value={values.priority}
                    onChange={(value) => updateField("priority", value as Priority)}
                  >
                    {PRIORITY_OPTIONS.map((option) => (
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
                  Volumen y destino
                </p>
                <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
                  Configuración de demanda
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FieldShell
                  label="Cantidad requerida"
                  hint="Volumen total de la demanda."
                  required
                  error={errors.quantity}
                >
                  <TextInput
                    type="number"
                    value={values.quantity}
                    onChange={(value) => updateField("quantity", value)}
                    placeholder="Ej. 180"
                    error={!!errors.quantity}
                  />
                </FieldShell>

                <FieldShell
                  label="Unidad"
                  hint="Unidad de lectura comercial y operativa."
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
                  label="Origen"
                  hint="Punto de origen operativo o geográfico."
                  required
                  error={errors.origin}
                >
                  <TextInput
                    value={values.origin}
                    onChange={(value) => updateField("origin", value)}
                    placeholder="Ej. Concepción"
                    error={!!errors.origin}
                  />
                </FieldShell>

                <FieldShell
                  label="Destino"
                  hint="Planta, ciudad o destino final esperado."
                  required
                  error={errors.destination}
                >
                  <TextInput
                    value={values.destination}
                    onChange={(value) => updateField("destination", value)}
                    placeholder="Ej. Asunción"
                    error={!!errors.destination}
                  />
                </FieldShell>

                <FieldShell
                  label="Necesario para"
                  hint="Fecha objetivo de abastecimiento."
                  required
                  error={errors.neededBy}
                >
                  <TextInput
                    type="date"
                    value={values.neededBy}
                    onChange={(value) => updateField("neededBy", value)}
                    error={!!errors.neededBy}
                  />
                </FieldShell>

                <FieldShell
                  label="Precio objetivo"
                  hint="Valor de referencia por unidad o target económico interno."
                  error={errors.priceTarget}
                >
                  <TextInput
                    type="number"
                    value={values.priceTarget}
                    onChange={(value) => updateField("priceTarget", value)}
                    placeholder="Ej. 420"
                    error={!!errors.priceTarget}
                  />
                </FieldShell>
              </div>
            </div>
          </article>

          <article className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
            <div className="px-6 py-6">
              <div className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
                  Reglas de publicación
                </p>
                <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
                  Visibilidad y transporte
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FieldShell
                  label="Modelo de transporte"
                  hint="Define si la solicitud debe activar o no capa logística."
                  required
                >
                  <SelectInput
                    value={values.transportMode}
                    onChange={(value) => updateField("transportMode", value as TransportMode)}
                  >
                    {TRANSPORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-[#0b1220]">
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                </FieldShell>

                <FieldShell
                  label="Visibilidad comercial"
                  hint="Controla el alcance inicial de la publicación."
                  required
                >
                  <SelectInput
                    value={values.visibility}
                    onChange={(value) => updateField("visibility", value as DemandVisibility)}
                  >
                    {VISIBILITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-[#0b1220]">
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                </FieldShell>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <input
                    type="checkbox"
                    checked={
                      values.transportMode === "not_required"
                        ? false
                        : values.visibleToTransportistas
                    }
                    onChange={(event) =>
                      updateField("visibleToTransportistas", event.target.checked)
                    }
                    disabled={values.transportMode === "not_required"}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent"
                  />
                  <div>
                    <p className="text-sm font-medium text-white/88">
                      Visible para transportistas
                    </p>
                    <p className="mt-1 text-xs leading-6 text-white/42">
                      Habilita que la demanda pueda escalar a respuesta logística.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <input
                    type="checkbox"
                    checked={values.partialCoverageAllowed}
                    onChange={(event) =>
                      updateField("partialCoverageAllowed", event.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent"
                  />
                  <div>
                    <p className="text-sm font-medium text-white/88">
                      Permitir cobertura parcial
                    </p>
                    <p className="mt-1 text-xs leading-6 text-white/42">
                      Autoriza recibir respuestas por una fracción del volumen total.
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
                  Coordinación operativa
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FieldShell
                  label="Responsable de contacto"
                  hint="Persona responsable por la coordinación de la demanda."
                  required
                  error={errors.contactName}
                >
                  <TextInput
                    value={values.contactName}
                    onChange={(value) => updateField("contactName", value)}
                    placeholder="Ej. María López"
                    error={!!errors.contactName}
                  />
                </FieldShell>

                <FieldShell
                  label="Teléfono de contacto"
                  hint="Canal rápido para negociación o coordinación."
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
                  label="Nota operativa"
                  hint="Detalle ejecutivo para orientar a productores y operadores logísticos."
                  error={errors.notes}
                >
                  <TextArea
                    value={values.notes}
                    onChange={(value) => updateField("notes", value)}
                    placeholder="Ej. Se prioriza disponibilidad inmediata, lote homogéneo, documentación regularizada y coordinación temprana para retiro."
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
              {isSubmitting ? "Creando solicitud..." : "Crear solicitud"}
            </button>

            <button
              type="button"
              onClick={() => {
                setValues({
                  ...INITIAL_VALUES,
                  frigorificoName: session?.company ?? "",
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
                Resumen ejecutivo
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Frigorífico
                  </p>
                  <p className="mt-2 text-[18px] font-semibold text-white">
                    {values.frigorificoName || "Pendiente"}
                  </p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Demanda
                  </p>
                  <p className="mt-2 text-[18px] font-semibold text-white">
                    {values.quantity || "0"} {values.unit}
                  </p>
                  <p className="mt-2 text-xs text-white/45">
                    {LIVESTOCK_OPTIONS.find((item) => item.value === values.livestockType)?.label}
                  </p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Ruta
                  </p>
                  <p className="mt-2 text-[18px] font-semibold text-white">
                    {values.origin || "Origen"} → {values.destination || "Destino"}
                  </p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Target estimado
                  </p>
                  <p className="mt-2 text-[18px] font-semibold text-white">
                    {summary.grossEstimate > 0
                      ? `USD ${summary.grossEstimate.toLocaleString()}`
                      : "No calculado"}
                  </p>
                  <p className="mt-2 text-xs text-white/45">
                    Basado en cantidad × precio objetivo
                  </p>
                </div>
              </div>
            </div>
          </article>

          <article className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
            <div className="px-6 py-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
                Política de publicación
              </p>

              <div className="mt-5 space-y-3 text-sm text-white/58">
                <p>
                  <span className="font-medium text-white/82">Prioridad:</span>{" "}
                  {PRIORITY_OPTIONS.find((item) => item.value === values.priority)?.label}
                </p>
                <p>
                  <span className="font-medium text-white/82">Transporte:</span>{" "}
                  {summary.transportLabel}
                </p>
                <p>
                  <span className="font-medium text-white/82">Visibilidad:</span>{" "}
                  {summary.visibilityLabel}
                </p>
                <p>
                  <span className="font-medium text-white/82">Cobertura parcial:</span>{" "}
                  {values.partialCoverageAllowed ? "Permitida" : "No permitida"}
                </p>
                <p>
                  <span className="font-medium text-white/82">Visible a transportistas:</span>{" "}
                  {values.transportMode === "not_required"
                    ? "No aplica"
                    : values.visibleToTransportistas
                      ? "Sí"
                      : "No"}
                </p>
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