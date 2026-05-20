# WeekendWanderer Project Plan

## Product Goal
Build a web app that helps foreigners living in Europe plan budget-friendly weekend trips from a starting city. A user enters where they are, the dates they are free, and a rough budget. The app returns a small set of curated itinerary options with estimated trip cost, a short explanation of why each trip is worth taking, and outbound booking links.

## MVP Definition
The Week 5 version should do the following well:

1. Accept trip inputs:
   - starting city
   - departure date
   - return date
   - approximate budget
2. Generate 3 to 4 weekend trip options with:
   - destination city
   - short pitch
   - travel time estimate
   - estimated cost range
   - suggested hostel booking source
   - train booking link
   - hostel booking link
3. Let authenticated users save generated trips.
4. Let authenticated users view and delete saved trips from a dashboard.
5. Clearly label all pricing and itinerary content as estimated, not guaranteed live pricing.

## What To Cut From V1
These ideas are useful, but they should not be part of the first build:

- public sharing
- community notes
- social graph or campus network features
- actual post-trip budget tracking
- multi-city routes
- deep personalization beyond one or two simple preferences
- real-time booking inventory

The main risk in this product is overbuilding around a weak core value proposition. V1 needs to prove that the generated weekend options feel faster, more relevant, and more actionable than a generic AI chat prompt.

## Product Principles
The app should optimize for:

- speed to first useful itinerary
- clarity for users unfamiliar with European travel tools
- realistic weekend scope
- low planning friction
- strong handoff to booking sites

The app should avoid:

- pretending to provide live prices when it does not
- forcing users to make too many choices before seeing value
- generating vague itineraries that read like generic travel blog copy

## Recommended MVP User Flow
1. User lands on the homepage.
2. User sees a simple planner form.
3. User enters:
   - current city
   - trip dates
   - budget
   - optional vibe preference
4. User submits and waits for curated recommendations.
5. App returns 3 to 4 itinerary cards.
6. If signed in, user can save a card.
7. User visits dashboard to review or remove saved trips.

## Functional Requirements

### 1. Trip Generation
Input:
- origin city
- departure date
- return date
- budget tier or numeric budget
- optional preference such as `culture`, `nightlife`, `nature`, or `balanced`

Output per itinerary:
- destination city and country
- one-paragraph summary
- why it fits the weekend
- estimated total budget range
- estimated transit time
- suggested transport mode
- suggested hostel area or accommodation note
- booking links

### 2. Saved Trips
Authenticated users can:
- save a generated trip
- view all saved trips
- delete a saved trip

### 3. Booking Links
Each itinerary should provide:
- a transport link, likely Omio
- an accommodation link, likely Booking.com or Hostelworld

For MVP, provider links should be labeled as search handoffs unless they come from an official provider-backed integration. Do not present handcrafted URLs as guaranteed bookable itineraries.

## Technical Architecture

### Frontend
- Next.js App Router
- Tailwind CSS
- Server Actions or route handlers for trip generation and saved-trip mutations

### Auth
- Clerk for sign-in, sign-up, and user identity

### Database
- Supabase Postgres for persisted saved trips

### Recommendation Layer
- rules-based destination scoring and itinerary generation in app code

### Travel Context
- Rome2Rio for route duration and transport context
- Booking links and transport links should move toward provider-backed integrations. Until then, the UI should clearly label them as search-only handoffs.

## Recommended App Structure

### Public Routes
- `/`
  - landing page
  - planner form
  - generated itinerary results

### Authenticated Routes
- `/dashboard`
  - saved trips list

### API / Server Boundaries
- `POST /api/generate-trip-options`
  - validate input
  - rank destinations using app heuristics
  - generate structured itinerary cards
  - return structured itinerary data
- `POST /api/saved-trips`
  - save itinerary for authenticated user
- `DELETE /api/saved-trips/:id`
  - remove saved itinerary
- `GET /api/saved-trips`
  - fetch saved itineraries for dashboard

## Suggested Database Schema

### `saved_trips`
- `id` uuid primary key
- `user_id` text not null
- `origin_city` text not null
- `destination_city` text not null
- `destination_country` text
- `departure_date` date not null
- `return_date` date not null
- `budget_input` integer
- `preference` text
- `summary` text not null
- `why_visit` text
- `travel_time_text` text
- `estimated_cost_min` integer
- `estimated_cost_max` integer
- `transport_mode` text
- `transport_link` text
- `stay_link` text
- `stay_provider` text
- `raw_itinerary_json` jsonb
- `created_at` timestamp with time zone default now()

