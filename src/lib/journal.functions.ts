import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { publishingSchema, assertAdmin } from "./publishing";
import { z } from "zod";

export const getPublicArticles = createServerFn({ method: "GET" }).handler(async () => {
  const { readPublicArticles } = await import("./public-articles.server");
  return readPublicArticles();
});
export const getAdminWorkspace = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: allowed, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error) throw new Error("Behörigheten kunde inte kontrolleras.");
  const { data: profile } = await context.supabase.from("profiles").select("display_name,avatar_url").eq("id", context.userId).maybeSingle();
  if (!allowed) return { allowed: false, profile, articles: [] };
  const { data: articles, error: fetchError } = await context.supabase.from("journal_articles").select("*").order("updated_at", { ascending: false });
  if (fetchError) throw new Error("Artiklarna kunde inte hämtas.");
  return { allowed: true, profile, articles };
});
export const saveJournalArticle = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(publishingSchema).handler(async ({ data, context }) => {
  const { data: allowed, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error) throw new Error("Behörigheten kunde inte kontrolleras."); assertAdmin(allowed);
  const { id, readingTime, coverImage, coverAlt, ...rest } = data;
  const record = { ...rest, cover_image: coverImage, cover_alt: coverAlt, reading_time: readingTime, updated_at: new Date().toISOString(), published_at: data.status === "published" ? new Date().toISOString() : null };
  const result = id ? await context.supabase.from("journal_articles").update(record).eq("id", id).select("id").single() : await context.supabase.from("journal_articles").insert({ ...record, created_by: context.userId }).select("id").single();
  if (result.error) throw new Error(result.error.code === "23505" ? "Denna artikeladress används redan." : "Artikeln kunde inte sparas.");
  return result.data;
});
export const saveJournalProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(z.object({ display_name: z.string().max(200), avatar_url: z.string().max(2000).refine(v => !v || /^https:\/\//.test(v), "Profilbilden behöver en https-adress.") })).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from("profiles").upsert({ id: context.userId, ...data });
  if (error) throw new Error("Profilen kunde inte sparas."); return { ok: true };
});