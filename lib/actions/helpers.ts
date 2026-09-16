import { Prisma } from "../../generated/prisma/client";

export function createDocumentNumber(prefix: string, date: Date = new Date()) {
  const datePart = date.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();

  return `${prefix}-${datePart}-${suffix}`;
}

export function getActionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    const message = error.message.trim();
    const normalized = message.toLowerCase();

    if (
      normalized.includes("connection timeout") ||
      normalized.includes("connection terminated") ||
      normalized.includes("connection terminated unexpectedly") ||
      normalized.includes("can't reach database server") ||
      normalized.includes("timed out")
    ) {
      return "The service is temporarily unavailable right now. Please try again in a moment.";
    }

    return message;
  }

  return fallback;
}

export function normalizeOptionalString(value: string | null | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}

function parseLocalDateTime(value: string) {
  const match = value.trim().match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/,
  );

  if (!match) {
    return null;
  }

  const [
    ,
    year,
    month,
    day,
    hours = "0",
    minutes = "0",
    seconds = "0",
    milliseconds = "0",
  ] = match;

  const parsed = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    Number(seconds),
    Number(milliseconds.padEnd(3, "0")),
  );

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseInputDate(value: string) {
  const localParsed = parseLocalDateTime(value);
  if (localParsed) {
    return localParsed;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function toDecimal(value: number | string) {
  return new Prisma.Decimal(value);
}