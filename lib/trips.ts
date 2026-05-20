export type TravelPreference =
  | "balanced"
  | "culture"
  | "nightlife"
  | "nature";

export type GenerateTripRequest = {
  originCity: string;
  departureDate: string;
  returnDate: string;
  budgetEuros: number;
  preference: TravelPreference;
};

export type TripOption = {
  destinationCity: string;
  destinationCountry: string;
  summary: string;
  whyVisit: string;
  highlights: string[];
  samplePlan: string;
  travelTimeText: string;
  estimatedCostMin: number;
  estimatedCostMax: number;
  transportMode: string;
  transportLink: string | null;
  transportLinkStatus: "verified" | "search_only" | "unavailable";
  transportLinkNote: string;
  stayProvider: string;
  stayLink: string | null;
  stayLinkStatus: "verified" | "search_only" | "unavailable";
  stayLinkNote: string;
  disclaimer: string;
  vibeLabel: string;
};

export type GenerateTripResponse = {
  options: TripOption[];
  meta: {
    generatedAt: string;
    source: "rules" | "openai";
    model: string | null;
    bookingLinkPolicy: "provider_search_only" | "provider_verified";
  };
};

type GeneratedTripDraft = {
  destinationCity: string;
  destinationCountry: string;
  summary: string;
  whyVisit: string;
  highlights: string[];
  samplePlan: string;
  travelTimeText: string;
  estimatedCostMin: number;
  estimatedCostMax: number;
  transportMode: string;
  stayProvider: string;
  vibeLabel: string;
};

type BudgetTier = "cheap" | "moderate" | "higher";
type BorderEase = "domestic" | "easy_cross_border" | "long_cross_border";

type TripSeed = {
  destinationCity: string;
  destinationCountry: string;
  travelTimeText: string;
  transitMinutes: number;
  transportMode: string;
  stayProvider: string;
  vibeLabel: string;
  tags: TravelPreference[];
  budgetTier: BudgetTier;
  borderEase: BorderEase;
  baseMin: number;
  baseMax: number;
  summary: string;
  standout: string;
  bestFor: string;
  accommodationHint: string;
  highlights: string[];
  samplePlan: string;
};

