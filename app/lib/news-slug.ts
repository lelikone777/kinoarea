export function createNewsSlug(input: { title: string; seed: string }) {
  const base = input.title
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "news";

  let hash = 0;
  for (let i = 0; i < input.seed.length; i += 1) {
    hash = (hash * 33 + input.seed.charCodeAt(i)) >>> 0;
  }
  return `${base}-${hash.toString(36)}`;
}

