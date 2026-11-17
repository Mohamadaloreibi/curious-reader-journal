import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleTeaser } from "@/components/journal";
import { categories, articleMeta, mission } from "@/lib/articles";
import { editorialHead } from "@/lib/seo";
import { useSuspenseQuery } from "@tanstack/react-query";
import { publicArticlesQuery } from "@/lib/article-queries";

export const Route = createFileRoute("/")({
  component: Index,
  loader: ({ context }) => context.queryClient.ensureQueryData(publicArticlesQuery),
  head: ({ loaderData }) => {
    const head = editorialHead("The Football Development Journal", mission, "/");
    const featured = loaderData?.find(a => a.featured && a.body.trim()) ?? loaderData?.find(a => a.featured);
    if (featured?.coverImage.startsWith("https://")) head.meta.push({ property: "og:image", content: featured.coverImage }, { name: "twitter:image", content: featured.coverImage });
    return head;
  },
});

function Index() {
  const { data: articles } = useSuspenseQuery(publicArticlesQuery);
  const featured = articles.find(a => a.featured && a.body.trim()) ?? articles.find(a => a.featured);
  return <main id="main-content" className="journal-shell">
    <div className="journal-strap eyebrow"><span>An independent football publication</span><span className="strap-secondary">Ideas · Practice · Evidence</span></div>
    {featured && <section className={`feature ${featured.coverImage ? "" : "feature-no-image"}`} aria-label="Featured article">{featured.coverImage && <img src={featured.coverImage} className="feature-photo" alt={featured.coverImage ? featured.coverAlt : "A football player on a Swedish training pitch"} width={1920} height={1024}/>}
      <div className="feature-copy"><div className="feature-label eyebrow">{featured.category}<span className="text-current/70 ml-2">{featured.language === "sv" ? "Svenska" : "English"}</span></div>
        <h1 lang={featured.language}>{featured.title}</h1>
        {featured.excerpt && <p className="feature-excerpt">{featured.excerpt}</p>}
        {articleMeta(featured) && <p className="text-xs mb-6">{articleMeta(featured)}</p>}
        <Button asChild variant={featured.coverImage ? "hero" : "default"} size="lg"><Link to="/articles/$slug" params={{ slug: featured.slug }}>Read article <ArrowUpRight/></Link></Button>
      </div>
    </section>}
    <section className="section-band" aria-labelledby="latest-heading"><div className="section-heading"><h2 id="latest-heading">Latest from the journal</h2><span className="eyebrow text-muted-foreground">{String(articles.length).padStart(2,"0")} {articles.length === 1 ? "article" : "articles"}</span></div><div className="space-y-10">{articles.map(a => <ArticleTeaser key={a.slug} article={a}/>)}</div></section>
    <div className="category-index">{categories.map(c => { const items = articles.filter(a => a.category === c.name); return <section className="category-column" key={c.slug}><div className="flex justify-between gap-2"><h2><Link to="/category/$name" params={{ name: c.slug }}>{c.heading}</Link></h2><Link to="/category/$name" params={{ name: c.slug }} aria-label={`Explore ${c.heading}`}><ArrowUpRight className="size-4 mt-1"/></Link></div>{items.length ? items.map(a => <Link lang={a.language} key={a.slug} className="category-story" to="/articles/$slug" params={{ slug: a.slug }}>{a.title}</Link>) : <p>In preparation</p>}</section>; })}</div>
    <section className="about-band"><div><span className="eyebrow text-muted-foreground">About the publication</span><h2 className="mt-4">The game. In depth.</h2></div><div><p>{mission}</p><Button variant="editorial" asChild className="mt-5"><Link to="/about">About the journal <ArrowRight/></Link></Button></div></section>
  </main>;
}