const TRIP_SEEDS: TripSeed[] = [
  {
    destinationCity: "Brno",
    destinationCountry: "Czech Republic",
    travelTimeText: "1h 45m by rail",
    transitMinutes: 105,
    transportMode: "Train",
    stayProvider: "Hostelworld",
    vibeLabel: "Budget + food scene",
    tags: ["balanced", "culture", "nightlife"],
    budgetTier: "cheap",
    borderEase: "easy_cross_border",
    baseMin: 90,
    baseMax: 140,
    summary:
      "Fast rail access, cafe-heavy streets, and enough nightlife density to make a low-cost weekend feel like a real trip rather than a fallback.",
    standout: "Brno works especially well for first-time Central Europe travel because the center is compact and easy to cover on foot.",
    bestFor: "food, bars, and modern architecture without Prague pricing",
    accommodationHint: "hostels and simple city-center stays near the old town",
    highlights: ["old town cafes", "modernist villas", "late-night bar streets"],
    samplePlan:
      "Spend Saturday around the old town and cafe scene, then use Sunday for architecture, food, and one final city-center walk before the train back.",
  },
  {
    destinationCity: "Graz",
    destinationCountry: "Austria",
    travelTimeText: "2h 35m by train",
    transitMinutes: 155,
    transportMode: "Train",
    stayProvider: "Booking.com",
    vibeLabel: "Design + slower pace",
    tags: ["balanced", "culture"],
    budgetTier: "cheap",
    borderEase: "domestic",
    baseMin: 95,
    baseMax: 150,
    summary:
      "A lower-friction weekend with strong food, smart urban design, and enough museums and public spaces to feel intentional without being exhausting.",
    standout:
      "Graz is ideal when you want a clean, easy train weekend with very little planning overhead.",
    bestFor: "architecture, markets, and a slower city break",
    accommodationHint: "simple hotels or guesthouses near the old town",
    highlights: ["Schlossberg views", "farmer's markets", "design-forward public spaces"],
    samplePlan:
      "Use the first day for the old town and Schlossberg, then keep the second day slower with markets, museums, and long cafe stops.",
  },
  {
    destinationCity: "Budapest",
    destinationCountry: "Hungary",
    travelTimeText: "2h 40m by train",
    transitMinutes: 160,
    transportMode: "Train",
    stayProvider: "Booking.com",
    vibeLabel: "Nightlife + thermal baths",
    tags: ["balanced", "nightlife", "culture"],
    budgetTier: "moderate",
    borderEase: "easy_cross_border",
    baseMin: 110,
    baseMax: 170,
    summary:
      "A high-energy capital weekend with thermal baths, late-night food, and neighborhoods that reward two packed days of walking and transit hopping.",
    standout:
      "Budapest gives you more headline experiences per euro than most nearby capitals.",
    bestFor: "nightlife, bath culture, and high-value city energy",
    accommodationHint: "district V to VII stays for walkability and nightlife access",
    highlights: ["thermal baths", "ruin bars", "Danube river views"],
    samplePlan:
      "Anchor one day around baths and central neighborhoods, then use the second for viewpoints, food, and a stronger nightlife finish.",
  },
  {
    destinationCity: "Ljubljana",
    destinationCountry: "Slovenia",
    travelTimeText: "5h 45m by train",
    transitMinutes: 345,
    transportMode: "Train",
    stayProvider: "Booking.com",
    vibeLabel: "Culture + relaxed nightlife",
    tags: ["balanced", "culture", "nightlife"],
    budgetTier: "moderate",
    borderEase: "easy_cross_border",
    baseMin: 140,
    baseMax: 190,
    summary:
      "A compact, polished capital with riverside cafes, a very walkable center, and enough atmosphere to justify a longer rail ride from Austria or nearby hubs.",
    standout:
      "Ljubljana feels international without becoming overwhelming for a short weekend.",
    bestFor: "first-time cross-border travel, riverside strolling, and a relaxed social scene",
    accommodationHint: "central hostels or guesthouses close to the river",
    highlights: ["riverside walks", "castle viewpoint", "compact old town"],
    samplePlan:
      "Treat the weekend as a slow city break: old town and river on arrival, then the castle, food, and neighborhoods on the full day.",
  },
  {
    destinationCity: "Salzburg",
    destinationCountry: "Austria",
    travelTimeText: "2h 30m by train",
    transitMinutes: 150,
    transportMode: "Train",
    stayProvider: "Booking.com",
    vibeLabel: "Scenic + culture",
    tags: ["balanced", "culture", "nature"],
    budgetTier: "higher",
    borderEase: "domestic",
    baseMin: 160,
    baseMax: 220,
    summary:
      "A cinematic weekend built around old-town walks, museum stops, and mountain-backed views that feel distinct even on a short schedule.",
    standout:
      "Salzburg is strongest when the goal is a polished, postcard-quality weekend with very little guesswork.",
    bestFor: "classic culture, scenic streets, and easy photo-heavy itineraries",
    accommodationHint: "old-town edge stays to balance price and walkability",
    highlights: ["Altstadt walks", "fortress views", "museum stops"],
    samplePlan:
      "Keep one day centered on the old town and fortress, then spend the next on museums, viewpoints, and a slower cafe-heavy finish.",
  },
  {
    destinationCity: "Innsbruck",
    destinationCountry: "Austria",
    travelTimeText: "4h 20m by train",
    transitMinutes: 260,
    transportMode: "Train",
    stayProvider: "Hostelworld",
    vibeLabel: "Alpine + outdoors",
    tags: ["nature", "balanced"],
    budgetTier: "higher",
    borderEase: "domestic",
    baseMin: 145,
    baseMax: 210,
    summary:
      "A mountain-forward city break with quick access to alpine views, good walking, and enough urban infrastructure to make an outdoorsy weekend feel easy.",
    standout:
      "Innsbruck is the clearest choice when scenery matters more than nightlife or museums.",
    bestFor: "mountain views, cable cars, and active daytime itineraries",
    accommodationHint: "budget hostels or simple hotels near the station or old town",
    highlights: ["alpine panoramas", "cable car access", "walkable center"],
    samplePlan:
      "Use the best weather window for the mountain-facing part of the trip, then spend the remaining time in the compact center and along easy walking routes.",
  },
  {
    destinationCity: "Prague",
    destinationCountry: "Czech Republic",
    travelTimeText: "4h 15m by rail",
    transitMinutes: 255,
    transportMode: "Train",
    stayProvider: "Hostelworld",
    vibeLabel: "Big-city culture",
    tags: ["culture", "balanced", "nightlife"],
    budgetTier: "moderate",
    borderEase: "easy_cross_border",
    baseMin: 135,
    baseMax: 205,
    summary:
      "A dense, high-payoff city weekend with major architecture, late-night energy, and enough recognizable landmarks to fill a long weekend quickly.",
    standout:
      "Prague is worth choosing when you want a more iconic destination and are comfortable with bigger crowds.",
    bestFor: "landmarks, nightlife, and a more dramatic city atmosphere",
    accommodationHint: "hostels or budget hotels outside the busiest tourist core",
    highlights: ["Old Town landmarks", "bridge walks", "late-night neighborhoods"],
    samplePlan:
      "Front-load the landmark-heavy core early, then leave space for neighborhoods, food, and nightlife once the city opens up after dark.",
  },
  {
    destinationCity: "Zagreb",
    destinationCountry: "Croatia",
    travelTimeText: "6h 30m by train and regional transfer",
    transitMinutes: 390,
    transportMode: "Train",
    stayProvider: "Booking.com",
    vibeLabel: "Cheaper capital weekend",
    tags: ["balanced", "culture"],
    budgetTier: "cheap",
    borderEase: "long_cross_border",
    baseMin: 120,
    baseMax: 180,
    summary:
      "A lower-cost capital with a cafe-driven rhythm, broad public squares, and a weekend pace that feels more local than tourist-saturated.",
    standout:
      "Zagreb is strongest when you want something different from the usual Vienna-Prague-Budapest circuit.",
    bestFor: "budget-conscious city breaks and a less obvious destination",
    accommodationHint: "simple central stays near the lower town",
    highlights: ["broad public squares", "cafe culture", "less tourist-heavy pace"],
    samplePlan:
      "Use the first day for the lower town and cafe streets, then spend the second moving between local neighborhoods and broader public squares.",
  },
  {
    destinationCity: "Trieste",
    destinationCountry: "Italy",
    travelTimeText: "7h 10m by rail",
    transitMinutes: 430,
    transportMode: "Train",
    stayProvider: "Booking.com",
    vibeLabel: "Coastal culture",
    tags: ["culture", "balanced"],
    budgetTier: "moderate",
    borderEase: "long_cross_border",
    baseMin: 145,
    baseMax: 210,
    summary:
      "A literary, sea-facing city weekend with coffeehouse culture, grand Habsburg-era streets, and a pace that feels different from inland Central Europe.",
    standout:
      "Trieste is a smart pick when you want coastal atmosphere without committing to a full beach trip.",
    bestFor: "cafes, waterfront walks, and a more unusual culture weekend",
    accommodationHint: "small hotels or guesthouses near the center and waterfront",
    highlights: ["waterfront promenades", "historic coffeehouses", "Habsburg-era streets"],
    samplePlan:
      "Build the weekend around long waterfront walks and coffeehouse stops, then use the second day for city-center streets and slower cultural browsing.",
  },
  {
    destinationCity: "Munich",
    destinationCountry: "Germany",
    travelTimeText: "4h 05m by train",
    transitMinutes: 245,
    transportMode: "Train",
    stayProvider: "Booking.com",
    vibeLabel: "Large-city classic",
    tags: ["balanced", "culture", "nightlife"],
    budgetTier: "higher",
    borderEase: "easy_cross_border",
    baseMin: 170,
    baseMax: 240,
    summary:
      "A reliable larger-city weekend with strong museums, beer halls, and very easy urban navigation for travelers who want something familiar and efficient.",
    standout:
      "Munich works well when you want a major city feel without sacrificing clean logistics.",
    bestFor: "museum-heavy itineraries, classic city sights, and group trips",
    accommodationHint: "budget hotels or hostels near central transit lines",
    highlights: ["museum district", "beer halls", "big-city ease"],
    samplePlan:
      "Pick one anchor district or museum cluster per day so the weekend feels big without becoming a transit-heavy scramble.",
  },
  {
    destinationCity: "Hallstatt",
    destinationCountry: "Austria",
    travelTimeText: "3h 30m by train and ferry link",
    transitMinutes: 210,
    transportMode: "Train",
    stayProvider: "Booking.com",
    vibeLabel: "Scenic + slow",
    tags: ["nature", "culture"],
    budgetTier: "higher",
    borderEase: "domestic",
    baseMin: 165,
    baseMax: 235,
    summary:
      "A scenery-first weekend with lake views and a slower pace, better for short walks and atmosphere than for nightlife or a long checklist of attractions.",
    standout:
      "Hallstatt is best when the whole point of the weekend is visual payoff and quiet pace.",
    bestFor: "scenery, photos, and a low-noise reset weekend",
    accommodationHint: "small guesthouses booked early because supply is limited",
    highlights: ["lakefront views", "quiet village pace", "short scenic walks"],
    samplePlan:
      "Keep the itinerary intentionally light: scenic walks, slow meals, and enough free space to enjoy the setting instead of over-scheduling it.",
  },
  {
    destinationCity: "Bratislava",
    destinationCountry: "Slovakia",
    travelTimeText: "1h 05m by rail",
    transitMinutes: 65,
    transportMode: "Train",
    stayProvider: "Hostelworld",
    vibeLabel: "Ultra-easy weekend",
    tags: ["balanced", "nightlife", "culture"],
    budgetTier: "cheap",
    borderEase: "easy_cross_border",
    baseMin: 80,
    baseMax: 130,
    summary:
      "An extremely low-friction weekend option with easy rail access, a compact old town, and enough bars and viewpoints to make even a short trip worth taking.",
    standout:
      "Bratislava is the easiest 'I just want to go somewhere this weekend' choice from Vienna.",
    bestFor: "spontaneous trips, short planning windows, and low transport time",
    accommodationHint: "hostels or simple central stays in the old town",
    highlights: ["quick train access", "compact old town", "easy bar-and-viewpoint mix"],
    samplePlan:
      "Because transit is so short, you can keep the weekend flexible: old town and castle area first, then food, bars, and one last slow morning.",
  },
];

