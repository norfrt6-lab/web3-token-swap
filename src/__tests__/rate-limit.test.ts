import { describe, it, expect, beforeEach, vi } from "vitest";
import { isRateLimited } from "@/lib/rate-limit";

describe("isRateLimited", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  const config = { windowMs: 1000, maxRequests: 3 };

  it("allows requests under the limit", () => {
    const r1 = isRateLimited("user-1", config);
    expect(r1.limited).toBe(false);
    expect(r1.remaining).toBe(2);
  });

  it("blocks after exceeding the limit", () => {
    isRateLimited("user-2", config);
    isRateLimited("user-2", config);
    isRateLimited("user-2", config);

    const r4 = isRateLimited("user-2", config);
    expect(r4.limited).toBe(true);
    expect(r4.remaining).toBe(0);
  });

  it("resets after the window expires", () => {
    isRateLimited("user-3", config);
    isRateLimited("user-3", config);
    isRateLimited("user-3", config);

    // Advance time past the window
    vi.advanceTimersByTime(1100);

    const r = isRateLimited("user-3", config);
    expect(r.limited).toBe(false);
    expect(r.remaining).toBe(2);
  });

  it("isolates different keys", () => {
    isRateLimited("user-A", config);
    isRateLimited("user-A", config);
    isRateLimited("user-A", config);

    const rB = isRateLimited("user-B", config);
    expect(rB.limited).toBe(false);
  });
});
