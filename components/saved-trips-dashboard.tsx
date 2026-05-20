"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { SavedTripRecord } from "@/lib/saved-trips";

export function SavedTripsDashboard({
  initialTrips,
}: {
  initialTrips: SavedTripRecord[];
}) {
  const [trips, setTrips] = useState(initialTrips);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/saved-trips/${id}`, {
          method: "DELETE",
        });
        const payload = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to delete trip.");
        }

        setTrips((current) => current.filter((trip) => trip.id !== id));
      } catch (deleteError) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : "Unable to delete trip.",
        );
      }
    });
  }

  if (trips.length < 1) {
    return (
      <div className="rounded-[1.1rem] border border-border-soft bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <p className="text-sm font-semibold text-slate-900">No saved trips yet</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Save one of your generated itineraries from the planner and it will
          show up here.
        </p>
        <Link
          className="med-button-dark mt-4 inline-flex rounded-lg px-4 py-3 text-sm font-semibold"
          href="/#planner"
        >
          Generate a trip
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {trips.map((trip) => (
          <article
            key={trip.id}
            className={`trip-card ${getTripAccentClass(trip.vibe_label)} rounded-[1.2rem] p-5`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
                  {trip.vibe_label}
                </p>
                <h2 className="mt-1.5 text-[1.45rem] font-semibold leading-tight text-slate-950">
                  <span className="mr-2" aria-hidden="true">
                    {flagForCountry(trip.destination_country)}
                  </span>
                  {trip.destination_city}, {trip.destination_country}
                </h2>
                <p className="mt-2 text-xs leading-5 text-[var(--color-ink-muted)]">
                  Saved {formatSavedAt(trip.created_at)}
                </p>
              </div>
              <button
                className="med-button-light rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-60"
                disabled={isPending}
                onClick={() => handleDelete(trip.id)}
                type="button"
              >
                Delete
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-800">{trip.summary}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">
              {trip.why_visit}
            </p>

            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
                Weekend shape
              </p>
              <p className="mt-1.5 text-sm leading-6 text-slate-700">
                {trip.sample_plan}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {trip.highlights.map((highlight) => (
                <span
                  key={`${trip.id}-${highlight}`}
                  className="rounded-full border border-border-soft bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                >
                  {highlight}
                </span>
              ))}
            </div>

            <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <div className="rounded-lg border border-border-soft bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
                  Route
                </p>
                <p className="mt-1">{trip.origin_city} to {trip.destination_city}</p>
              </div>
              <div className="rounded-lg border border-border-soft bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
                  Dates
                </p>
                <p className="mt-1">{trip.departure_date} to {trip.return_date}</p>
              </div>
              <div className="rounded-lg border border-border-soft bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
                  Estimated cost
                </p>
                <p className="mt-1">EUR {trip.estimated_cost_min}-{trip.estimated_cost_max}</p>
              </div>
              <div className="rounded-lg border border-border-soft bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
                  Transit
                </p>
                <p className="mt-1">{trip.travel_time_text}</p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-[var(--color-ink-muted)]">
              {trip.disclaimer}
            </p>

            <div className="mt-4 flex gap-2.5">
              {trip.transport_link ? (
                <a
                  className="med-button-dark flex-1 rounded-lg px-3 py-3 text-center text-sm font-semibold"
                  href={trip.transport_link}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Search transport
                </a>
              ) : null}
              {trip.stay_link ? (
                <a
                  className="med-button-light flex-1 rounded-lg border px-3 py-3 text-center text-sm font-semibold"
                  href={trip.stay_link}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Search stays
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function formatSavedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
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
