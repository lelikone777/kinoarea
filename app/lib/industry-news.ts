import type { News } from "../data/content";
import { normalizeSiteLanguage, type SiteLanguage } from "./language";
import { createNewsSlug } from "./news-slug";

type NewsSource = {
  name: string;
  feedUrl: string;
};

type FeedItem = {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  image?: string;
  source: string;
};

type TranslationResponse =
  | { translatedText?: string }
  | { data?: { translations?: Array<{ translatedText?: string }> } };

const SOURCES: NewsSource[] = [
  { name: "Variety", feedUrl: "https://variety.com/v/film/feed/" },
  { name: "The Hollywood Reporter", feedUrl: "https://www.hollywoodreporter.com/c/movies/movie-news/feed/" },
  { name: "Deadline", feedUrl: "https://deadline.com/v/film/feed/" },
];

const FALLBACK_IMAGE = "/placeholders/backdrop.svg";
const MAX_ITEMS = 6;

const TRANSLATE_API_URL = process.env.TRANSLATE_API_URL?.trim() || "";
const TRANSLATE_API_KEY = process.env.TRANSLATE_API_KEY?.trim() || "";

const translationCache = new Map<string, string>();

function decodeXmlEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function stripHtml(value: string) {
  return decodeXmlEntities(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function readTag(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  if (!match) return undefined;
  return match[1].replace("<![CDATA[", "").replace("]]>", "").trim();
}

function readAttribute(block: string, tag: string, attr: string) {
  const match = block.match(new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["'][^>]*>`, "i"));
  return match?.[1];
}

function extractImage(block: string, description?: string) {
  const mediaContent = readAttribute(block, "media:content", "url");
  if (mediaContent) return mediaContent;
  const enclosure = readAttribute(block, "enclosure", "url");
  if (enclosure) return enclosure;
  if (!description) return undefined;
  const imageMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imageMatch?.[1];
}

function parseRssItems(xml: string, sourceName: string): FeedItem[] {
  const itemMatches = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)];
  if (!itemMatches.length) return [];

  return itemMatches.reduce<FeedItem[]>((acc, match) => {
    const block = match[0];
    const title = readTag(block, "title");
    const link = readTag(block, "link");
    const description = readTag(block, "description");
    const pubDate = readTag(block, "pubDate");
    const image = extractImage(block, description);
    if (!title || !link) return acc;
    acc.push({
      title: stripHtml(title),
      link: link.trim(),
      description,
      pubDate,
      image,
      source: sourceName,
    });
    return acc;
  }, []);
}

async function fetchFeed(source: NewsSource): Promise<FeedItem[]> {
  const response = await fetch(source.feedUrl, {
    next: { revalidate: 60 * 30 },
    headers: { "user-agent": "kinoarea-news-bot/1.0" },
  });
  if (!response.ok) return [];
  const xml = await response.text();
  return parseRssItems(xml, source.name);
}

function toTimestamp(value?: string) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function toLocale(language: SiteLanguage) {
  if (language === "ru-RU") return "ru-RU";
  if (language === "pt-BR") return "pt-BR";
  if (language === "es-ES") return "es-ES";
  if (language === "de-DE") return "de-DE";
  return "en-US";
}

function toTargetLanguage(language: SiteLanguage) {
  if (language === "ru-RU") return "ru";
  if (language === "pt-BR") return "pt";
  if (language === "es-ES") return "es";
  if (language === "de-DE") return "de";
  return "en";
}

function formatDate(value: string | undefined, language: SiteLanguage) {
  const timestamp = toTimestamp(value);
  if (!timestamp) return "Recently";
  return new Intl.DateTimeFormat(toLocale(language), {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(timestamp);
}

function readTranslatedText(payload: TranslationResponse) {
  if ("translatedText" in payload && payload.translatedText) return payload.translatedText;
  if ("data" in payload) {
    const first = payload.data?.translations?.[0]?.translatedText;
    if (first) return first;
  }
  return null;
}

async function translateText(text: string, targetLanguage: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || targetLanguage === "en" || !TRANSLATE_API_URL) return text;

  const cacheKey = `${targetLanguage}:${trimmed}`;
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(TRANSLATE_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(TRANSLATE_API_KEY ? { authorization: `Bearer ${TRANSLATE_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        q: trimmed,
        source: "en",
        target: targetLanguage,
        format: "text",
      }),
    });
    if (!response.ok) return text;
    const data = (await response.json()) as TranslationResponse;
    const translated = readTranslatedText(data);
    if (!translated) return text;
    translationCache.set(cacheKey, translated);
    return translated;
  } catch {
    return text;
  }
}

async function translateNewsItems(items: News[], language: SiteLanguage): Promise<News[]> {
  const targetLanguage = toTargetLanguage(language);
  if (targetLanguage === "en") return items;

  return Promise.all(
    items.map(async (item) => {
      const [title, excerpt] = await Promise.all([
        translateText(item.title, targetLanguage),
        translateText(item.excerpt, targetLanguage),
      ]);
      return { ...item, title, excerpt };
    })
  );
}

export async function getIndustryNews(language: SiteLanguage = "ru-RU"): Promise<News[]> {
  const normalizedLanguage = normalizeSiteLanguage(language);
  const chunks = await Promise.all(
    SOURCES.map(async (source) => {
      try {
        return await fetchFeed(source);
      } catch {
        return [];
      }
    })
  );

  const merged = chunks.flat();
  if (!merged.length) return [];

  const dedup = new Set<string>();
  const sorted = merged
    .sort((a, b) => toTimestamp(b.pubDate) - toTimestamp(a.pubDate))
    .filter((item) => {
      const key = (item.link || item.title).toLowerCase().trim();
      if (dedup.has(key)) return false;
      dedup.add(key);
      return true;
    })
    .slice(0, MAX_ITEMS);

  const baseItems: News[] = sorted.map((item) => ({
    slug: createNewsSlug({
      title: item.title,
      seed: `${item.link}|${item.pubDate ?? ""}|${item.source}`,
    }),
    title: item.title,
    date: formatDate(item.pubDate, normalizedLanguage),
    excerpt: stripHtml(item.description || "").slice(0, 180) || "Summary is unavailable.",
    image: item.image || FALLBACK_IMAGE,
    source: item.source,
    url: item.link,
  }));

  return translateNewsItems(baseItems, normalizedLanguage);
}
