import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { ERC20_ABI } from "@/constants";
import { isValidAddress } from "@/lib/validation";
import { isRateLimited } from "@/lib/rate-limit";

const RATE_LIMIT = { windowMs: 60_000, maxRequests: 30 };

/**
 * GET /api/token-metadata?address=0x...
 *
 * Server-side endpoint that fetches ERC-20 metadata using the
 * private RPC key so it never leaks to the client bundle.
 */
export async function GET(request: NextRequest) {
  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const { limited, remaining } = isRateLimited(ip, RATE_LIMIT);

  if (limited) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": "60", "X-RateLimit-Remaining": "0" },
      },
    );
  }

  const address = request.nextUrl.searchParams.get("address");

  if (!address || !isValidAddress(address)) {
    return NextResponse.json(
      { error: "Missing or invalid token address" },
      { status: 400 },
    );
  }

  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  if (!rpcUrl) {
    return NextResponse.json(
      { error: "Server RPC not configured" },
      { status: 500 },
    );
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(address, ERC20_ABI, provider);

    const [name, symbol, decimals] = await Promise.all([
      contract.name() as Promise<string>,
      contract.symbol() as Promise<string>,
      contract.decimals() as Promise<bigint>,
    ]);

    return NextResponse.json(
      { address, name, symbol, decimals: Number(decimals) },
      { headers: { "X-RateLimit-Remaining": String(remaining) } },
    );
  } catch {
    return NextResponse.json(
      { error: `Failed to fetch metadata for ${address}. Ensure the address is a valid ERC-20 on Sepolia.` },
      { status: 422 },
    );
  }
}
