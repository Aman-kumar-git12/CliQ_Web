import { test, expect, mockApi } from "./support/mockApi";

test("an unknown URL shows the 404 page", async ({ page }) => {
    await mockApi(page, { loggedIn: true });
    await page.goto("/this/page/does-not-exist");

    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await expect(page.getByText("/this/page/does-not-exist")).toBeVisible();
    await page.getByRole("link", { name: "Go to Feed" }).click();
    await expect(page).toHaveURL(/\/home$/);
});

test("the legal pages are public and linked from the login page", async ({ page }) => {
    await mockApi(page);
    await page.goto("/login");

    await page.getByRole("link", { name: "Privacy Policy" }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeVisible();

    await page.getByRole("link", { name: "Terms of Service" }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: "Terms of Service" })).toBeVisible();
});
