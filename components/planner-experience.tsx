"use client";

import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { useState, useTransition } from "react";
import type {
  GenerateTripRequest,
  GenerateTripResponse,
  TravelPreference,
  TripOption,
} from "@/lib/trips";

type GenerateTripMeta = GenerateTripResponse["meta"];

type PlannerExperienceProps = {
  authEnabled: boolean;
  isSignedIn: boolean;
  initialRequest: GenerateTripRequest;
  initialMeta: GenerateTripMeta;
  initialOptions: TripOption[];
};

const preferenceOptions: Array<{
  label: string;
  value: TravelPreference;
}> = [
  { label: "Balanced", value: "balanced" },
  { label: "Culture", value: "culture" },
  { label: "Nightlife", value: "nightlife" },
  { label: "Nature", value: "nature" },
];

export function PlannerExperience({
  authEnabled,
  isSignedIn,
  initialRequest,
  initialMeta,
  initialOptions,
}: PlannerExperienceProps) {
  const [formData, setFormData] = useState<GenerateTripRequest>(initialRequest);
  const [results, setResults] = useState<TripOption[]>(initialOptions);
  const [resultMeta, setResultMeta] = useState<GenerateTripMeta>(initialMeta);
  const [lastSubmittedRequest, setLastSubmittedRequest] =
    useState<GenerateTripRequest>(initialRequest);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const tripLengthDays = calculateTripLengthLabel(
    formData.departureDate,
    formData.returnDate,
  );

  function handleFieldChange<K extends keyof GenerateTripRequest>(
    field: K,
    value: GenerateTripRequest[K],
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedOrigin = formData.originCity.trim();

    if (!trimmedOrigin) {
      setError("Enter a starting city.");
      return;
    }

    if (formData.departureDate > formData.returnDate) {
      setError("Return date must be after departure date.");
      return;
    }

    if (!Number.isFinite(formData.budgetEuros) || formData.budgetEuros < 50) {
      setError("Budget must be at least EUR 50.");
      return;
    }

    const requestPayload: GenerateTripRequest = {
      ...formData,
      originCity: trimmedOrigin,
      budgetEuros: Math.round(formData.budgetEuros),
    };

    startTransition(async () => {
      try {
        const response = await fetch("/api/generate-trip-options", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestPayload),
        });

        const payload = (await response.json()) as
          | GenerateTripResponse
          | { error?: string };

        if (!response.ok || !("options" in payload)) {
          throw new Error(
            "error" in payload && payload.error
              ? payload.error
              : "Unable to generate trip options.",
          );
        }

        setResults(payload.options);
        setResultMeta(payload.meta);
        setLastSubmittedRequest(requestPayload);
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Unable to generate trip options.",
        );
      }
    });
  }

  return (
    <main className="grid-fade min-h-screen">
      <section className="mx-auto flex w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="glass-panel mb-5 flex items-center justify-between rounded-[1.2rem] border border-border-soft px-4 py-3">
          <div>
            <p className="font-serif text-[2rem] leading-none text-slate-950">
              WeekendWanderer
            </p>
            <p className="compact-label mt-1 text-[var(--color-ink-muted)]">
              Europe weekend planner
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <a className="rounded-lg px-3 py-2 hover:bg-white" href="#planner">
              Plan a trip
            </a>
            <AuthControls authEnabled={authEnabled} isSignedIn={isSignedIn} />
          </div>
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[1fr_0.9fr]">
          <section className="flex flex-col gap-8">
            <div className="space-y-4">
              <span className="inline-flex w-fit rounded-full border border-[color:var(--color-border-soft)] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                Weekend planning assistant
              </span>
              <div className="max-w-3xl space-y-3">
                <h1 className="max-w-4xl font-serif text-5xl leading-[0.92] text-slate-950 sm:text-6xl">
                  Weekend trips without the Europe travel learning curve.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[var(--color-ink-muted)] sm:text-lg">
                  Enter your city, dates, and budget target. WeekendWanderer
                  turns that into a short list of realistic rail-and-hostel
                  options built for students and young professionals living in
                  Europe.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <FeatureCard
                title="Fast inputs"
                description="One form, no tab-hopping across rail sites, hostels, and map tools."
              />
              <FeatureCard
                title="Budget aware"
                description="Itineraries stay grounded in rough total trip cost, not vague travel inspiration."
              />
              <FeatureCard
                title="Actionable handoff"
                description="Each result is structured to hand users off to provider search flows while official verified integrations are still pending."
              />
            </div>
          </section>

          <section
            id="planner"
            className="glass-panel rounded-[1.6rem] border border-border-soft p-5 sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="compact-label text-[var(--color-ink-muted)]">
                  Planner
                </p>
                <h2 className="mt-2 text-[1.6rem] font-semibold text-slate-950">
                  Build a weekend in under a minute
                </h2>
              </div>
              <span className="rounded-full bg-slate-950 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                {resultMeta.source === "openai" ? "AI live" : "Rules fallback"}
              </span>
            </div>

            <form className="space-y-3.5" onSubmit={handleSubmit}>
              <div className="rounded-[1rem] border border-border-soft bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
                  Quick start
                </p>
                <div className="mt-3 space-y-3">
                  <PresetRow
                    label="Dates"
                    options={[
                      {
                        label: "This weekend",
                        onClick: () => applyDatePreset(setFormData, "this"),
                      },
                      {
                        label: "Next weekend",
                        onClick: () => applyDatePreset(setFormData, "next"),
                      },
                    ]}
                  />
                  <PresetRow
                    label="Budget"
                    options={[
                      {
                        label: "Under EUR 150",
                        onClick: () => handleFieldChange("budgetEuros", 140),
                      },
                      {
                        label: "EUR 180",
                        onClick: () => handleFieldChange("budgetEuros", 180),
                      },
                      {
                        label: "EUR 240",
                        onClick: () => handleFieldChange("budgetEuros", 240),
                      },
                    ]}
                  />
                  <PresetRow
                    label="Vibe"
                    options={preferenceOptions.map((option) => ({
                      label: option.label,
                      onClick: () =>
                        handleFieldChange("preference", option.value),
                    }))}
                  />
                </div>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-800">
                  Current city
                </span>
                <input
                  className="w-full rounded-lg border border-border-soft bg-white px-3.5 py-3 text-base text-slate-950 outline-none placeholder:text-slate-400 focus:border-accent focus:ring-4 focus:ring-accent/10"
                  placeholder="Vienna"
                  value={formData.originCity}
                  onChange={(event) =>
                    handleFieldChange("originCity", event.target.value)
                  }
                />
                <span className="mt-1.5 block text-xs text-[var(--color-ink-muted)]">
                  Where are you starting from? Example: Vienna, Munich, Prague.
                </span>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-800">
                    Departure date
                  </span>
                  <input
                    className="w-full rounded-lg border border-border-soft bg-white px-3.5 py-3 text-base text-slate-950 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
                    type="date"
                    value={formData.departureDate}
                    onChange={(event) =>
                      handleFieldChange("departureDate", event.target.value)
                    }
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-800">
                    Return date
                  </span>
                  <input
                    className="w-full rounded-lg border border-border-soft bg-white px-3.5 py-3 text-base text-slate-950 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
                    type="date"
                    value={formData.returnDate}
                    onChange={(event) =>
                      handleFieldChange("returnDate", event.target.value)
                    }
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-800">
                  Budget in euros
                </span>
                <input
                  className="w-full rounded-lg border border-border-soft bg-white px-3.5 py-3 text-base text-slate-950 outline-none placeholder:text-slate-400 focus:border-accent focus:ring-4 focus:ring-accent/10"
                  min="50"
                  step="10"
                  type="number"
                  value={formData.budgetEuros}
                  onChange={(event) =>
                    handleFieldChange(
                      "budgetEuros",
                      Number(event.target.value || 0),
                    )
                  }
                />
                <span className="mt-1.5 block text-xs text-[var(--color-ink-muted)]">
                  Total target budget for transport and stay.
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-800">
                  Travel vibe
                </span>
                <select
                  className="w-full rounded-lg border border-border-soft bg-white px-3.5 py-3 text-base text-slate-950 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
                  value={formData.preference}
                  onChange={(event) =>
                    handleFieldChange(
                      "preference",
                      event.target.value as TravelPreference,
                    )
                  }
                >
                  {preferenceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-lg border border-border-soft bg-white px-4 py-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
                  Trip summary
                </p>
                <p className="mt-1.5 text-sm leading-6 text-slate-800">
                  {buildFormSummary(formData, tripLengthDays)}
                </p>
              </div>

              <div className="rounded-lg border border-[color:var(--color-border-soft)] bg-slate-50 p-3.5 text-sm leading-6 text-slate-700">
                Prices are estimated ranges generated by the app&apos;s
                recommendation engine. Booking buttons currently open provider
                search pages, not guaranteed live itineraries or inventory.
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm leading-6 text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                className="med-button-dark w-full rounded-lg px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Generating..." : "Generate weekend ideas"}
              </button>
            </form>
          </section>
        </div>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="compact-label text-[var(--color-ink-muted)]">
                Trip options
              </p>
              <h2 className="mt-2 font-serif text-[2.4rem] text-slate-950">
                Curated itinerary cards, not a chat transcript
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--color-ink-muted)]">
              These recommendations come from a rules-based trip engine tuned
              for budget-friendly European weekend travel.
            </p>
          </div>

          <div className="mb-4 rounded-[1.1rem] border border-border-soft bg-white px-4 py-3.5 text-sm text-slate-600 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {results.length} options for {lastSubmittedRequest.originCity}
                </p>
                <p className="mt-1 leading-6 text-[var(--color-ink-muted)]">
                  {formatDateLabel(lastSubmittedRequest.departureDate)} to{" "}
                  {formatDateLabel(lastSubmittedRequest.returnDate)} • budget
                  target EUR {lastSubmittedRequest.budgetEuros} •{" "}
                  {labelForPreference(lastSubmittedRequest.preference)}
                </p>
              </div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
                {resultMeta.source === "openai" ? "AI-generated" : "Rules-based"} • updated{" "}
                {formatGeneratedAt(resultMeta)}
              </p>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--color-ink-muted)]">
              {resultMeta.source === "openai"
                ? `Generated with ${resultMeta.model ?? "OpenAI"} and normalized into the app's itinerary format.`
                : "Ranked using destination tags, budget fit, and weekend-friendly transit assumptions."}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--color-ink-muted)]">
              {resultMeta.bookingLinkPolicy === "provider_search_only"
                ? "Transport and stay buttons currently hand off to provider search pages. Verified deep links will require official provider integrations."
                : "Transport and stay buttons are backed by verified provider search results."}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {isPending
              ? Array.from({ length: 3 }).map((_, index) => (
                  <LoadingCard key={`loading-${index}`} />
                ))
              : results.map((trip, index) => (
                  <TripCard
                    canSave={isSignedIn}
                    meta={resultMeta}
                    request={lastSubmittedRequest}
                    isRecommended={index === 0}
                    key={`${trip.destinationCity}-${trip.destinationCountry}`}
                    trip={trip}
                  />
                ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function TripCard({
  trip,
  request,
  meta,
  canSave,
  isRecommended,
}: {
  trip: TripOption;
  request: GenerateTripRequest;
  meta: GenerateTripMeta;
  canSave: boolean;
  isRecommended: boolean;
}) {
  const [saveLabel, setSaveLabel] = useState("Save trip");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, startSaveTransition] = useTransition();
  const accentClass = getTripAccentClass(trip.vibeLabel);

  function handleSave() {
    if (!canSave || isSaving) {
      return;
    }

    setSaveError(null);

    startSaveTransition(async () => {
      try {
        const response = await fetch("/api/saved-trips", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ request, trip, meta }),
        });

        const payload = (await response.json()) as {
          duplicate?: boolean;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to save trip.");
        }

        setSaveLabel(payload.duplicate ? "Already saved" : "Saved");
      } catch (saveTripError) {
        setSaveError(
          saveTripError instanceof Error
            ? saveTripError.message
            : "Unable to save trip.",
        );
      }
    });
  }

  return (
    <article
      className={`trip-card ${accentClass} rounded-[1.2rem] p-4 ${
        isRecommended
          ? "border border-[color:var(--color-accent)]/20 shadow-[0_20px_44px_rgba(31,94,122,0.16)]"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {isRecommended ? (
              <span className="rounded-full bg-[color:var(--color-accent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                Recommended
              </span>
            ) : null}
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
              {trip.vibeLabel}
            </p>
          </div>
          <h3 className="mt-1.5 text-[1.45rem] font-semibold leading-tight text-slate-950">
            <span className="mr-2" aria-hidden="true">
              {flagForCountry(trip.destinationCountry)}
            </span>
            {trip.destinationCity}, {trip.destinationCountry}
          </h3>
        </div>
        <span className="rounded-full border border-[color:var(--color-border-soft)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[color:var(--color-accent)]">
          {getTripFitLabel(trip)}
        </span>
      </div>

      <p className="mt-3 text-[15px] leading-6 text-slate-800">{trip.summary}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">{trip.whyVisit}</p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MetricCard label="Transit" value={trip.travelTimeText} />
        <MetricCard
          label="Budget"
          value={`EUR ${trip.estimatedCostMin}-${trip.estimatedCostMax}`}
        />
        <MetricCard label="Style" value={getEffortLabel(trip)} />
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
          Weekend shape
        </p>
        <p className="mt-1.5 text-sm leading-6 text-slate-700">
          {trip.samplePlan}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {trip.highlights.map((highlight) => (
          <span
            key={highlight}
            className="rounded-full border border-border-soft bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
          >
            {highlight}
          </span>
        ))}
      </div>

      <dl className="mt-4 space-y-2.5 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-3 border-b border-border-soft pb-2.5">
          <dt>Transport</dt>
          <dd className="font-medium text-slate-800">{trip.transportMode}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-border-soft pb-2.5">
          <dt>Stay source</dt>
          <dd className="font-medium text-slate-800">{trip.stayProvider}</dd>
        </div>
        <div className="space-y-1 pt-1">
          <dt>Booking status</dt>
          <dd className="flex flex-wrap gap-1.5 pt-1">
            <StatusPill
              label={labelForTransportStatus(trip.transportLinkStatus)}
              tone={toneForStatus(trip.transportLinkStatus)}
            />
            <StatusPill
              label={labelForStayStatus(trip.stayLinkStatus)}
              tone={toneForStatus(trip.stayLinkStatus)}
            />
          </dd>
        </div>
        <div className="space-y-1 pt-1">
          <dt>Planning note</dt>
          <dd className="font-medium text-slate-800">{getPlanningNote(trip)}</dd>
        </div>
      </dl>

      <div className="mt-4 rounded-lg border border-border-soft bg-slate-50 px-3 py-2.5 text-xs leading-5 text-[var(--color-ink-muted)]">
        {meta.bookingLinkPolicy === "provider_search_only"
          ? "Links open provider search pages with your route intent. Pricing remains estimated until live integrations are added."
          : trip.disclaimer}
      </div>

      <div className="mt-4 flex gap-2.5">
        <TripLinkButton
          href={trip.transportLink}
          label={labelForTransportLink(trip)}
          variant="solid"
        />
        <TripLinkButton
          href={trip.stayLink}
          label={labelForStayLink(trip)}
          variant="outline"
        />
      </div>

      <div className="mt-3">
        {canSave ? (
          <button
            className="med-button-light w-full rounded-lg border px-3 py-3 text-sm font-semibold disabled:opacity-60"
            disabled={isSaving || saveLabel === "Saved"}
            onClick={handleSave}
            type="button"
          >
            {isSaving ? "Saving..." : saveLabel}
          </button>
        ) : (
          <Link
            className="med-button-light block w-full rounded-lg border px-3 py-3 text-center text-sm font-semibold"
            href="/sign-in"
            prefetch={false}
          >
            Sign in to save
          </Link>
        )}
        {saveError ? (
          <p className="mt-2 text-xs leading-5 text-red-700">{saveError}</p>
        ) : null}
      </div>
    </article>
  );
}

function TripLinkButton({
  href,
  label,
  variant,
}: {
  href: string | null;
  label: string;
  variant: "solid" | "outline";
}) {
  const className =
    variant === "solid"
      ? "flex-1 rounded-lg bg-slate-950 px-3 py-3 text-center text-sm font-semibold text-white shadow-[0_10px_22px_rgba(15,23,42,0.14)] hover:bg-slate-900"
      : "flex-1 rounded-lg border border-border-soft bg-white px-3 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50";

  if (!href) {
    return (
      <span
        className={`${className} cursor-not-allowed opacity-60`}
        aria-disabled="true"
      >
        {label}
      </span>
    );
  }

  return (
    <a className={className} href={href} rel="noreferrer noopener" target="_blank">
      {label}
    </a>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border-soft bg-slate-50 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold leading-5 text-slate-900">{value}</p>
    </div>
  );
}

function PresetRow({
  label,
  options,
}: {
  label: string;
  options: Array<{
    label: string;
    onClick: () => void;
  }>;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-slate-800">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={`${label}-${option.label}`}
            className="rounded-full border border-border-soft bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white"
            onClick={option.onClick}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "neutral" | "positive" | "caution";
}) {
  const className =
    tone === "positive"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "caution"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-border-soft bg-white text-slate-700";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function LoadingCard() {
  return (
    <article className="trip-card animate-pulse rounded-[1.2rem] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="w-full">
          <div className="h-3 w-24 rounded-full bg-slate-200" />
          <div className="mt-2.5 h-7 w-2/3 rounded-full bg-slate-200" />
        </div>
        <div className="h-6 w-20 rounded-full bg-slate-200" />
      </div>

      <div className="mt-4 h-4 w-full rounded-full bg-slate-200" />
      <div className="mt-2 h-4 w-5/6 rounded-full bg-slate-200" />
      <div className="mt-4 h-3 w-full rounded-full bg-slate-200" />
      <div className="mt-2 h-3 w-4/5 rounded-full bg-slate-200" />
      <div className="mt-4 h-3 w-24 rounded-full bg-slate-200" />
      <div className="mt-2 h-4 w-full rounded-full bg-slate-200" />
      <div className="mt-2 h-4 w-3/4 rounded-full bg-slate-200" />

      <div className="mt-4 flex gap-2">
        <div className="h-7 w-24 rounded-md bg-slate-200" />
        <div className="h-7 w-28 rounded-md bg-slate-200" />
      </div>

      <div className="mt-4 space-y-3">
        <div className="h-10 rounded-2xl bg-slate-200" />
        <div className="h-10 rounded-2xl bg-slate-200" />
      </div>

      <div className="mt-4 flex gap-2.5">
        <div className="h-11 flex-1 rounded-full bg-slate-200" />
        <div className="h-11 flex-1 rounded-full bg-slate-200" />
      </div>
    </article>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.1rem] border border-border-soft bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{description}</p>
    </div>
  );
}

function AuthControls({
  authEnabled,
  isSignedIn,
}: {
  authEnabled: boolean;
  isSignedIn: boolean;
}) {
  if (!authEnabled) {
    return (
      <span className="rounded-lg border border-border-soft bg-white px-3 py-2">
        Auth setup pending
      </span>
    );
  }

  if (isSignedIn) {
    return (
      <>
        <a className="rounded-lg px-3 py-2 hover:bg-[color:var(--button-light)]" href="/dashboard">
          Saved trips
        </a>
        <SignOutButton>
          <button className="med-button-light rounded-lg border px-3 py-2 font-medium">
            Sign out
          </button>
        </SignOutButton>
      </>
    );
  }

  return (
    <>
      <Link
        className="med-button-light rounded-lg border px-3 py-2 font-medium"
        href="/sign-in"
        prefetch={false}
      >
        Sign in
      </Link>
      <Link
        className="med-button-dark rounded-lg px-3 py-2 font-medium"
        href="/sign-up"
        prefetch={false}
      >
        Sign up
      </Link>
    </>
  );
}

function getTripAccentClass(vibeLabel: string) {
  const label = vibeLabel.toLowerCase();

  if (
    label.includes("nightlife") ||
    label.includes("bars") ||
    label.includes("thermal")
  ) {
    return "trip-accent-nightlife";
  }

  if (
    label.includes("nature") ||
    label.includes("alpine") ||
    label.includes("outdoors") ||
    label.includes("scenic")
  ) {
    return "trip-accent-nature";
  }

  if (
    label.includes("culture") ||
    label.includes("design") ||
    label.includes("historic") ||
    label.includes("elegant")
  ) {
    return "trip-accent-culture";
  }

  return "trip-accent-balanced";
}

function flagForCountry(country: string) {
  switch (country) {
    case "Austria":
      return "🇦🇹";
    case "Czech Republic":
      return "🇨🇿";
    case "Hungary":
      return "🇭🇺";
    case "Slovenia":
      return "🇸🇮";
    case "Croatia":
      return "🇭🇷";
    case "Italy":
      return "🇮🇹";
    case "Germany":
      return "🇩🇪";
    case "Slovakia":
      return "🇸🇰";
    default:
      return "📍";
  }
}

function getTripFitLabel(trip: TripOption) {
  if (trip.estimatedCostMax <= 150) {
    return "Strong budget fit";
  }

  if (trip.estimatedCostMax <= 190) {
    return "Balanced pick";
  }

  return "Higher-spend weekend";
}

function getEffortLabel(trip: TripOption) {
  if (trip.travelTimeText.includes("1h") || trip.travelTimeText.includes("2h")) {
    return "Low effort";
  }

  if (trip.travelTimeText.includes("3h") || trip.travelTimeText.includes("4h")) {
    return "Medium effort";
  }

  return "Longer transit";
}

function labelForTransportStatus(
  status: TripOption["transportLinkStatus"],
) {
  if (status === "verified") {
    return "Transport verified";
  }

  if (status === "search_only") {
    return "Transport search";
  }

  return "Transport unavailable";
}

function labelForStayStatus(status: TripOption["stayLinkStatus"]) {
  if (status === "verified") {
    return "Stay verified";
  }

  if (status === "search_only") {
    return "Stay search";
  }

  return "Stay unavailable";
}

function toneForStatus(
  status: TripOption["transportLinkStatus"] | TripOption["stayLinkStatus"],
) {
  if (status === "verified") {
    return "positive" as const;
  }

  if (status === "search_only") {
    return "caution" as const;
  }

  return "neutral" as const;
}

function getPlanningNote(trip: TripOption) {
  if (trip.travelTimeText.includes("1h") || trip.travelTimeText.includes("2h")) {
    return "Easy to execute with minimal weekend transit overhead.";
  }

  if (trip.travelTimeText.includes("5h") || trip.travelTimeText.includes("6h") || trip.travelTimeText.includes("7h")) {
    return "Best when destination payoff matters more than fast travel time.";
  }

  return "Good balance between destination quality and transit commitment.";
}

function calculateTripLengthLabel(departureDate: string, returnDate: string) {
  if (!departureDate || !returnDate || departureDate > returnDate) {
    return null;
  }

  const departure = new Date(`${departureDate}T12:00:00`);
  const arrival = new Date(`${returnDate}T12:00:00`);
  const days = Math.max(
    1,
    Math.round((arrival.getTime() - departure.getTime()) / 86_400_000) + 1,
  );

  return `${days}-day weekend`;
}

function buildFormSummary(
  formData: GenerateTripRequest,
  tripLength: string | null,
) {
  const city = formData.originCity.trim() || "your city";
  const budget = `around EUR ${Math.round(formData.budgetEuros || 0)}`;
  const vibe = labelForPreference(formData.preference).toLowerCase();

  if (!tripLength) {
    return `Planning a ${vibe} trip from ${city} with ${budget}. Add valid dates to see the weekend shape.`;
  }

  return `Planning a ${tripLength.toLowerCase()} from ${city} with ${budget} and a ${vibe} focus.`;
}

function applyDatePreset(
  setFormData: React.Dispatch<React.SetStateAction<GenerateTripRequest>>,
  preset: "this" | "next",
) {
  const dates = getWeekendPreset(preset);

  setFormData((current) => ({
    ...current,
    departureDate: dates.departureDate,
    returnDate: dates.returnDate,
  }));
}

function getWeekendPreset(preset: "this" | "next") {
  const today = new Date();
  const departure = getUpcomingFriday(today, preset === "next" ? 7 : 0);
  const returnDate = new Date(departure);
  returnDate.setDate(departure.getDate() + 2);

  return {
    departureDate: formatInputDate(departure),
    returnDate: formatInputDate(returnDate),
  };
}

function getUpcomingFriday(today: Date, extraDays: number) {
  const base = new Date(today);
  base.setHours(12, 0, 0, 0);

  let offset = (5 - base.getDay() + 7) % 7;
  if (offset === 0 && today.getHours() >= 12) {
    offset = 7;
  }

  if (base.getDay() === 6) {
    offset = 6;
  }

  base.setDate(base.getDate() + offset + extraDays);
  return base;
}

function formatInputDate(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function labelForTransportLink(trip: TripOption) {
  if (trip.transportLinkStatus === "verified") {
    return `View ${trip.transportMode.toLowerCase()} options`;
  }

  if (trip.transportLinkStatus === "search_only") {
    return `Search ${trip.transportMode.toLowerCase()}`;
  }

  return `${trip.transportMode} unavailable`;
}

function labelForStayLink(trip: TripOption) {
  if (trip.stayLinkStatus === "verified") {
    return "View stays";
  }

  if (trip.stayLinkStatus === "search_only") {
    return "Search stays";
  }

  return "Stays unavailable";
}

function formatDateLabel(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function formatGeneratedAt(meta: GenerateTripMeta): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(meta.generatedAt));
}

function labelForPreference(preference: TravelPreference): string {
  return preferenceOptions.find((option) => option.value === preference)?.label ?? preference;
}
