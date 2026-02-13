import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock ethers at the module level before the route imports it.
// The route does `new ethers.Contract(...)`, so we need Contract
// to be a constructor that returns our mock methods.
const mockContract = {
  name: vi.fn().mockResolvedValue("Chainlink Token"),
  symbol: vi.fn().mockResolvedValue("LINK"),
  decimals: vi.fn().mockResolvedValue(BigInt(18)),
};

vi.mock("ethers", () => ({
  ethers: {
    JsonRpcProvider: class MockProvider {},
    Contract: class MockContract {
      constructor() {
        return mockContract;
      }
    },
  },
}));

import { GET } from "@/app/api/token-metadata/route";

function makeRequest(query: string): NextRequest {
  return new NextRequest(`http://localhost:3000/api/token-metadata${query}`);
}

describe("GET /api/token-metadata", () => {
  beforeEach(() => {
    vi.stubEnv("SEPOLIA_RPC_URL", "https://fake-rpc.test");
    mockContract.name.mockResolvedValue("Chainlink Token");
    mockContract.symbol.mockResolvedValue("LINK");
    mockContract.decimals.mockResolvedValue(BigInt(18));
  });

  it("returns 400 when address param is missing", async () => {
    const res = await GET(makeRequest(""));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/missing or invalid/i);
  });

  it("returns 400 for an invalid address", async () => {
    const res = await GET(makeRequest("?address=0xINVALID"));
    expect(res.status).toBe(400);
  });

  it("returns 400 for XSS payload", async () => {
    const res = await GET(makeRequest("?address=<script>alert(1)</script>"));
    expect(res.status).toBe(400);
  });

  it("returns 200 with token metadata for a valid address", async () => {
    const res = await GET(makeRequest("?address=0x779877A7B0D9E8603169DdbD7836e478b4624789"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toEqual({
      address: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
      name: "Chainlink Token",
      symbol: "LINK",
      decimals: 18,
    });
  });

  it("includes X-RateLimit-Remaining header on success", async () => {
    const res = await GET(makeRequest("?address=0x779877A7B0D9E8603169DdbD7836e478b4624789"));
    expect(res.headers.get("X-RateLimit-Remaining")).toBeTruthy();
  });

  it("returns 500 when SEPOLIA_RPC_URL is not set", async () => {
    vi.stubEnv("SEPOLIA_RPC_URL", "");
    const res = await GET(makeRequest("?address=0x779877A7B0D9E8603169DdbD7836e478b4624789"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/not configured/i);
  });

  it("returns 422 when contract call fails", async () => {
    mockContract.name.mockRejectedValueOnce(new Error("call revert"));

    const res = await GET(makeRequest("?address=0x779877A7B0D9E8603169DdbD7836e478b4624789"));
    expect(res.status).toBe(422);
  });
});
