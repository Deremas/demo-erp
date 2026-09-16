import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseFilterList(value: string | null | undefined): string[] | undefined {
  if (!value) return undefined;
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

export function formatCurrency(value: number | string) {
  const amount = Number(value);
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  return `ETB ${safeAmount.toLocaleString("en-ET", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatUsd(value: number | string) {
  const amount = Number(value);
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  return `$ ${safeAmount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(value: Date | string, token = "dd MMM yyyy") {
  return format(new Date(value), token);
}

export function formatDateTime(value: Date | string) {
  return format(new Date(value), "dd MMM yyyy, HH:mm");
}

export function formatDateForInput(date: Date | string = new Date()) {
  return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function formatCustomerName(customer: { name: string; businessName?: string | null }) {
  if (!customer.businessName) return customer.name;
  return `${customer.name} / ${customer.businessName}`;
}

export function numberToWords(num: number): string {
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const scales = ["", "Thousand", "Million", "Billion"];

  if (num === 0) return "Zero";

  function convertChunk(n: number): string {
    let s = "";
    if (n >= 100) {
      s += units[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      s += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      s += units[n] + " ";
    }
    return s.trim();
  }

  const parts = [];
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let tempInt = integerPart;
  let scaleIdx = 0;
  while (tempInt > 0) {
    const chunk = tempInt % 1000;
    if (chunk > 0) {
      parts.unshift(convertChunk(chunk) + (scales[scaleIdx] ? " " + scales[scaleIdx] : ""));
    }
    tempInt = Math.floor(tempInt / 1000);
    scaleIdx++;
  }

  let result = parts.join(" ") + " Birr";
  if (decimalPart > 0) {
    result += " and " + convertChunk(decimalPart) + " Cents";
  } else {
    result += " and Zero Cents";
  }

  return result.trim() + " Only";
}