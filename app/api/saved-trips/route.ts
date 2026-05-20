import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  buildSavedTripInsert,
  validateSaveTripPayload,
} from "@/lib/saved-trips";
import { isClerkConfigured } from "@/lib/auth-config";
import {
  createSupabaseAdminClient,
  formatSupabaseError,
  getSupabaseConfigError,
  isSupabaseConfigured,
  SAVED_TRIPS_TABLE,
} from "@/lib/supabase";

export async function GET() {
  if (!isClerkConfigured()) {
    return NextResponse.json({ error: "Auth is not configured." }, { status: 503 });
  }

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: getSupabaseConfigError() ?? "Supabase is not configured." },
      { status: 503 },
    );
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from(SAVED_TRIPS_TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: formatSupabaseError(error) }, { status: 500 });
    }

    return NextResponse.json({ trips: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: formatSupabaseError(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isClerkConfigured()) {
    return NextResponse.json({ error: "Auth is not configured." }, { status: 503 });
  }

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: getSupabaseConfigError() ?? "Supabase is not configured." },
      { status: 503 },
    );
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
      return NextResponse.json(
        { error: formatSupabaseError(duplicateCheck.error) },
        { status: 500 },
      );
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
      return NextResponse.json({ error: formatSupabaseError(error) }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    const message =
      formatSupabaseError(error);

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
