/** Async generator that parses a fetch Response body as Server-Sent Events. */

// Reads a Server-Sent Events body. Uses getReader() because Safari can't async-iterate ReadableStream.
export async function* readSseEvents(body) {
    const reader = body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let boundary;
        while ((boundary = buffer.indexOf("\n\n")) !== -1) {
            const rawEvent = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            let event = "message";
            const dataLines = [];
            for (const line of rawEvent.split("\n")) {
                if (line.startsWith("event:")) event = line.slice(6).trim();
                else if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
            }
            if (!dataLines.length) continue;
            try {
                yield { event, data: JSON.parse(dataLines.join("\n")) };
            } catch {
                // skip malformed events
            }
        }
    }
}

export default readSseEvents;
