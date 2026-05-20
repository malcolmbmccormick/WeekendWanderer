import { auth } from "@clerk/nextjs/server";
import { PlannerExperience } from "@/components/planner-experience";
import { isClerkConfigured } from "@/lib/auth-config";
import { generateTripOptions, getDefaultTripRequest } from "@/lib/trips";

export default async function Home() {
  const initialRequest = getDefaultTripRequest();
  const initialResults = generateTripOptions(initialRequest);
  const authEnabled = isClerkConfigured();
  const isSignedIn = authEnabled ? Boolean((await auth()).userId) : false;

  return (
    <PlannerExperience
      authEnabled={authEnabled}
      isSignedIn={isSignedIn}
      initialMeta={initialResults.meta}
      initialOptions={initialResults.options}
      initialRequest={initialRequest}
    />
  );
}
