import { countWords } from "./lib/reading-time";

/** The reading pace used for a lesson's estimate. */
export const WORDS_PER_MINUTE = 200;

/**
 * Whole minutes to read a lesson's Markdown at 200 words a minute, rounded up,
 * never less than one. This always reports a positive duration; ask
 * `hasWrittenContent` whether there is anything to read before showing it.
 */
export function readingTimeMinutes(markdown: string): number {
  return Math.max(1, Math.ceil(countWords(markdown) / WORDS_PER_MINUTE));
}

/** Whether the Markdown holds any words at all. */
export function hasWrittenContent(
  markdown: string | null | undefined
): boolean {
  return countWords(markdown ?? "") > 0;
}
