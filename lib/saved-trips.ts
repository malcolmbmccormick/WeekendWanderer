import type {
  GenerateTripRequest,
  GenerateTripResponse,
  TripOption,
} from "@/lib/trips";

export type SaveTripPayload = {
  request: GenerateTripRequest;
  trip: TripOption;
  meta: GenerateTripResponse["meta"];
};

export type SavedTripRecord = {
  id: string;
  user_id: string;
  origin_city: string;
  departure_date: string;
  return_date: string;
  budget_euros: number;
  preference: string;
  generation_source: string;
  generation_model: string | null;
  destination_city: string;
  destination_country: string;
  summary: string;
  why_visit: string;
  highlights: string[];
  sample_plan: string;
  travel_time_text: string;
  estimated_cost_min: number;
  estimated_cost_max: number;
  transport_mode: string;
  transport_link: string | null;
  transport_link_status: TripOption["transportLinkStatus"];
  transport_link_note: string;
  stay_provider: string;
  stay_link: string | null;
  stay_link_status: TripOption["stayLinkStatus"];
  stay_link_note: string;
  disclaimer: string;
  vibe_label: string;
  created_at: string;
};

export function validateSaveTripPayload(payload: unknown): SaveTripPayload {
  if (!payload || typeof payload !== "object") {
    throw new Error("Save payload must be an object.");
  }

  const candidate = payload as Partial<SaveTripPayload>;

  if (!candidate.request || typeof candidate.request !== "object") {
    throw new Error("Saved trip request context is required.");
  }

  if (!candidate.trip || typeof candidate.trip !== "object") {
    throw new Error("Saved trip data is required.");
  }

  if (!candidate.meta || typeof candidate.meta !== "object") {
    throw new Error("Saved trip generation metadata is required.");
  }

  const request = candidate.request as GenerateTripRequest;
  const trip = candidate.trip as TripOption;
  const meta = candidate.meta as GenerateTripResponse["meta"];

  if (
    !request.originCity ||
    !request.departureDate ||
    !request.returnDate ||
    !Number.isFinite(request.budgetEuros)
  ) {
    throw new Error("Saved trip request context is incomplete.");
  }

  if (
    !trip.destinationCity ||
    !trip.destinationCountry ||
    !trip.summary ||
    !trip.whyVisit ||
    !trip.samplePlan
  ) {
    throw new Error("Saved trip is missing required itinerary fields.");
  }

  return {
    request,
    trip,
    meta,
  };
}

export function buildSavedTripInsert(
  userId: string,
  payload: SaveTripPayload,
): Omit<SavedTripRecord, "id" | "created_at"> {
  const { request, trip, meta } = payload;

  return {
    user_id: userId,
    origin_city: request.originCity,
    departure_date: request.departureDate,
    return_date: request.returnDate,
    budget_euros: request.budgetEuros,
    preference: request.preference,
    generation_source: meta.source,
    generation_model: meta.model,
    destination_city: trip.destinationCity,
    destination_country: trip.destinationCountry,
    summary: trip.summary,
    why_visit: trip.whyVisit,
    highlights: trip.highlights,
    sample_plan: trip.samplePlan,
    travel_time_text: trip.travelTimeText,
    estimated_cost_min: trip.estimatedCostMin,
    estimated_cost_max: trip.estimatedCostMax,
    transport_mode: trip.transportMode,
    transport_link: trip.transportLink,
    transport_link_status: trip.transportLinkStatus,
    transport_link_note: trip.transportLinkNote,
    stay_provider: trip.stayProvider,
    stay_link: trip.stayLink,
    stay_link_status: trip.stayLinkStatus,
    stay_link_note: trip.stayLinkNote,
    disclaimer: trip.disclaimer,
    vibe_label: trip.vibeLabel,
  };
}
