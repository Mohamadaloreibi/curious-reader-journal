import { parse } from "yaml";
import { z } from "zod";

export const categories = [
  { name: "Coaching", slug: "coaching", heading: "Coaching" },
  { name: "Player Development", slug: "player-development", heading: "Player Development" },
  { name: "Tactics", slug: "tactics", heading: "Tactical Analysis" },
  { name: "Research", slug: "research", heading: "Football Research" },
] as const;

const articleSchema = z.object({
  title: z.string(), slug: z.string(), subtitle: z.string().default(""),
  excerpt: z.string().default(""), category: z.string(), author: z.string().default(""),
  date: z.string().default(""), language: z.enum(["sv", "en"]),
  readingTime: z.union([z.string(), z.number()]).default(""), featured: z.boolean().default(false),
  sources: z.array(z.object({ title: z.string(), url: z.string().url() })).default([]),
});
export type Article = z.infer<typeof articleSchema> & { body: string };

export function parseArticle(raw: string): Article {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  const frontmatter = match?.[1];
  const body = match?.[2];
  if (frontmatter === undefined || body === undefined) throw new Error("Article requires YAML frontmatter");
  return { ...articleSchema.parse(parse(frontmatter)), body: body.trim() };
}

const files = import.meta.glob("../content/articles/*.md", { query: "?raw", import: "default", eager: true });
export const articles: Article[] = Object.values(files).map(raw => parseArticle(String(raw)))
  .sort((a, b) => b.date.localeCompare(a.date));
export function categoryArticles(name: string) {
  return articles.filter(article => article.category === name || (name === "Tactics" && article.category === "Tactical Analysis") || (name === "Research" && article.category === "Football Research"));
}
export function searchArticles(query: string) {
  const needle = query.trim().toLocaleLowerCase();
  return articles.filter(a => `${a.title} ${a.subtitle} ${a.excerpt} ${a.category} ${a.author}`.toLocaleLowerCase().includes(needle));
}
export const mission = "The Football Development Journal explores the ideas, research, and coaching practices shaping the development of football players.";
export function articleMeta(article: Article) {
  return [article.author, article.date ? new Intl.DateTimeFormat(article.language, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(article.date)) : "", article.readingTime ? `${article.readingTime} min read` : ""].filter(Boolean).join(" · ");
}