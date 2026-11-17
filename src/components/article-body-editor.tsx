import { useRef, useState } from "react";
import { Bold, Heading2, Heading3, Quote, List, ListOrdered, Link, Pilcrow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleContent } from "./article-content";
import { formatSelection, type Format } from "@/lib/editor-formatting";
import type { ArticleSource } from "@/lib/articles";

const tools = [
  { format: "h2", label: "Rubrik H2", icon: Heading2 }, { format: "h3", label: "Rubrik H3", icon: Heading3 },
  { format: "bold", label: "Fetstil", icon: Bold }, { format: "quote", label: "Citat", icon: Quote },
  { format: "paragraph", label: "Nytt stycke", icon: Pilcrow }, { format: "bullet", label: "Punktlista", icon: List },
  { format: "number", label: "Numrerad lista", icon: ListOrdered },
] as const;
export function ArticleBodyEditor({ value, onChange, sources, language }: { value: string; onChange: (value: string) => void; sources: ArticleSource[]; language: "sv" | "en" }) {
  const input = useRef<HTMLTextAreaElement>(null);
  const selection = useRef({ start: 0, end: 0 });
  const [live, setLive] = useState(true);
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("");
  function apply(format: Format) {
    const result = formatSelection(value, selection.current.start, selection.current.end, format, url);
    onChange(result.value);
    requestAnimationFrame(() => { input.current?.focus(); input.current?.setSelectionRange(result.start, result.end); });
  }
  return <section className="body-editor"><div className="flex items-center justify-between gap-3 mb-4 flex-wrap"><h2 className="font-serif text-2xl">Artikeltext</h2><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={live} onChange={e => setLive(e.target.checked)} />Liveförhandsvisning</label></div>
    <div role="toolbar" aria-label="Textformatering" className="flex flex-wrap gap-1 border-y border-border py-2">
      {tools.map(t => <Button key={t.format} variant="ghost" size="icon" title={t.label} aria-label={t.label} onClick={() => apply(t.format)}><t.icon /></Button>)}
      <Button variant="ghost" size="icon" title="Infoga länk" aria-label="Infoga länk" onClick={() => { setLinkOpen(!linkOpen); setUrl(""); }}><Link /></Button>
    </div>
    {linkOpen && <form className="flex flex-wrap items-end gap-3 py-4" onSubmit={e => { e.preventDefault(); if (!/^https?:\/\//.test(url)) return; apply("link"); setLinkOpen(false); }}><label className="admin-field flex-1">Länkadress<input type="url" required pattern="https?://.*" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" /></label><Button type="submit">Infoga länk</Button><Button type="button" variant="ghost" onClick={() => setLinkOpen(false)}>Avbryt</Button></form>}
    <div className={live ? "body-editor-columns" : ""}><label className="admin-field pt-4">Markdown<textarea aria-label="Markdown" ref={input} className="article-text-input" rows={20} value={value} onChange={e => onChange(e.target.value)} onSelect={e => { selection.current = { start: e.currentTarget.selectionStart, end: e.currentTarget.selectionEnd }; }} /></label>
      {live && <div className="body-live-preview" lang={language} aria-label="Liveförhandsvisning"><span className="eyebrow text-muted-foreground">Förhandsvisning</span><div className="editorial-prose"><ArticleContent body={value} sources={sources} language={language} /></div></div>}
    </div>
  </section>;
}