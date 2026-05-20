const ALLOWED_EXTERNAL_LINK_HOSTS = new Set([
  "www.booking.com",
  "www.hostelworld.com",
  "www.omio.com",
]);

export function buildTransportSearchLink(
  originCity: string,
  destinationCity: string,
): string {
  const originSlug = slugifyCity(originCity);
  const destinationSlug = slugifyCity(destinationCity);

  if (!originSlug || !destinationSlug) {
    return "https://www.omio.com/trains";
  }

  return `https://www.omio.com/trains/${originSlug}/${destinationSlug}`;
}

export function buildStaySearchLink(
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

  if (normalizeStayProvider(provider) === "Hostelworld") {
    return `https://www.hostelworld.com/st/hostels/europe/?${params.toString()}`;
  }

  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

export function normalizeStayProvider(provider: string): string {
  return provider.toLowerCase().includes("hostel")
    ? "Hostelworld"
    : "Booking.com";
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