const DEFAULT_DISCLAIMER =
  "Estimated costs are rough ranges, not live fares or guaranteed booking prices.";

export function getDefaultTripRequest(): GenerateTripRequest {
  const today = new Date();
  const departureDate = getNextWeekendDate(today, 5);
  const returnDate = getNextWeekendDate(today, 0, departureDate);

  return {
    originCity: "Vienna",
    departureDate: formatDateForInput(departureDate),
    returnDate: formatDateForInput(returnDate),
    budgetEuros: 180,
    preference: "balanced",
  };
}

export function generateTripOptions(
  input: GenerateTripRequest,
): GenerateTripResponse {
  const tripLengthDays = calculateTripLengthDays(
    input.departureDate,
    input.returnDate,
  );

  const ranked = [...TRIP_SEEDS]
    .sort(
      (a, b) =>
        scoreSeed(b, input, tripLengthDays) - scoreSeed(a, input, tripLengthDays),
    )
    .slice(0, 3);

  return {
    options: ranked.map((seed) => buildTripOption(seed, input, tripLengthDays)),
    meta: {
      generatedAt: new Date().toISOString(),
      source: "rules",
      model: null,
      bookingLinkPolicy: "provider_search_only",
    },
  };
}

export function buildTripOptionFromDraft(
  draft: GeneratedTripDraft,
  input: GenerateTripRequest,
): TripOption {
  const locationLabel = `${draft.destinationCity}, ${draft.destinationCountry}`;
  const stayProvider = normalizeStayProvider(draft.stayProvider);
  const estimatedCostMin = Math.max(70, Math.round(draft.estimatedCostMin));
  const estimatedCostMax = Math.max(
    estimatedCostMin + 20,
    Math.round(draft.estimatedCostMax),
  );

  return {
    destinationCity: draft.destinationCity.trim(),
    destinationCountry: draft.destinationCountry.trim(),
    summary: draft.summary.trim(),
    whyVisit: draft.whyVisit.trim(),
    highlights: draft.highlights.map((item) => item.trim()).filter(Boolean).slice(0, 4),
    samplePlan: draft.samplePlan.trim(),
    travelTimeText: draft.travelTimeText.trim(),
    estimatedCostMin,
    estimatedCostMax,
    transportMode: draft.transportMode.trim(),
    transportLink: buildTransportSearchLink(
      input.originCity,
      draft.destinationCity.trim(),
      input.departureDate,
      input.returnDate,
    ),
    transportLinkStatus: "search_only",
    transportLinkNote:
      "This opens a provider search page with your route intent, not a verified live itinerary.",
    stayProvider,
    stayLink: buildStaySearchLink(
      locationLabel,
      input.departureDate,
      input.returnDate,
      stayProvider,
    ),
    stayLinkStatus: "search_only",
    stayLinkNote:
      "This opens a provider search page. Inventory and exact prefilled results are not guaranteed yet.",
    disclaimer: DEFAULT_DISCLAIMER,
    vibeLabel: draft.vibeLabel.trim(),
  };
}

