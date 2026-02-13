import { describe, it, expect } from "vitest";
import { isValidAddress, isValidAmount, sanitizeAmount, truncateAddress } from "@/lib/validation";

describe("isValidAddress", () => {
  it("accepts a valid checksummed address", () => {
    expect(isValidAddress("0x779877A7B0D9E8603169DdbD7836e478b4624789")).toBe(true);
  });

  it("accepts a lowercase address", () => {
    expect(isValidAddress("0x779877a7b0d9e8603169ddbd7836e478b4624789")).toBe(true);
  });

  it("rejects missing 0x prefix", () => {
    expect(isValidAddress("779877A7B0D9E8603169DdbD7836e478b4624789")).toBe(false);
  });

  it("rejects too-short address", () => {
    expect(isValidAddress("0x1234")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidAddress("")).toBe(false);
  });

  it("rejects non-hex characters", () => {
    expect(isValidAddress("0xZZZZ77A7B0D9E8603169DdbD7836e478b4624789")).toBe(false);
  });

  it("rejects injection attempts", () => {
    expect(isValidAddress("0x' OR 1=1 --")).toBe(false);
    expect(isValidAddress("<script>alert(1)</script>")).toBe(false);
  });
});

describe("isValidAmount", () => {
  it("accepts a simple decimal", () => {
    expect(isValidAmount("1.5", 18)).toBe(true);
  });

  it("accepts an integer", () => {
    expect(isValidAmount("100", 18)).toBe(true);
  });

  it("accepts amount with exact decimal precision", () => {
    expect(isValidAmount("1.123456", 6)).toBe(true);
  });

  it("rejects zero", () => {
    expect(isValidAmount("0", 18)).toBe(false);
  });

  it("rejects negative numbers", () => {
    expect(isValidAmount("-5", 18)).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidAmount("", 18)).toBe(false);
  });

  it("rejects non-numeric input", () => {
    expect(isValidAmount("abc", 18)).toBe(false);
  });

  it("rejects too many decimal places", () => {
    expect(isValidAmount("1.1234567", 6)).toBe(false);
  });

  it("rejects double decimal point", () => {
    expect(isValidAmount("1.2.3", 18)).toBe(false);
  });

  it("rejects whitespace-only", () => {
    expect(isValidAmount("   ", 18)).toBe(false);
  });
});

describe("sanitizeAmount", () => {
  it("strips alphabetic characters", () => {
    expect(sanitizeAmount("12abc34")).toBe("1234");
  });

  it("preserves valid decimal", () => {
    expect(sanitizeAmount("1.5")).toBe("1.5");
  });

  it("removes second decimal point", () => {
    expect(sanitizeAmount("1.2.3")).toBe("1.23");
  });

  it("strips special characters", () => {
    expect(sanitizeAmount("1<script>")).toBe("1");
  });

  it("handles empty string", () => {
    expect(sanitizeAmount("")).toBe("");
  });

  it("strips leading non-numeric except for digits", () => {
    expect(sanitizeAmount("$100.50")).toBe("100.50");
  });
});

describe("truncateAddress", () => {
  it("truncates a valid address", () => {
    expect(truncateAddress("0x779877A7B0D9E8603169DdbD7836e478b4624789")).toBe("0x7798...4789");
  });

  it("returns input unchanged for invalid address", () => {
    expect(truncateAddress("not-an-address")).toBe("not-an-address");
  });
});
