// Counts words in plain text or rich-editor HTML. Splits on whitespace, which
// also works for Greek and other space-separated scripts.
export function countWords(value: string, isHtml = false): number {
  const text = isHtml
    ? value
        .replace(/<\/(p|h[1-6]|li|blockquote|ul|ol)>/gi, " ")
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
    : value;
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
