import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="grid-fade min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-5xl items-start justify-center">
        <div className="rounded-[1.6rem] border border-border-soft bg-white/92 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <SignUp
            fallbackRedirectUrl="/dashboard"
            forceRedirectUrl="/dashboard"
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
          />
        </div>
      </section>
    </main>
  );
}
