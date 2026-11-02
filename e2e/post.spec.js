import { test, expect, mockApi, makePost, FRIEND } from "./support/mockApi";

test("a new text post appears in the feed", async ({ page }) => {
    await mockApi(page, { loggedIn: true, posts: [makePost(FRIEND, "Hello from Rohan")] });
    await page.goto("/home");
    await expect(page.getByText("Hello from Rohan")).toBeVisible();

    const text = `Looking for a React mentor ${Date.now()}`;
    await page.getByRole("textbox", { name: "Write a post" }).fill(text);
    await page.getByRole("button", { name: "Post Now" }).click();

    await expect(page.getByText(text)).toBeVisible();
    // The composer clears once the post is saved
    await expect(page.getByRole("textbox", { name: "Write a post" })).toHaveValue("");
});
