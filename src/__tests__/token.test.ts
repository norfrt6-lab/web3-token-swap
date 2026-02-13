import { describe, it, expect } from "vitest";
import { fetchTokenMetadata } from "@/services/token";

describe("fetchTokenMetadata", () => {
  it("throws on invalid address format", async () => {
    await expect(fetchTokenMetadata("0xINVALID")).rejects.toThrow("Invalid ERC-20 address");
  });

  it("throws on empty address", async () => {
    await expect(fetchTokenMetadata("")).rejects.toThrow("Invalid ERC-20 address");
  });

  it("throws on short address", async () => {
    await expect(fetchTokenMetadata("0x1234")).rejects.toThrow("Invalid ERC-20 address");
  });
});
