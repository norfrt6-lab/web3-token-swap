import { test, expect } from "@playwright/test";

test.describe("Token Swap — smoke tests", () => {
  test("page loads with header and connect button", async ({ page }) => {
    await page.goto("/");

    // Header renders
    await expect(page.locator("h1")).toContainText("TokenSwap");

    // Connect button or install link is visible
    const connectBtn = page.getByRole("button", { name: /connect metamask/i });
    const installLink = page.getByRole("button", { name: /install metamask/i });
    const hasConnect = await connectBtn.isVisible().catch(() => false);
    const hasInstall = await installLink.isVisible().catch(() => false);
    expect(hasConnect || hasInstall).toBe(true);
  });

  test("shows wallet prompt when not connected", async ({ page }) => {
    await page.goto("/");

    // The swap form should show the "connect wallet" message
    await expect(page.getByText(/connect your wallet/i)).toBeVisible();
  });

  test("footer shows Sepolia testnet", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/sepolia testnet/i)).toBeVisible();
  });

  test("API returns 400 for missing address", async ({ request }) => {
    const res = await request.get("/api/token-metadata");
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test("API returns 400 for invalid address", async ({ request }) => {
    const res = await request.get("/api/token-metadata?address=0xBAD");
    expect(res.status()).toBe(400);
  });
});
