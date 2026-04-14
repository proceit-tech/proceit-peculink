"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

type FreightPriority = "normal" | "medium" | "high" | "critical";
type VehicleType = "truck_small" | "truck_medium" | "truck_large" | "refrigerated" | "multi";
type UnitType = "cabezas" | "kg" | "ton";

type FormValues = {
  transportistaName: string;
  vehicleType: VehicleType;
  vehiclesOffered: string;
  freightPrice: string;
  origin: string;
  destination: string;
  pickupDate: string;
  estimatedDeliveryDate: string;
  capacityCovered: string;
  unit: UnitType;
  priority: FreightPriority;
  contactName: string;
  contactPhone: string;
  internalReference: string;
  notes: string;
  acceptsPartialCoverage: boolean;
  immediateDispatch: boolean;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const ROLE_ALLOWED: UserRole[] = ["admin", "transportista"];

const PRIORITY_OPTIONS: Array<{
  value: FreightPriority;
  label: string;
  hint: string;
}> = [
  {
    value: "normal",
    label: "Normal",
    hint: "Propuesta logística estándar sin presión operativa especial.",
  },
  {
    value: "medium",
    label: "Media",
    hint: "Buena velocidad de respuesta y capacidad razonable.",
  },
  {
    value: "high",
    label: "Alta",
    hint: "Propuesta fuerte para asignación rápida.",
  },
  {
    value: "critical",
    label: "Crítica",
    hint: "Disponibilidad estratégica para cierre inmediato.",
  },
];

const VEHICLE_OPTIONS: Array<{
  value: VehicleType;
  label: string;
  hint: string;
}> = [
  {
    value: "truck_small",
    label: "Camión pequeño",
    hint: "Cobertura de menor volumen o rutas más flexibles.",
  },
  {
    value: "truck_medium",
    label: "Camión mediano",
    hint: "Equilibrio entre capacidad y disponibilidad.",
  },
  {
    value: "truck_large",
    label: "Camión grande",
    hint: "Mayor capacidad por unidad asignada.",
  },
  {
    value: "refrigerated",
    label: "Refrigerado",
    hint: "Operación con requerimiento térmico o especial.",
  },
  {
    value: "multi",
    label: "Flota mixta",
    hint: "Cobertura combinada según disponibilidad operativa.",
  },
];

const UNIT_OPTIONS: Array<{ value: UnitType; label: string }> = [
  { value: "cabezas", label: "Cabezas" },
  { value: "kg", label: "Kg" },
  { value: "ton", label: "Ton" },
];

const INITIAL_VALUES: FormValues = {
  transportistaName: "",
  vehicleType: "truck_medium",
  vehiclesOffered: "",
  freightPrice: "",
  origin: "",
  destination: "",
  pickupDate: "",
  estimatedDeliveryDate: "",
  capacityCovered: "",
  unit: "cabezas",
  priority: "medium",
  contactName: "",
  contactPhone: "",
  internalReference: "",
  notes: "",
  acceptsPartialCoverage: true,
  immediateDispatch: false,
};

function normalizeRole(role: unknown): UserRole {
  if (role === "admin") return "admin";
  if (role === "frigorifico") return "frigorifico";
  if (role === "productor") return "productor";
  if (role === "transportista") return "transportista";
  return "admin";
}

function getPriorityTone(priority: FreightPriority) {
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

function getVehicleLabel(vehicleType: VehicleType) {
  return VEHICLE_OPTIONS.find((item) => item.value === vehicleType)?.label ?? vehicleType;
}

function validateForm(values: FormValues) {
  const errors: FormErrors = {};

  if (!values.transportistaName.trim()) {
    errors.transportistaName = "Indica el nombre del operador logístico.";
  }

  if (!values.vehiclesOffered.trim()) {
    errors.vehiclesOffered = "Indica la cantidad de vehículos ofrecidos.";
  } else {
    const vehicles = Number(values.vehiclesOffered);
    if (Number.isNaN(vehicles) || vehicles <= 0) {
      errors.vehiclesOffered = "La cantidad de vehículos debe ser mayor que cero.";
    }
  }

  if (!values.freightPrice.trim()) {
    errors.freightPrice = "Indica el valor de la propuesta logística.";
  } else {
    const price = Number(values.freightPrice);
    if (Number.isNaN(price) || price <= 0) {
      errors.freightPrice = "El valor logístico debe ser mayor que cero.";
    }
  }

  if (!values.origin.trim()) {
    errors.origin = "Indica el origen operativo del traslado.";
  }

  if (!values.destination.trim()) {
    errors.destination = "Indica el destino operativo del traslado.";
  }

  if (!values.pickupDate.trim()) {
    errors.pickupDate = "Indica la fecha estimada de retiro.";
  }

  if (!values.estimatedDeliveryDate.trim()) {
    errors.estimatedDeliveryDate = "Indica la fecha estimada de entrega.";
  }

  if (!values.capacityCovered.trim()) {
    errors.capacityCovered = "Indica la capacidad cubierta por esta propuesta.";
  } else {
    const capacity = Number(values.capacityCovered);
    if (Number.isNaN(capacity) || capacity <= 0) {
      errors.capacityCovered = "La capacidad cubierta debe ser mayor que cero.";
    }
  }

  if (!values.contactName.trim()) {
    errors.contactName = "Indica el responsable logístico.";
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

export default function NewFreightOfferPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = getMockSession();
  const role = normalizeRole(session?.role);

  const requestId = searchParams.get("requestId");
  const request = requestId ? getRequestById(requestId) : null;

  const [values, setValues] = useState<FormValues>({
    ...INITIAL_VALUES,
    transportistaName: session?.company ?? "",
    origin: request?.origin ?? "",
    destination: request?.destination ?? "",
    unit: (request?.unit as UnitType) ?? "cabezas",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const canAccess = ROLE_ALLOWED.includes(role);

  const vehiclesNumber = Number(values.vehiclesOffered || 0);
  const freightPriceNumber = Number(values.freightPrice || 0);
  const capacityCoveredNumber = Number(values.capacityCovered || 0);

  const requestedQuantity = request ? Number(request.quantity) : 0;
  const coveredDemandPercent =
    requestedQuantity > 0 && capacityCoveredNumber > 0
      ? Math.min(100, Math.round((capacityCoveredNumber / requestedQuantity) * 100))
      : 0;

  const requestCoverage = request ? getCoveragePercent(request) : 0;
  const pricePerVehicle =
    vehiclesNumber > 0 && freightPriceNumber > 0
      ? Math.round(freightPriceNumber / vehiclesNumber)
      : 0;

  const summary = useMemo(() => {
    return {
      estimatedPricePerVehicle: pricePerVehicle,
      coveredDemandPercent,
    };
  }, [coveredDemandPercent, pricePerVehicle]);

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
        requestId,
        supplierRole: "transportista",
        transportistaName: values.transportistaName.trim(),
        vehicleType: values.vehicleType,
        vehiclesOffered: Number(values.vehiclesOffered),
        freightPrice: Number(values.freightPrice),
        origin: values.origin.trim(),
        destination: values.destination.trim(),
        pickupDate: values.pickupDate,
        estimatedDeliveryDate: values.estimatedDeliveryDate,
        capacityCovered: Number(values.capacityCovered),
        unit: values.unit,
        priority: values.priority,
        contactName: values.contactName.trim(),
        contactPhone: values.contactPhone.trim(),
        internalReference: values.internalReference.trim() || null,
        notes: values.notes.trim() || null,
        acceptsPartialCoverage: values.acceptsPartialCoverage,
        immediateDispatch: values.immediateDispatch,
        createdByRole: role,
        createdAt: new Date().toISOString(),
        derivedMetrics: {
          coveredDemandPercent,
          estimatedPricePerVehicle: pricePerVehicle,
        },
      };

      console.log("NEW_FREIGHT_PROPOSAL_PAYLOAD", payload);

      await new Promise((resolve) => setTimeout(resolve, 900));

      setSubmitMessage(
        "Propuesta logística creada en modo mock. Redirigiendo al grupo logístico de la demanda..."
      );

      setTimeout(() => {
        router.push(`/freight?requestId=${requestId}`);
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
              Este perfil no puede crear propuestas logísticas
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
              La propuesta de freight está habilitada para administración y transportista.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/freight"
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.07] hover:text-white"
              >
                Volver a freight
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
              Esta propuesta debe estar vinculada a una demanda
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
              Para crear una propuesta logística, abre esta pantalla con un `requestId`
              válido desde una solicitud o desde la capa logística correspondiente.
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
              El `requestId` informado no corresponde a una demanda válida dentro del mock actual.
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
                Crear propuesta logística sobre esta demanda
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
                href={`/freight?requestId=${request.id}`}
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white"
              >
                Ver freight
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
                Nueva propuesta logística
              </p>

              <h2 className="mt-2 text-[32px] font-semibold tracking-[-0.04em] text-white">
                Oferta de freight vinculada a la demanda
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">
                Registra una propuesta logística concreta con capacidad, tipo de vehículo,
                valor de flete, fechas y condiciones de cobertura.
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
                  Identidad operativa
                </p>
                <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
                  Base de la propuesta logística
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FieldShell
                  label="Transportista / operador"
                  hint="Nombre visible del operador que envía la propuesta."
                  required
                  error={errors.transportistaName}
                >
                  <TextInput
                    value={values.transportistaName}
                    onChange={(value) => updateField("transportistaName", value)}
                    placeholder="Ej. Logística del Norte"
                    error={!!errors.transportistaName}
                  />
                </FieldShell>

                <FieldShell
                  label="Referencia interna"
                  hint="Código interno de control logístico."
                  error={errors.internalReference}
                >
                  <TextInput
                    value={values.internalReference}
                    onChange={(value) => updateField("internalReference", value)}
                    placeholder="Ej. FRT-APR-011"
                    error={!!errors.internalReference}
                  />
                </FieldShell>

                <FieldShell
                  label="Tipo de vehículo"
                  hint="Tipo principal de flota ofrecida."
                  required
                >
                  <SelectInput
                    value={values.vehicleType}
                    onChange={(value) => updateField("vehicleType", value as VehicleType)}
                  >
                    {VEHICLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-[#0b1220]">
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                </FieldShell>

                <FieldShell
                  label="Prioridad de la propuesta"
                  hint="Intensidad operativa de esta propuesta."
                  required
                >
                  <SelectInput
                    value={values.priority}
                    onChange={(value) => updateField("priority", value as FreightPriority)}
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
                  Capacidad y precio
                </p>
                <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
                  Configuración económica y operativa
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FieldShell
                  label="Cantidad de vehículos"
                  hint="Número de unidades que puedes asignar."
                  required
                  error={errors.vehiclesOffered}
                >
                  <TextInput
                    type="number"
                    value={values.vehiclesOffered}
                    onChange={(value) => updateField("vehiclesOffered", value)}
                    placeholder="Ej. 3"
                    error={!!errors.vehiclesOffered}
                  />
                </FieldShell>

                <FieldShell
                  label="Valor del flete"
                  hint="Valor total de la propuesta logística."
                  required
                  error={errors.freightPrice}
                >
                  <TextInput
                    type="number"
                    value={values.freightPrice}
                    onChange={(value) => updateField("freightPrice", value)}
                    placeholder="Ej. 2400"
                    error={!!errors.freightPrice}
                  />
                </FieldShell>

                <FieldShell
                  label="Capacidad cubierta"
                  hint="Volumen real que esta propuesta puede mover."
                  required
                  error={errors.capacityCovered}
                >
                  <TextInput
                    type="number"
                    value={values.capacityCovered}
                    onChange={(value) => updateField("capacityCovered", value)}
                    placeholder="Ej. 120"
                    error={!!errors.capacityCovered}
                  />
                </FieldShell>

                <FieldShell
                  label="Unidad"
                  hint="Unidad operativa de la capacidad cubierta."
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
                  hint="Punto real de retiro o arranque de la operación."
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
                  hint="Punto de entrega final de esta propuesta."
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
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <FieldShell
                  label="Fecha de retiro"
                  hint="Inicio previsto de la ejecución."
                  required
                  error={errors.pickupDate}
                >
                  <TextInput
                    type="date"
                    value={values.pickupDate}
                    onChange={(value) => updateField("pickupDate", value)}
                    error={!!errors.pickupDate}
                  />
                </FieldShell>

                <FieldShell
                  label="Fecha estimada de entrega"
                  hint="Cierre previsto del viaje o entrega."
                  required
                  error={errors.estimatedDeliveryDate}
                >
                  <TextInput
                    type="date"
                    value={values.estimatedDeliveryDate}
                    onChange={(value) => updateField("estimatedDeliveryDate", value)}
                    error={!!errors.estimatedDeliveryDate}
                  />
                </FieldShell>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <input
                    type="checkbox"
                    checked={values.acceptsPartialCoverage}
                    onChange={(event) =>
                      updateField("acceptsPartialCoverage", event.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent"
                  />
                  <div>
                    <p className="text-sm font-medium text-white/88">
                      Acepta cobertura parcial
                    </p>
                    <p className="mt-1 text-xs leading-6 text-white/42">
                      Permite cubrir solo parte del requerimiento logístico total.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <input
                    type="checkbox"
                    checked={values.immediateDispatch}
                    onChange={(event) =>
                      updateField("immediateDispatch", event.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent"
                  />
                  <div>
                    <p className="text-sm font-medium text-white/88">
                      Salida inmediata
                    </p>
                    <p className="mt-1 text-xs leading-6 text-white/42">
                      Señal operativa fuerte para acelerar asignación y programación.
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
                  Coordinación logística
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FieldShell
                  label="Responsable logístico"
                  hint="Persona responsable del seguimiento operativo."
                  required
                  error={errors.contactName}
                >
                  <TextInput
                    value={values.contactName}
                    onChange={(value) => updateField("contactName", value)}
                    placeholder="Ej. Carlos Benítez"
                    error={!!errors.contactName}
                  />
                </FieldShell>

                <FieldShell
                  label="Teléfono de contacto"
                  hint="Canal directo para coordinación y confirmación."
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
                  hint="Aclaraciones sobre flota, ventanas, cobertura, restricciones o disponibilidad."
                  error={errors.notes}
                >
                  <TextArea
                    value={values.notes}
                    onChange={(value) => updateField("notes", value)}
                    placeholder="Ej. Flota disponible desde primera hora, posibilidad de salida escalonada y cobertura prioritaria para rutas principales."
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
              {isSubmitting ? "Creando propuesta..." : "Crear propuesta logística"}
            </button>

            <button
              type="button"
              onClick={() => {
                setValues({
                  ...INITIAL_VALUES,
                  transportistaName: session?.company ?? "",
                  origin: request?.origin ?? "",
                  destination: request?.destination ?? "",
                  unit: (request?.unit as UnitType) ?? "cabezas",
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
                  <p className="mt-2 text-xs text-white/45">{getRequestStatusLabel(request.status)}</p>
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
                  <p className="mt-2 text-xs text-white/45">
                    {getLivestockLabel(request.type)}
                  </p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Cobertura actual
                  </p>
                  <p className="mt-2 text-[18px] font-semibold text-white">
                    {requestCoverage}%
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
                Lectura de tu propuesta
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Cobertura de demanda
                  </p>
                  <p className="mt-2 text-[18px] font-semibold text-white">
                    {summary.coveredDemandPercent}%
                  </p>
                  <p className="mt-2 text-xs text-white/45">
                    Según capacidad cubierta propuesta
                  </p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Valor por vehículo
                  </p>
                  <p className="mt-2 text-[18px] font-semibold text-white">
                    {summary.estimatedPricePerVehicle > 0
                      ? `USD ${summary.estimatedPricePerVehicle.toLocaleString()}`
                      : "No calculado"}
                  </p>
                  <p className="mt-2 text-xs text-white/45">
                    Valor total dividido por vehículos ofertados
                  </p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                    Tipo de vehículo
                  </p>
                  <p className="mt-2 text-[18px] font-semibold text-white">
                    {getVehicleLabel(values.vehicleType)}
                  </p>
                  <p className="mt-2 text-xs text-white/45">
                    Configuración principal ofrecida
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