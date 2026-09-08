import { describe, it, expect } from "vitest";
import * as Y from "yjs";
import { wordCount, getChangeSummary } from "../utils/document.js";

// Helper to create a Yjs doc with XML content
const createDocWithContent = (content: string): Y.Doc => {
  const doc = new Y.Doc();
  const fragment = doc.getXmlFragment("default");
  const element = new Y.XmlElement("paragraph");
  element.insert(0, [new Y.XmlText(content)]);
  fragment.insert(0, [element]);
  return doc;
};

describe("wordCount", () => {
  it("counts words in plain text", () => {
    expect(wordCount("hello world")).toBe(2);
  });

  it("counts single word", () => {
    expect(wordCount("hello")).toBe(1);
  });

  it("returns 0 for empty string", () => {
    expect(wordCount("")).toBe(0);
  });

  it("returns 0 for whitespace only", () => {
    expect(wordCount("   ")).toBe(0);
  });

  it("strips HTML tags before counting", () => {
    expect(wordCount("<p>hello world</p>")).toBe(2);
  });

  it("strips nested HTML tags", () => {
    expect(wordCount("<p><strong>hello</strong> <em>world</em></p>")).toBe(2);
  });

  it("handles multiple spaces between words", () => {
    expect(wordCount("hello   world")).toBe(2);
  });

  it("handles newlines", () => {
    expect(wordCount("hello\nworld")).toBe(2);
  });

  it("handles tabs", () => {
    expect(wordCount("hello\tworld")).toBe(2);
  });

  it("counts many words", () => {
    expect(wordCount("one two three four five")).toBe(5);
  });

  it("counts punctuation-only content as a single word", () => {
    // pins current behavior: no whitespace to split on, so this counts as 1
    expect(wordCount("...")).toBe(1);
  });
});

describe("getChangeSummary", () => {
  it("returns Initial version when prevDoc is null", () => {
    const currDoc = createDocWithContent("hello world");
    expect(getChangeSummary(null, currDoc)).toBe("Initial version");
  });

  it("returns words added when content increases", () => {
    const prevDoc = createDocWithContent("hello");
    const currDoc = createDocWithContent("hello world foo");
    expect(getChangeSummary(prevDoc, currDoc)).toBe("+2 words added");
  });

  it("returns words removed when content decreases", () => {
    const prevDoc = createDocWithContent("hello world foo");
    const currDoc = createDocWithContent("hello");
    expect(getChangeSummary(prevDoc, currDoc)).toBe("2 words removed");
  });

  it("returns Minor edits when word count is same but content differs", () => {
    const prevDoc = createDocWithContent("hello world");
    const currDoc = createDocWithContent("foo bar");
    expect(getChangeSummary(prevDoc, currDoc)).toBe("Minor edits");
  });

  it("returns No changes when content is identical", () => {
    const prevDoc = createDocWithContent("hello world");
    const currDoc = createDocWithContent("hello world");
    expect(getChangeSummary(prevDoc, currDoc)).toBe("No changes");
  });

  it("returns Initial version for empty prev and curr", () => {
    const currDoc = new Y.Doc();
    expect(getChangeSummary(null, currDoc)).toBe("Initial version");
  });
});