export function parseGeneratedTripDrafts(payload: unknown): GeneratedTripDraft[] {
  if (!payload || typeof payload !== "object") {
    throw new Error("Generated itinerary payload must be an object.");
  }

  const options = (payload as { options?: unknown }).options;

  if (!Array.isArray(options) || options.length < 1) {
    throw new Error("Generated itinerary payload must include options.");
  }

  return options.slice(0, 3).map((option, index) => {
    if (!option || typeof option !== "object") {
      throw new Error(`Generated option ${index + 1} is invalid.`);
    }

    const candidate = option as Partial<GeneratedTripDraft>;

    return {
      destinationCity: requireText(candidate.destinationCity, "destinationCity"),
      destinationCountry: requireText(candidate.destinationCountry, "destinationCountry"),
      summary: requireText(candidate.summary, "summary"),
      whyVisit: requireText(candidate.whyVisit, "whyVisit"),
      highlights: requireStringArray(candidate.highlights, "highlights"),
      samplePlan: requireText(candidate.samplePlan, "samplePlan"),
      travelTimeText: requireText(candidate.travelTimeText, "travelTimeText"),
      estimatedCostMin: requireNumber(candidate.estimatedCostMin, "estimatedCostMin"),
      estimatedCostMax: requireNumber(candidate.estimatedCostMax, "estimatedCostMax"),
      transportMode: requireText(candidate.transportMode, "transportMode"),
      stayProvider: requireText(candidate.stayProvider, "stayProvider"),
      vibeLabel: requireText(candidate.vibeLabel, "vibeLabel"),
    };
  });
}

