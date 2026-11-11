/**
 * Words in Markdown, counted as runs of non-whitespace. Code blocks are not
 * stripped: the words inside them are part of the lesson and count too.
 */
export function countWords(markdown: string): number {
  const trimmed = markdown.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}
