import type { VercelRequest, VercelResponse } from "@vercel/node";

const UPSTREAM_URL =
  "https://insurance-webhook-945894769129.us-central1.run.app/vehicle-info";

type RequestBody = {
  license_plate?: unknown;
};

function readBody(body: unknown): RequestBody | null {
  let parsed: unknown = body;

  if (typeof body === "string") {
    try {
      parsed = JSON.parse(body);
    } catch {
      return null;
    }
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  return parsed as RequestBody;
}

function normalizeLicensePlate(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  if (typeof value === "number" && Number.isSafeInteger(value)) {
    return String(value);
  }

  return null;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({
      success: false,
      error: "Method not allowed",
    });
    return;
  }

  const body = readBody(request.body);
  const licensePlate = normalizeLicensePlate(body?.license_plate);

  if (licensePlate === null) {
    response.status(400).json({
      success: false,
      error: "license_plate is required",
    });
    return;
  }

  try {
    const upstreamResponse = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ license_plate: licensePlate }),
    });

    if (upstreamResponse.status === 404) {
      response.status(404).json({
        success: false,
        error: "Vehicle not found",
      });
      return;
    }

    if (!upstreamResponse.ok) {
      response.status(502).json({
        success: false,
        error: "Vehicle lookup failed",
      });
      return;
    }

    const data: unknown = await upstreamResponse.json();
    response.status(200).json(data);
  } catch {
    response.status(502).json({
      success: false,
      error: "Vehicle lookup failed",
    });
  }
}
