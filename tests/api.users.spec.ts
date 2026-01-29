import { test, expect } from "@playwright/test";

type User = {
  id: number;
  name: string;
  username: string;
  email: string;
};

function isUser(u: any): u is User {
  return (
    u &&
    typeof u.id === "number" &&
    typeof u.name === "string" &&
    typeof u.username === "string" &&
    typeof u.email === "string"
  );
}

test.describe("API: Users (JSONPlaceholder)", () => {
  test("GET /users returns valid contract and headers", async ({ request }) => {
    const start = Date.now();
    const res = await request.get("https://jsonplaceholder.typicode.com/users");
    const durationMs = Date.now() - start;

    // status
    expect(res.status()).toBe(200);

    // headers
    const contentType = res.headers()["content-type"] || "";
    expect(contentType).toContain("application/json");

    // performance (sanity, not a benchmark)
    expect(durationMs).toBeLessThan(1500);

    // contract-ish checks
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);

    // validate first 3 items (enough for signal)
    for (const u of body.slice(0, 3)) {
      expect(isUser(u)).toBeTruthy();
    }
  });

  test("GET /users/1 returns a single user with stable fields", async ({ request }) => {
    const res = await request.get("https://jsonplaceholder.typicode.com/users/1");
    expect(res.status()).toBe(200);

    const user = await res.json();
    expect(isUser(user)).toBeTruthy();
    expect(user.id).toBe(1);
  });

  test("Negative: invalid endpoint returns 404", async ({ request }) => {
    const res = await request.get("https://jsonplaceholder.typicode.com/userss"); // typo intentional
    expect(res.status()).toBe(404);
  });
});
