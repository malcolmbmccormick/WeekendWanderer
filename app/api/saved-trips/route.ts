import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  buildSavedTripInsert,
  validateSaveTripPayload,
} from "@/lib/saved-trips";
import {
  createSupabaseAdminClient,
  isSupabaseConfigured,
  SAVED_TRIPS_TABLE,
} from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(SAVED_TRIPS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ trips: data ?? [] });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const payload = validateSaveTripPayload(body);
    const supabase = createSupabaseAdminClient();
    const duplicateCheck = await supabase
      .from(SAVED_TRIPS_TABLE)
      .select("id")
      .eq("user_id", userId)
      .eq("origin_city", payload.request.originCity)
      .eq("departure_date", payload.request.departureDate)
      .eq("return_date", payload.request.returnDate)
      .eq("destination_city", payload.trip.destinationCity)
      .eq("destination_country", payload.trip.destinationCountry)
      .limit(1)
      .maybeSingle();

    if (duplicateCheck.error) {
      return NextResponse.json({ error: duplicateCheck.error.message }, { status: 500 });
    }

    if (duplicateCheck.data?.id) {
      return NextResponse.json(
        { id: duplicateCheck.data.id, duplicate: true },
        { status: 200 },
      );
    }

    const { data, error } = await supabase
      .from(SAVED_TRIPS_TABLE)
      .insert(buildSavedTripInsert(userId, payload))
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save trip.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