export function validateGenerateTripRequest(
  payload: unknown,
): GenerateTripRequest {
  if (!payload || typeof payload !== "object") {
    throw new Error("Request body must be a JSON object.");
  }

  const candidate = payload as Partial<GenerateTripRequest>;
  const originCity = candidate.originCity?.trim();

  if (!originCity) {
    throw new Error("Origin city is required.");
  }

  if (!candidate.departureDate || !isDateString(candidate.departureDate)) {
    throw new Error("Departure date must be a valid date.");
  }

  if (!candidate.returnDate || !isDateString(candidate.returnDate)) {
    throw new Error("Return date must be a valid date.");
  }

  if (candidate.departureDate > candidate.returnDate) {
    throw new Error("Return date must be after departure date.");
  }

  if (
    typeof candidate.budgetEuros !== "number" ||
    !Number.isFinite(candidate.budgetEuros) ||
    candidate.budgetEuros < 50
  ) {
    throw new Error("Budget must be at least EUR 50.");
  }

  const preference = candidate.preference ?? "balanced";

  if (!isPreference(preference)) {
    throw new Error("Preference must be balanced, culture, nightlife, or nature.");
  }

  return {
    originCity,
    departureDate: candidate.departureDate,
    returnDate: candidate.returnDate,
    budgetEuros: Math.round(candidate.budgetEuros),
    preference,
  };
}

