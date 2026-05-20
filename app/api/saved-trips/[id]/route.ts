import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  isSupabaseConfigured,
  SAVED_TRIPS_TABLE,
} from "@/lib/supabase";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from(SAVED_TRIPS_TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
