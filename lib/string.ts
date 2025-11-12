export function sanitizeText(text: string): string {
  if (!text) return "";

  return text
    .replace(/<strong>(.*?)<\/strong>/gi, '"$1"')
    .replace(/<em>(.*?)<\/em>/gi, "'$1'")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();
}
