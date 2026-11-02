import { test, expect, mockApi, makePost, ME, FRIEND, VALID_PASSWORD } from "./support/mockApi";

test.describe("login", () => {
    test("a wrong password shows the server's error and stays on the login page", async ({ page }) => {
        await mockApi(page);
        await page.goto("/login");

        await page.getByLabel("Email").fill(ME.email);
        await page.getByLabel("Password", { exact: true }).fill("not-the-password");
        await page.getByRole("button", { name: "Login", exact: true }).click();

        await expect(page.getByText("Invalid credentials")).toBeVisible();
        await expect(page).toHaveURL(/\/login$/);
    });

    test("valid credentials land on the feed", async ({ page }) => {
        await mockApi(page, { posts: [makePost(FRIEND, "Shipping our first public beta today!")] });
        await page.goto("/login");

        await page.getByLabel("Email").fill(ME.email);
        await page.getByLabel("Password", { exact: true }).fill(VALID_PASSWORD);
        await page.getByRole("button", { name: "Login", exact: true }).click();

        await expect(page).toHaveURL(/\/home$/);
        await expect(page.getByText("Shipping our first public beta today!")).toBeVisible();
    });
});
