import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ArticleSource } from "@/lib/articles";

export function ArticleReferencesEditor({ sources, onChange }: { sources: ArticleSource[]; onChange: (sources: ArticleSource[]) => void }) {
  function update(index: number, key: keyof ArticleSource, value: string) { onChange(sources.map((s, i) => i === index ? { ...s, [key]: value } : s)); }
  return <section><div className="flex justify-between items-center gap-3 mb-4"><h2 className="font-serif text-2xl">Källor</h2><Button variant="outline" onClick={() => onChange([...sources, { title: "", authors: "", year: "", url: "" }])}><Plus />Lägg till källa</Button></div>
    {sources.map((source, i) => <div className="reference-editor-row" key={i}><div className="flex justify-between items-center mb-4"><span className="eyebrow text-muted-foreground">Källa {i + 1}</span><Button variant="ghost" size="icon" title="Ta bort källa" aria-label={`Ta bort källa ${i + 1}`} onClick={() => onChange(sources.filter((_, j) => i !== j))}><X /></Button></div><div className="admin-form-grid">
      <label className="admin-field">Källans titel<input value={source.title} onChange={e => update(i, "title", e.target.value)} /></label>
      <label className="admin-field">Författare<input value={source.authors} onChange={e => update(i, "authors", e.target.value)} /></label>
      <label className="admin-field">År<input inputMode="numeric" maxLength={4} value={source.year} onChange={e => update(i, "year", e.target.value)} /></label>
      <label className="admin-field">URL<input type="url" value={source.url} onChange={e => update(i, "url", e.target.value)} /></label>
    </div></div>)}
  </section>;
}