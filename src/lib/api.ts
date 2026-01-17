import { NextResponse } from 'next/server';

type ErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

export const jsonOk = <T>(data: T, init?: ResponseInit) => {
  return NextResponse.json({ ok: true, data }, init);
};

export const jsonError = (
  code: string,
  message: string,
  status: number,
  details?: unknown
) => {
  const payload: { ok: false; error: ErrorPayload } = {
    ok: false,
    error: { code, message, details }
  };
  return NextResponse.json(payload, { status });
};
