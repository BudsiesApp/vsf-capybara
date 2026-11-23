export function prepareSocialIcon (svg: string): string {
  return svg.trim()
    .replace(/#fff/gi, 'currentColor')
    .replace(/<(path|circle)([^>]*?)\s*\/>/g, '<$1$2></$1>');
}
