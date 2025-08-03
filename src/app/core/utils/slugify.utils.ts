export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, 'and')              // Replace ampersand
    .replace(/\+/g, 'plus')            // Replace plus
    .replace(/\|/g, '-')               // Replace pipe
    .replace(/[^\w\s-]/g, '')          // Remove remaining special chars
    .replace(/\s+/g, '-')              // Replace spaces with hyphen
    .replace(/-+/g, '-')               // Remove multiple hyphens
    .trim();
}
