import { createFileRoute, notFound } from "@tanstack/react-router";
import { categories, categoryArticles } from "@/lib/articles";
import { editorialHead } from "@/lib/seo";
import { ArticleTeaser } from "@/components/journal";

export const Route = createFileRoute("/category/$name")({
  loader: ({ params }) => {
    const category = categories.find(c => c.slug === params.name);
    if (!category) throw notFound();
    return { category, articles: categoryArticles(category.name) };
  },
  head: ({ loaderData }) => editorialHead(loaderData?.category.heading ?? "Unavailable", `Independent football analysis: ${loaderData?.category.heading ?? "the journal"}.`, loaderData ? `/category/${loaderData.category.slug}` : "/category"),
  component: CategoryPage,
});
function CategoryPage() {
  const { category, articles } = Route.useLoaderData();
  return <main id="main-content" className="journal-shell min-h-[60vh]"><header className="page-intro"><span className="eyebrow text-muted-foreground">The journal / {category.name}</span><h1 className="page-title">{category.heading}</h1></header><div className="section-band space-y-12">{articles.length ? articles.map(a => <ArticleTeaser article={a} key={a.slug}/>) : <p className="font-serif text-2xl italic text-muted-foreground">In preparation</p>}</div></main>;
}