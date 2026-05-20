import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth-config";

export function AppProviders({ children }: { children: ReactNode }) {
  if (!isClerkConfigured()) {
    return <>{children}</>;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}
