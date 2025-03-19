export function normalizeLabel (text: string): string {
  return text.replace(/\\n|\$\d+(\.\d+)?/g, '').trim();
}
