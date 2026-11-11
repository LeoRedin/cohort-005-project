import { describe, it, expect } from "vitest";
import {
  hasWrittenContent,
  readingTimeMinutes,
  WORDS_PER_MINUTE,
} from "../index";

/** `count` words separated by single spaces. */
function words(count: number): string {
  return Array.from({ length: count }, (_, index) => `word${index}`).join(" ");
}

describe("readingTimeMinutes", () => {
  it("returns one minute for empty content", () => {
    expect(readingTimeMinutes("")).toBe(1);
  });

  it("returns one minute for a short text", () => {
    expect(readingTimeMinutes("A short lesson.")).toBe(1);
  });

  it("reads at 200 words a minute", () => {
    expect(WORDS_PER_MINUTE).toBe(200);
    expect(readingTimeMinutes(words(200))).toBe(1);
  });

  it("rounds up to the next whole minute", () => {
    expect(readingTimeMinutes(words(201))).toBe(2);
  });

  it("returns three minutes for 401 words", () => {
    expect(readingTimeMinutes(words(401))).toBe(3);
  });

  it("counts words inside a code block", () => {
    const prose = words(190);
    const code = ["```ts", words(20), "```"].join("\n");

    expect(readingTimeMinutes(prose)).toBe(1);
    expect(readingTimeMinutes(`${prose}\n\n${code}`)).toBe(2);
  });

  it("counts runs of whitespace as one word boundary", () => {
    expect(readingTimeMinutes(`${words(199)}\n\n   last`)).toBe(1);
  });
});

describe("hasWrittenContent", () => {
  it("is false for empty and whitespace-only content", () => {
    expect(hasWrittenContent("")).toBe(false);
    expect(hasWrittenContent("  \n\t ")).toBe(false);
    expect(hasWrittenContent(null)).toBe(false);
    expect(hasWrittenContent(undefined)).toBe(false);
  });

  it("is true when there is a word, including inside a code block", () => {
    expect(hasWrittenContent("Word")).toBe(true);
    expect(hasWrittenContent("```ts\nconst answer = 42;\n```")).toBe(true);
  });
});
