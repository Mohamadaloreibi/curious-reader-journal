import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Search, Menu, X, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { articleMeta, categories, mission, type Article } from "@/lib/articles";
import { useQuery } from "@tanstack/react-query";
import { publicArticlesQuery } from "@/lib/article-queries";
import { useJournalSession } from "@/hooks/use-journal-session";
import footballPhoto from "@/assets/football-training.jpg";

export function Wordmark() {
  return <svg className="wordmark font-serif" viewBox="0 0 350 68" role="img" aria-label="The Football Development Journal">
    <g fill="none" stroke="currentColor" strokeWidth="1.1"><rect x="1" y="8" width="66" height="48"/><path d="M34 8v48M1 19h13v26H1m66-26H54v26h13M1 25h5v14H1m66-14h-5v14h5"/><circle cx="34" cy="32" r="8"/></g>
    <g fill="currentColor" fontFamily="Source Serif 4, Georgia, serif"><text x="84" y="17" fontSize="12">THE</text><text x="84" y="38" fontSize="19">FOOTBALL DEVELOPMENT</text><text x="84" y="59" fontSize="19">JOURNAL</text></g>
  </svg>;
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return <><Link to="/" className="nav-item" activeProps={{ "data-active": "true" }} activeOptions={{ exact: true }} onClick={onNavigate}>Home</Link>
    {categories.map(c => <Link key={c.slug} to="/category/$name" params={{ name: c.slug }} className="nav-item" activeProps={{ "data-active": "true" }} onClick={onNavigate}>{c.name}</Link>)}
    <Link to="/about" className="nav-item" activeProps={{ "data-active": "true" }} onClick={onNavigate}>About</Link></>;
}

export function JournalHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (searchOpen) input.current?.focus(); }, [searchOpen]);
  const close = () => { setMenuOpen(false); setSearchOpen(false); };
  const { data: allArticles = [] } = useQuery(publicArticlesQuery);
  const results = allArticles.filter(a => `${a.title} ${a.subtitle} ${a.excerpt} ${a.category} ${a.author}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <header className="site-header"><a href="#main-content" className="sr-only focus:not-sr-only focus:block focus:p-4">Skip to content</a>
    <div className="journal-shell header-inner"><Link to="/" aria-label="The Football Development Journal home" onClick={close}><Wordmark/></Link>
      <div className="flex items-center gap-2"><nav aria-label="Main navigation" className="desktop-nav"><Navigation onNavigate={close}/></nav>
        <Button variant="ghost" size="icon" aria-label={searchOpen ? "Close search" : "Search articles"} title="Search articles" aria-expanded={searchOpen} aria-controls="journal-search" onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }}>{searchOpen ? <X/> : <Search/>}</Button>
        <Button variant="ghost" size="icon" className="menu-trigger" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }}>{menuOpen ? <X/> : <Menu/>}</Button>
      </div>
    </div>
    {menuOpen && <nav id="mobile-navigation" className="journal-shell mobile-nav" aria-label="Mobile navigation"><Navigation onNavigate={close}/></nav>}
    {searchOpen && <div id="journal-search" className="search-panel journal-shell" onKeyDown={e => { if (e.key === "Escape") close(); }}>
      <label htmlFor="article-search" className="eyebrow">Search the journal</label>
      <input ref={input} id="article-search" type="search" className="search-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search articles…"/>
      <div aria-live="polite" className="py-5">{results.length ? results.map(a => <Link key={a.slug} to="/articles/$slug" params={{ slug: a.slug }} className="block font-serif text-xl py-2" onClick={close}>{a.title} <ArrowUpRight className="inline size-4"/></Link>) : <p className="text-sm text-muted-foreground">No articles found.</p>}</div>
    </div>}
  </header>;
}

export function JournalFooter() {
  const { user } = useJournalSession();
  return <footer className="site-footer"><div className="journal-shell"><div className="footer-top">
    <div className="footer-brand"><Link to="/" aria-label="The Football Development Journal home"><Wordmark/></Link><p className="footer-mission">{mission}</p></div>
    <div><h2 className="eyebrow mb-5 text-accent">Explore the journal</h2><nav className="flex flex-col items-start gap-3 text-xs" aria-label="Footer navigation"><Link to="/">Home</Link>{categories.map(c => <Link key={c.slug} to="/category/$name" params={{ name: c.slug }}>{c.name}</Link>)}<Link to="/about">About</Link><a href="/rss.xml">RSS feed</a>{user ? <Link to="/admin">Redaktionen</Link> : <Link to="/auth">Admin · Logga in</Link>}</nav></div>
    <div><h2 className="eyebrow mb-5 text-accent">Independent perspectives</h2><p className="font-serif text-base leading-relaxed opacity-75">Swedish football.<br/>An international perspective.</p><p className="text-xs mt-7 opacity-75">Contact — in preparation</p></div>
  </div><div className="footer-bottom"><span>© {new Date().getFullYear()} The Football Development Journal</span><span>Independent. Research-informed. Development-focused.</span></div></div></footer>;
}

export function ArticleTeaser({ article }: { article: Article }) {
  return <article className="article-teaser"><Link to="/articles/$slug" params={{ slug: article.slug }} tabIndex={-1} aria-hidden="true"><img className="teaser-image" src={footballPhoto} alt="" width={1920} height={1024} loading="lazy"/></Link>
    <div><div className="eyebrow text-primary flex gap-3"><span>{article.category}</span><span className="text-muted-foreground">{article.language === "sv" ? "Svenska" : "English"}</span></div>
    <h3 className="teaser-title" lang={article.language}><Link to="/articles/$slug" params={{ slug: article.slug }}>{article.title}</Link></h3>
    {article.excerpt && <p className="font-serif text-lg mt-3 text-muted-foreground">{article.excerpt}</p>}
    {articleMeta(article) && <p className="text-xs mt-4 text-muted-foreground">{articleMeta(article)}</p>}
    <Link className="inline-flex items-center gap-2 text-xs mt-5" to="/articles/$slug" params={{ slug: article.slug }}>Read article <ArrowRight className="size-3"/></Link></div>
  </article>;
}