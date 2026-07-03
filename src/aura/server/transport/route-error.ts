import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export function jsonError(args: {
  code: string;
  message: string;
  status: number;
}) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: args.code,
        message: args.message,
        status: args.status,
        requestId: uuidv4(),
      },
    },
    { status: args.status },
  );
}

const CODE_FROM_STATUS: Record<number, string> = {
  403: "FORBIDDEN",
  429: "RATE_LIMITED",
};

export function jsonReject(message: string, status = 403) {
  return jsonError({
    code: CODE_FROM_STATUS[status] ?? "BAD_REQUEST",
    message,
    status,
  });
}
