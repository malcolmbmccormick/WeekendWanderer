import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SavedTripsDashboard } from "@/components/saved-trips-dashboard";
import { isClerkConfigured } from "@/lib/auth-config";
import type { SavedTripRecord } from "@/lib/saved-trips";
import {
  createSupabaseAdminClient,
  isSupabaseConfigured,
  SAVED_TRIPS_TABLE,
} from "@/lib/supabase";

export default async function DashboardPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="grid-fade min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <section className="mx-auto w-full max-w-3xl rounded-[1.25rem] border border-border-soft bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
            Dashboard
          </p>
          <h1 className="mt-3 font-serif text-4xl text-slate-950">
            Auth is scaffolded but not configured yet.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Add your Clerk publishable key and secret key to enable sign-in and
            protect this page.
          </p>
          <div className="mt-6 rounded-lg border border-[color:var(--color-border-soft)] bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            Required env vars: <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>{" "}
            and <code>CLERK_SECRET_KEY</code>.
          </div>
          <Link
            className="mt-6 inline-flex rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-900"
            href="/"
          >
            Back to planner
          </Link>
        </section>
      </main>
    );
  }

  const { userId } = await auth();
  const supabaseEnabled = isSupabaseConfigured();
  let savedTrips: SavedTripRecord[] = [];
  let loadError: string | null = null;

  if (supabaseEnabled) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from(SAVED_TRIPS_TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      loadError = error.message;
    } else {
      savedTrips = (data ?? []) as SavedTripRecord[];
    }
  }

  return (
    <main className="grid-fade min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-5xl">
        <div className="rounded-[1.25rem] border border-border-soft bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
            Saved trips
          </p>
          <h1 className="mt-3 font-serif text-4xl text-slate-950">
            Your saved weekends
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Signed in as <span className="font-medium text-slate-900">{userId}</span>.
            Saved itineraries now live here once Supabase is configured.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              className="med-button-dark inline-flex rounded-lg px-4 py-3 text-sm font-semibold"
              href="/#planner"
            >
              Generate another trip
            </Link>
            <Link
              className="med-button-light inline-flex rounded-lg border px-4 py-3 text-sm font-semibold"
              href="/"
            >
              Back to homepage
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {!supabaseEnabled ? (
              <div className="rounded-[1.1rem] border border-border-soft bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Supabase setup pending</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> to enable saved trips.
                </p>
              </div>
            ) : loadError ? (
              <div className="rounded-[1.1rem] border border-red-200 bg-red-50 p-5">
                <p className="text-sm font-semibold text-red-800">Unable to load saved trips</p>
                <p className="mt-2 text-sm leading-6 text-red-700">{loadError}</p>
              </div>
            ) : (
              <SavedTripsDashboard initialTrips={savedTrips} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