function buildTripOption(
  seed: TripSeed,
  input: GenerateTripRequest,
  tripLengthDays: number,
): TripOption {
  const offset = Math.max(-30, Math.min(45, Math.round((input.budgetEuros - 160) / 3)));
  const estimatedCostMin = Math.max(70, seed.baseMin + offset);
  const estimatedCostMax = Math.max(
    estimatedCostMin + 25,
    seed.baseMax + offset,
  );
  const locationLabel = `${seed.destinationCity}, ${seed.destinationCountry}`;
  const stayProvider = normalizeStayProvider(seed.stayProvider);

  return {
    destinationCity: seed.destinationCity,
    destinationCountry: seed.destinationCountry,
    summary: buildSummary(seed, input.originCity),
    whyVisit: buildWhyVisit(seed, input.budgetEuros, tripLengthDays),
    highlights: seed.highlights,
    samplePlan: seed.samplePlan,
    travelTimeText: seed.travelTimeText,
    estimatedCostMin,
    estimatedCostMax,
    transportMode: seed.transportMode,
    transportLink: buildTransportSearchLink(
      input.originCity,
      seed.destinationCity,
      input.departureDate,
      input.returnDate,
    ),
    transportLinkStatus: "search_only",
    transportLinkNote:
      "This opens a provider search page with your route intent, not a verified live itinerary.",
    stayProvider,
    stayLink: buildStaySearchLink(
      locationLabel,
      input.departureDate,
      input.returnDate,
      stayProvider,
    ),
    stayLinkStatus: "search_only",
    stayLinkNote:
      "This opens a provider search page. Inventory and exact prefilled results are not guaranteed yet.",
    disclaimer: DEFAULT_DISCLAIMER,
    vibeLabel: seed.vibeLabel,
  };
}

function buildSummary(seed: TripSeed, originCity: string): string {
  return `${seed.summary} From ${originCity}, it is a ${seed.travelTimeText.toLowerCase()} option with ${seed.bestFor}.`;
}

function buildWhyVisit(
  seed: TripSeed,
  budgetEuros: number,
  tripLengthDays: number,
): string {
  const budgetLine =
    seed.budgetTier === "cheap"
      ? `It is one of the stronger picks if you want to stay around or below EUR ${budgetEuros}.`
      : seed.budgetTier === "moderate"
        ? `It fits best when you have enough budget flexibility to spend roughly EUR ${Math.max(120, budgetEuros - 15)} to ${budgetEuros + 20}.`
        : `This works better when you are willing to spend a bit more for scenery, scale, or a more polished weekend feel.`;

  const durationLine =
    tripLengthDays <= 2 && seed.transitMinutes > 300
      ? "It is more ambitious on a shorter weekend, so it works best if you leave early and keep the itinerary focused."
      : tripLengthDays >= 3 && seed.transitMinutes <= 170
        ? "Because transit is relatively easy, you will still have plenty of time left for neighborhoods, food, and one or two anchor activities."
        : "The transit-to-reward ratio is still reasonable for a normal Friday-to-Sunday style trip.";

  return `${seed.standout} ${budgetLine} ${durationLine} Look for ${seed.accommodationHint}.`;
}

function scoreSeed(
  seed: TripSeed,
  input: GenerateTripRequest,
  tripLengthDays: number,
): number {
  const preferenceScore = seed.tags.includes(input.preference) ? 3.5 : 0;
  const budgetScore = scoreBudgetFit(seed, input.budgetEuros);
  const transitScore = scoreTransitFit(seed.transitMinutes, tripLengthDays);
  const borderScore = scoreBorderEase(seed.borderEase, tripLengthDays);
  const originPenalty =
    seed.destinationCity.toLowerCase() === input.originCity.toLowerCase() ? -8 : 0;

  return preferenceScore + budgetScore + transitScore + borderScore + originPenalty;
}

