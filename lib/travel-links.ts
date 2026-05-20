const ALLOWED_EXTERNAL_LINK_HOSTS = new Set([
  "www.hostelworld.com",
  "www.omio.com",
]);

export function buildTransportSearchLink(
  originCity: string,
  destinationCity: string,
  departureDate: string,
  returnDate: string,
  transportMode: string,
): string {
  const originSlug = slugifyCity(originCity);
  const destinationSlug = slugifyCity(destinationCity);
  const travelMode = normalizeTransportMode(transportMode);
  const params = new URLSearchParams({
    locale: "en",
    departure_date: formatDateForOmio(departureDate),
    travel_mode: travelMode,
  });

  if (returnDate) {
    params.set("return_date", formatDateForOmio(returnDate));
  }

  if (!originSlug || !destinationSlug) {
    return `https://www.omio.com/${travelMode === "bus" ? "buses" : "trains"}?${params.toString()}`;
  }

  const routeSegment = travelMode === "bus" ? "buses" : "trains";

  return `https://www.omio.com/${routeSegment}/${originSlug}/${destinationSlug}?${params.toString()}`;
}

export function buildStaySearchLink(
  locationLabel: string,
  departureDate: string,
  returnDate: string,
): string {
  const { city, country } = splitLocationLabel(locationLabel);
  const citySlug = slugifyCity(city);
  const countrySlug = slugifyCity(country);
  const params = new URLSearchParams({
    dateFrom: departureDate,
    dateTo: returnDate,
    guests: "1",
  });

  if (!citySlug || !countrySlug) {
    return `https://www.hostelworld.com/hostels/europe/?${params.toString()}`;
  }

  return `https://www.hostelworld.com/hostels/europe/${countrySlug}/${citySlug}/?${params.toString()}`;
}

export function normalizeStayProvider(): string {
  return "Hostelworld";
}

export function safeExternalUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "https:") {
      return null;
    }

    if (!ALLOWED_EXTERNAL_LINK_HOSTS.has(url.hostname)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function slugifyCity(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitLocationLabel(value: string): { city: string; country: string } {
  const [city = "", country = ""] = value.split(",").map((part) => part.trim());

  return { city, country };
}

function normalizeTransportMode(value: string): "bus" | "train" {
  return value.toLowerCase().includes("bus") ? "bus" : "train";
}

function formatDateForOmio(value: string): string {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}
