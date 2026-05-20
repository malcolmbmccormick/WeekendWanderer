import { NextResponse } from "next/server";
import {
  buildTripOptionFromDraft,
  generateTripOptions,
  parseGeneratedTripDrafts,
  type GenerateTripRequest,
  validateGenerateTripRequest,
} from "@/lib/trips";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = validateGenerateTripRequest(body);
    const result = await generateTripOptionsWithFallback(input);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate trip options.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

async function generateTripOptionsWithFallback(input: GenerateTripRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    await sleep(350);
    return generateTripOptions(input);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: buildSystemPrompt(),
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: buildUserPrompt(input),
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "weekend_trip_options",
            strict: true,
            schema: tripOptionsSchema,
          },
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as {
      output_text?: string;
      output?: Array<{
        content?: Array<{ type?: string; text?: string; refusal?: string }>;
      }>;
      model?: string;
    };

    const structuredText = extractStructuredText(payload);

    if (!structuredText) {
      throw new Error("OpenAI returned an empty structured response.");
    }

    const drafts = parseGeneratedTripDrafts(JSON.parse(structuredText));

    return {
      options: drafts.map((draft) => buildTripOptionFromDraft(draft, input)),
      meta: {
        generatedAt: new Date().toISOString(),
        source: "openai" as const,
        model: payload.model ?? model,
        bookingLinkPolicy: "provider_search_only" as const,
      },
    };
  } catch (error) {
    console.error("OpenAI generation failed, using rules fallback.", error);
    await sleep(200);
    return generateTripOptions(input);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractStructuredText(payload: {
  output_text?: string;
  output?: Array<{
    content?: Array<{ type?: string; text?: string; refusal?: string }>;
  }>;
}): string {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const outputText = payload.output
    ?.flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text" && typeof content.text === "string")
    .map((content) => content.text)
    .join("\n")
    .trim();

  if (outputText) {
    return outputText;
  }

  const refusal = payload.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === "refusal" && typeof content.refusal === "string");

  if (refusal?.refusal) {
    throw new Error(refusal.refusal);
  }

  return "";
}

function buildSystemPrompt(): string {
  return [
    "You are a weekend trip planning assistant for students and young professionals living in Europe.",
    "Recommend realistic, budget-conscious trips with practical transit assumptions.",
    "Do not claim live prices or real-time availability.",
    "Keep outputs concise, useful, and specific.",
    "Return exactly 3 options in the required schema.",
  ].join(" ");
}

function buildUserPrompt(input: GenerateTripRequest): string {
  return [
    "Generate three weekend trip options.",
    `Origin city: ${input.originCity}.`,
    `Departure date: ${input.departureDate}.`,
    `Return date: ${input.returnDate}.`,
    `Budget in euros: ${input.budgetEuros}.`,
    `Travel preference: ${input.preference}.`,
    "Each option should feel distinct and weekend-practical.",
    "Use short highlights and a realistic sample plan.",
  ].join(" ");
}

const tripOptionsSchema = {
  type: "object",
  additionalProperties: false,
  required: ["options"],
  properties: {
    options: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "destinationCity",
          "destinationCountry",
          "summary",
          "whyVisit",
          "highlights",
          "samplePlan",
          "travelTimeText",
          "estimatedCostMin",
          "estimatedCostMax",
          "transportMode",
          "stayProvider",
          "vibeLabel",
        ],
        properties: {
          destinationCity: { type: "string" },
          destinationCountry: { type: "string" },
          summary: { type: "string" },
          whyVisit: { type: "string" },
          highlights: {
            type: "array",
            items: { type: "string" },
          },
          samplePlan: { type: "string" },
          travelTimeText: { type: "string" },
          estimatedCostMin: { type: "number" },
          estimatedCostMax: { type: "number" },
          transportMode: { type: "string" },
          stayProvider: { type: "string" },
          vibeLabel: { type: "string" },
        },
      },
    },
  },
} as const;
