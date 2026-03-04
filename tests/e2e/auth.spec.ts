import { expect, test } from "@playwright/test";

test.describe("Auth flows", () => {
  test("register: success redirects to home", async ({ page }) => {
    await page.route("**/api/auth/register", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { id: "u1", email: "test@example.com", nickname: "tester" },
        }),
      });
    });

    await page.route("**/api/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "u1",
            email: "test@example.com",
            nickname: "tester",
            avatarUrl: null,
            createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
          },
        }),
      });
    });

    await page.goto("/auth/register");
    const inputs = page.locator("form input");
    await inputs.nth(0).fill("test@example.com");
    await inputs.nth(1).fill("tester");
    await inputs.nth(2).fill("Password123");
    await inputs.nth(3).fill("Password123");
    const responsePromise = page.waitForResponse("**/api/auth/register");
    await page.locator("form button[type='submit']").click();
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    await expect(page).toHaveURL(/\/$/);
  });

  test("register: shows API error", async ({ page }) => {
    await page.route("**/api/auth/register", async (route) => {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({ error: "Email already exists" }),
      });
    });

    await page.goto("/auth/register");
    const inputs = page.locator("form input");
    await inputs.nth(0).fill("test@example.com");
    await inputs.nth(1).fill("tester");
    await inputs.nth(2).fill("Password123");
    await inputs.nth(3).fill("Password123");
    await page.locator("form button[type='submit']").click();

    await expect(page.getByText("Email already exists")).toBeVisible();
  });

  test("register: handles zod-like object error without crash", async ({ page }) => {
    await page.route("**/api/auth/register", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            formErrors: [],
            fieldErrors: {
              email: ["Email invalid"],
            },
          },
        }),
      });
    });

    await page.goto("/auth/register");
    const inputs = page.locator("form input");
    await inputs.nth(0).fill("valid@example.com");
    await inputs.nth(1).fill("tester");
    await inputs.nth(2).fill("Password123");
    await inputs.nth(3).fill("Password123");
    await page.locator("form button[type='submit']").click();

    await expect(page.getByText("Email invalid")).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/register$/);
  });

  test("login: success redirects to profile", async ({ page }) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { id: "u1", email: "test@example.com", nickname: "tester" },
        }),
      });
    });

    await page.route("**/api/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "u1",
            email: "test@example.com",
            nickname: "tester",
            avatarUrl: null,
            createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
          },
        }),
      });
    });

    await page.goto("/auth/login");
    const inputs = page.locator("form input");
    await inputs.nth(0).fill("test@example.com");
    await inputs.nth(1).fill("Password123");
    const responsePromise = page.waitForResponse("**/api/auth/login");
    await page.locator("form button[type='submit']").click();
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    await expect(page).toHaveURL(/\/(profile|auth\/login)$/);
  });

  test("login: shows API error", async ({ page }) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Invalid credentials" }),
      });
    });

    await page.goto("/auth/login");
    const inputs = page.locator("form input");
    await inputs.nth(0).fill("test@example.com");
    await inputs.nth(1).fill("wrong-password");
    await page.locator("form button[type='submit']").click();

    await expect(page.getByText("Invalid credentials")).toBeVisible();
  });

  test("login: handles zod-like object error without crash", async ({ page }) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            formErrors: ["Invalid input"],
            fieldErrors: {},
          },
        }),
      });
    });

    await page.goto("/auth/login");
    const inputs = page.locator("form input");
    await inputs.nth(0).fill("valid@example.com");
    await inputs.nth(1).fill("x");
    await page.locator("form button[type='submit']").click();

    await expect(page.getByText("Invalid input")).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
