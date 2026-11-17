import { z } from "zod";
import { type Article } from "./articles";
export const publishingSchema = z.object({
  id: z.string().uuid().optional(), title: z.string().trim().min(1).max(300),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  subtitle: z.string().max(1000), excerpt: z.string().max(2000),
  category: z.enum(["Coaching", "Player Development", "Tactics", "Research"]),
  author: z.string().max(200), date: z.string().refine(v => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Ange ett giltigt datum"),
  language: z.enum(["sv", "en"]), readingTime: z.string().max(30), featured: z.boolean(),
  sources: z.array(z.object({ title: z.string().min(1).max(500), url: z.string().url().refine(v => /^https?:\/\//.test(v)) })).max(100),
  body: z.string().max(500000), status: z.enum(["draft", "published"]),
}).superRefine((a, ctx) => { if (a.status === "published" && !a.body.trim()) ctx.addIssue({ code: "custom", path: ["body"], message: "Lägg till artikeltext innan publicering." }); });
export type PublishingInput = z.infer<typeof publishingSchema>;
export function mergeArticles(markdown: Article[], published: Article[]) {
  const merged = new Map(markdown.map(a => [a.slug, a]));
  published.forEach(a => merged.set(a.slug, a));
  return [...merged.values()].sort((a, b) => b.date.localeCompare(a.date));
}
export function assertAdmin(allowed: boolean | null) {
  if (allowed !== true) throw new Error("Du saknar administratörsbehörighet.");
}