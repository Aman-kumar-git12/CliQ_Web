import { test, expect, mockApi, makeMessage, ME, FRIEND } from "./support/mockApi";

// Messages are sent over Socket.IO, which has no server in these tests: the history comes from the mocked
// REST API and a sent message is checked in its optimistic (not yet acknowledged) state.
test("opening a chat shows its history and a sent message appears", async ({ page }) => {
    await mockApi(page, {
        loggedIn: true,
        chatHistory: [
            makeMessage(FRIEND, "Are you joining the hackathon?", 10),
            makeMessage(ME, "Yes, count me in", 8),
        ],
    });

    await page.goto("/messages");
    await page.getByText(`${FRIEND.firstname} ${FRIEND.lastname}`).first().click();
    await expect(page).toHaveURL(new RegExp(`/messages/${FRIEND.id}`));

    await expect(page.getByText("Are you joining the hackathon?")).toBeVisible();
    // The last message shows twice: as the inbox preview and as a bubble in the thread
    await expect(page.getByText("Yes, count me in")).toHaveCount(2);

    const composer = page.getByRole("textbox", { name: "Type a message" });
    await composer.fill("See you there!");
    await composer.press("Enter");

    await expect(page.getByText("See you there!")).toBeVisible();
    await expect(composer).toHaveValue("");
});
