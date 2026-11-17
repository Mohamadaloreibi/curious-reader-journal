import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { articles, sourceSchema, type Article } from "./articles";
import { mergeArticles } from "./publishing";
import { z } from "zod";

export async function readPublicArticles(): Promise<Article[]> {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error("Artikelarkivet är inte tillgängligt.");
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    headers.set("apikey", key); return fetch(input, { ...init, headers });
  } } });
  const rows: Database['public']['Tables']['journal_articles']['Row'][] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client.from("journal_articles").select("*").eq("status", "published").order("date", { ascending: false }).order("id").range(offset, offset + 499);
    if (error) throw new Error("Artiklarna kunde inte hämtas.");
    rows.push(...data); if (data.length < 500) break;
  }
  const sourcesSchema = z.array(sourceSchema);
  async function resolveImage(image: string) {
    if (!image.startsWith("journal-images/")) return image;
    const { data } = await client.storage.from("journal-images").createSignedUrl(image.slice(15), 86400);
    return data?.signedUrl.replace(url ?? "", import.meta.env['VITE_SUPABASE_URL']) ?? "";
  }
  const published: Article[] = await Promise.all(rows.map(async r => {
    const [coverImage, ogImage] = await Promise.all([resolveImage(r.cover_image), resolveImage(r.og_image)]);
    return { title: r.title, slug: r.slug, subtitle: r.subtitle, excerpt: r.excerpt, category: r.category, author: r.author, date: r.date, language: r.language === "en" ? "en" as const : "sv" as const, readingTime: r.reading_time, featured: r.featured, sources: sourcesSchema.parse(r.sources), body: r.body, coverImage, coverAlt: r.cover_alt, seoTitle: r.seo_title, seoDescription: r.seo_description, ogImage };
  }));
  return mergeArticles(articles, published);
}