Notes:
- keep `raw_itinerary_json` so prompt output can evolve without immediate schema churn
- do not store secrets or third-party tokens in Supabase rows

## Data Contracts

### Trip Generation Request
```ts
type GenerateTripRequest = {
  originCity: string;
  departureDate: string;
  returnDate: string;
  budgetEuros: number;
  preference?: "culture" | "nightlife" | "nature" | "balanced";
};
```

### Trip Generation Response
```ts
type TripOption = {
  destinationCity: string;
  destinationCountry: string;
  summary: string;
  whyVisit: string;
  travelTimeText: string;
  estimatedCostMin: number;
  estimatedCostMax: number;
  transportMode: string;
  transportLink: string | null;
  transportLinkStatus: "verified" | "search_only" | "unavailable";
  stayProvider: string;
  stayLink: string | null;
  stayLinkStatus: "verified" | "search_only" | "unavailable";
  disclaimer: string;
};
```

## Recommendation Strategy
V1 should use a deterministic recommendation engine instead of an external model.

The engine should:
- score destinations by vibe match
- score destinations by budget fit
- prefer weekend-friendly transit times
- return structured itinerary cards from reusable templates

This keeps the MVP reliable, fast, and demo-safe without external API dependency.

## Critical UX Decisions

### 1. Be Honest About Estimates
Use a visible note such as:
"Prices are estimated ranges and may change based on availability and booking time."

### 2. Keep Results Narrow
Three or four strong options is better than ten weak ones.

### 3. Explain Why A Destination Fits
Each card should answer:
- why this place works for this weekend
- why it fits the budget
- what kind of experience the user should expect

### 4. Do Not Block Value Behind Auth
Users should be able to generate trip options before signing in. Auth should be required only for saving.

## Biggest Build Risks And Mitigations

### Risk: Feels too templated
Mitigation:
- expand the curated destination dataset
- tune ranking heuristics for stronger budget and vibe matching
- design the UI around actionability, not chat

### Risk: Link generation is messy
Mitigation:
- mark handcrafted links as search-only until provider-backed APIs are in place
- avoid promising full deep-link precision
- store provider metadata separately so link logic can be upgraded later

### Risk: Recommendations feel thin
Mitigation:
- enrich destination data with stronger summaries and tags
- add route context later with Rome2Rio
- keep output narrow and specific

### Risk: Price trust is weak
Mitigation:
- frame prices as rough estimates everywhere
- keep cost ranges broad rather than fake precision

## Week-By-Week Build Order

### Phase 1: Scaffold
- initialize Next.js app with TypeScript and Tailwind
- add Clerk
- add base layout and landing page shell
- set up environment variable handling

### Phase 2: Core Planner UI
- build planner form
- add client-side validation
- add loading and error states
- create itinerary card component

### Phase 3: Recommendation Engine
- implement generation route
- define scoring logic and structured response shape
- expand curated destination data
- mock travel links first, then refine

### Phase 4: Travel Context
- integrate Rome2Rio
- feed route summaries into prompt
- add resilient fallback behavior

### Phase 5: Persistence
- configure Supabase
- add `saved_trips` table
- implement save, list, and delete flows
- build dashboard page

### Phase 6: Polish
- add disclaimers
- improve empty states
- refine card layout and mobile UX
- verify auth edge cases

## First Milestone Recommendation
The best first milestone is not full persistence. It is this:

"A user can open the app, fill out the planner form, and receive three structured itinerary cards generated from real input."

That milestone proves the product thesis. After that, auth and saved trips become straightforward productization work.

## Concrete Build Sequence
1. Create the Next.js app.
2. Build the homepage planner form and mocked results UI.
3. Implement the trip-generation API with mocked response shape.
4. Expand the rules-based generator into a stronger recommendation engine.
5. Add Rome2Rio enrichment.
6. Add Clerk auth.
7. Add Supabase saved trips.
8. Build the dashboard.

## Decisions To Lock Early
- Use numeric budget input in euros for v1.
- Support one optional preference field only.
- Generate trips without requiring sign-in.
- Store saved itineraries as generated snapshots, not recomputed records.
- Treat booking links as outbound search links, not guaranteed deep links.

## Immediate Next Step
Strengthen the rules-based recommendation engine with more destinations, better ranking signals, and clearer trip rationale.
