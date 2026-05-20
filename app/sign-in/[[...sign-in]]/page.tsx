import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
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