function scoreBudgetFit(seed: TripSeed, budgetEuros: number): number {
  const midpoint = (seed.baseMin + seed.baseMax) / 2;
  const distance = Math.abs(budgetEuros - midpoint);

  let score = Math.max(0, 6 - distance / 22);

  if (budgetEuros <= 120 && seed.budgetTier === "cheap") {
    score += 1.5;
  }

  if (budgetEuros >= 190 && seed.budgetTier === "higher") {
    score += 0.75;
  }

  return score;
}

function scoreTransitFit(transitMinutes: number, tripLengthDays: number): number {
  if (tripLengthDays <= 2) {
    if (transitMinutes <= 120) {
      return 4;
    }

    if (transitMinutes <= 180) {
      return 3;
    }

    if (transitMinutes <= 270) {
      return 1.5;
    }

    return -0.75;
  }

  if (transitMinutes <= 180) {
    return 3;
  }

  if (transitMinutes <= 300) {
    return 2.2;
  }

  if (transitMinutes <= 420) {
    return 1;
  }

  return -0.25;
}

function scoreBorderEase(borderEase: BorderEase, tripLengthDays: number): number {
  if (borderEase === "domestic") {
    return 1.25;
  }

  if (borderEase === "easy_cross_border") {
    return 1;
  }

  return tripLengthDays >= 3 ? 0.4 : -0.6;
}

function calculateTripLengthDays(
  departureDate: string,
  returnDate: string,
): number {
  const departure = new Date(`${departureDate}T12:00:00`);
  const arrival = new Date(`${returnDate}T12:00:00`);
  const diffMs = arrival.getTime() - departure.getTime();

  return Math.max(1, Math.round(diffMs / 86_400_000) + 1);
}

function buildTransportSearchLink(
  originCity: string,
  destinationCity: string,
  departureDate: string,
  returnDate: string,
): string {
  const params = new URLSearchParams({
    locale: "en",
    from: originCity,
    to: destinationCity,
    outboundDate: departureDate,
    inboundDate: returnDate,
  });

  return `https://www.omio.com/search-frontend/results?${params.toString()}`;
}

function buildStaySearchLink(
  locationLabel: string,
  departureDate: string,
  returnDate: string,
  provider: string,
): string {
  const params = new URLSearchParams({
    ss: locationLabel,
    checkin: departureDate,
    checkout: returnDate,
    group_adults: "1",
    no_rooms: "1",
    group_children: "0",
  });

  if (provider === "Hostelworld") {
    return `https://www.hostelworld.com/st/hostels/europe/?${params.toString()}`;
  }

  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

function normalizeStayProvider(provider: string): string {
  return provider.toLowerCase().includes("hostel")
    ? "Hostelworld"
    : "Booking.com";
}

function requireText(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Generated itinerary field "${field}" must be text.`);
  }

  return value.trim();
}

function requireNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Generated itinerary field "${field}" must be a number.`);
  }

  return value;
}

function requireStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.length < 1) {
    throw new Error(`Generated itinerary field "${field}" must be a non-empty array.`);
  }

  const cleaned = value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim());

  if (cleaned.length < 1) {
    throw new Error(`Generated itinerary field "${field}" must include text items.`);
  }

  return cleaned;
}

function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function isPreference(value: string): value is TravelPreference {
  return (
    value === "balanced" ||
    value === "culture" ||
    value === "nightlife" ||
    value === "nature"
  );
}

function getNextWeekendDate(
  today: Date,
  targetDay: number,
  baseDate?: Date,
): Date {
  const start = baseDate ? new Date(baseDate) : new Date(today);
  start.setHours(12, 0, 0, 0);

  const currentDay = start.getDay();
  let offset = (targetDay - currentDay + 7) % 7;

  if (!baseDate && (offset === 0 || (currentDay > targetDay && currentDay !== 0))) {
    offset += 7;
  }

  if (baseDate && offset === 0) {
    offset = 7;
  }

  start.setDate(start.getDate() + offset);
  return start;
}

function formatDateForInput(value: Date): string {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}
