import { VALIDATION } from "@/constants";

export function isValidAddress(address: string): boolean {
  return VALIDATION.ADDRESS_REGEX.test(address);
}

export function isValidAmount(amount: string, decimals: number): boolean {
  if (!amount || amount.trim() === "") return false;

  const num = Number(amount);
  if (isNaN(num) || num <= 0) return false;

  const parts = amount.split(".");
  if (parts.length > 2) return false;
  if (parts[1] && parts[1].length > decimals) return false;

  return true;
}

export function sanitizeAmount(value: string): string {
  // Allow only digits and a single decimal point
  let sanitized = value.replace(/[^0-9.]/g, "");
  const dotIndex = sanitized.indexOf(".");
  if (dotIndex !== -1) {
    sanitized = sanitized.slice(0, dotIndex + 1) + sanitized.slice(dotIndex + 1).replace(/\./g, "");
  }
  return sanitized;
}

export function truncateAddress(address: string): string {
  if (!isValidAddress(address)) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
