import { createFileRoute } from "@tanstack/react-router";
import { createRss } from "@/lib/rss";
export const Route = createFileRoute("/rss.xml")({ server: { handlers: { GET: async ({ request }) => {
  try {
    const { readPublicArticles } = await import("@/lib/public-articles.server");
    const articles = await readPublicArticles();
    return new Response(createRss(articles, new URL(request.url).origin), { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=60" } });
  } catch { return new Response("RSS-flödet är tillfälligt otillgängligt.", { status: 503 }); }
} } } });