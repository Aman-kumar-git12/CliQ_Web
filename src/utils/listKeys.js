// @ts-check
/**
 * Stable React keys for a list of plain strings that may repeat (e.g. user-typed skills).
 * The key is the text plus how many times that text appeared before it ("React", "React#2"),
 * so editing or removing one item doesn't shift the keys of the others the way an index would.
 *
 * @param {string[]} items
 * @returns {{ value: string, key: string }[]}
 */
export const withStableKeys = (items = []) => {
    const seen = new Map();
    return items.map((value) => {
        const text = String(value);
        const count = (seen.get(text) || 0) + 1;
        seen.set(text, count);
        return { value, key: count === 1 ? text : `${text}#${count}` };
    });
};
