import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ArticleSource } from "@/lib/articles";

export function ArticleContent({ body, sources, language }: { body: string; sources: ArticleSource[]; language: "sv" | "en" }) {
  const linkedBody = body.replace(/(?<!!)\[(\d+)\](?!\()/g, (match, n: string) => Number(n) > 0 && Number(n) <= sources.length ? `[${n}](#reference-${n})` : match);
  return <><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({ href, children }) => <a href={href} {...(href?.startsWith("#") ? {} : { target: "_blank", rel: "noopener noreferrer" })}>{children}</a> }}>{linkedBody}</ReactMarkdown>
    {sources.length > 0 && <section id="references" className="article-references"><h2>{language === "sv" ? "Källor och referenser" : "Sources and references"}</h2><ol>{sources.map((s, i) => <li key={i} id={`reference-${i + 1}`}>
      {(s.authors || s.year) && <p className="reference-meta">{[s.authors, s.year ? `(${s.year})` : ""].filter(Boolean).join(" ")}</p>}
      <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>
    </li>)}</ol></section>}
  </>;
}