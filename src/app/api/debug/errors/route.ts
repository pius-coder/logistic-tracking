import { NextResponse } from "next/server";
import {
  getStoredErrors,
  clearStoredErrors,
} from "@/aura/server/debug-store";

const DEBUG_KEY = process.env.DEBUG_KEY;

export function GET(request: Request) {
  if (!DEBUG_KEY) {
    return NextResponse.json(
      { ok: false, error: "Debug disabled — set DEBUG_KEY env var" },
      { status: 404 },
    );
  }

  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (key !== DEBUG_KEY) {
    return NextResponse.json(
      { ok: false, error: "Invalid or missing key" },
      { status: 403 },
    );
  }

  const clear = url.searchParams.get("clear");
  if (clear === "1") {
    clearStoredErrors();
    return NextResponse.json({ ok: true, cleared: true });
  }

  const errors = getStoredErrors();
  return NextResponse.json({ ok: true, count: errors.length, errors });
}
