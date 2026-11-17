import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArticleContent } from "@/components/article-content";
import { ArrowLeft, Check, Link as LinkIcon, Linkedin } from "lucide-react";
import { articleMeta } from "@/lib/articles";
import { publicArticlesQuery } from "@/lib/article-queries";
import { editorialHead } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/articles/$slug")({
  loader: async ({ params, context }) => { const articles = await context.queryClient.ensureQueryData(publicArticlesQuery); const article = articles.find(a => a.slug === params.slug); if (!article) throw notFound(); return article; },
  head: ({ loaderData }) => {
    const head = editorialHead(loaderData?.seoTitle || loaderData?.title || "Unavailable", loaderData?.seoDescription || loaderData?.excerpt || loaderData?.subtitle || loaderData?.title || "Article unavailable.", loaderData ? `/articles/${loaderData.slug}` : "/articles", "article");
    const image = loaderData?.ogImage || loaderData?.coverImage;
    if (image?.startsWith("https://")) head.meta.push({ property: "og:image", content: image }, { name: "twitter:image", content: image });
    return head;
  },
  component: ArticlePage,
});
function ArticlePage() {
  const article = Route.useLoaderData();
  const [progress, setProgress] = useState(0);
  const [copyState, setCopyState] = useState("");
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function update() {
      if (!content.current) return;
      const end = content.current.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
      setProgress(end > 0 ? Math.min(100, Math.max(0, window.scrollY / end * 100)) : 100);
    }
    update(); window.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [article.slug]);
  async function copyLink() { try { await navigator.clipboard.writeText(window.location.href); setCopyState("Copied"); } catch { setCopyState("Unable to copy link"); } }

  return <main id="main-content" className="journal-shell"><progress className="reading-progress" value={progress} max={100} aria-label="Reading progress"/><article lang={article.language}>
    <header className="page-intro"><Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground mb-8"><ArrowLeft className="size-3"/> Back to the journal</Link><div className="eyebrow text-primary">{article.category} <span className="ml-3 text-muted-foreground">{article.language === "sv" ? "Svenska" : "English"}</span></div><h1 className="page-title">{article.title}</h1>{article.subtitle && <p className="font-serif text-2xl mt-6 max-w-3xl">{article.subtitle}</p>}{articleMeta(article) && <p className="text-xs text-muted-foreground mt-7">{articleMeta(article)}</p>}</header>
    {article.coverImage && <img src={article.coverImage} alt={article.coverAlt} className="w-full max-h-[600px] object-cover mt-8" />}
    <div className="editorial-prose" ref={content}>{article.body ? <ArticleContent body={article.body} sources={article.sources} language={article.language}/> : <><p className="italic text-muted-foreground">{article.language === "sv" ? "Manuskript under förberedelse." : "Manuscript in preparation."}</p><ArticleContent body="" sources={article.sources} language={article.language}/></>}
      <div className="flex flex-wrap gap-3 border-t border-border pt-6 mt-12 font-sans"><Button variant="outline" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, "_blank", "noopener,noreferrer")}><Linkedin/> Share on LinkedIn</Button><Button variant="outline" onClick={copyLink}>{copyState === "Copied" ? <Check/> : <LinkIcon/>}{copyState === "Copied" ? "Copied" : "Copy link"}</Button><span aria-live="polite" className="text-sm self-center text-muted-foreground">{copyState === "Unable to copy link" ? copyState : ""}</span></div>
    </div>
  </article></main>;
}