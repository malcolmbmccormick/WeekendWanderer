import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth-config";

export default function SignInPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="grid-fade min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <section className="mx-auto w-full max-w-3xl rounded-[1.25rem] border border-border-soft bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
            Sign in
          </p>
          <h1 className="mt-3 font-serif text-4xl text-slate-950">
            Auth is not configured yet.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Add your Clerk publishable key and secret key in Vercel to enable
            sign-in.
          </p>
          <Link
            className="med-button-dark mt-6 inline-flex rounded-lg px-4 py-3 text-sm font-semibold"
            href="/"
          >
            Back to planner
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="grid-fade min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-5xl items-start justify-center">
        <div className="rounded-[1.6rem] border border-border-soft bg-white/92 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <SignIn
            fallbackRedirectUrl="/dashboard"
            forceRedirectUrl="/dashboard"
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
          />
        </div>
      </section>
    </main>
  );
}
