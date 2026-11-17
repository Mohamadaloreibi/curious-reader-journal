import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function ArticleImageEditor({ value, alt, onChange }: { value: string; alt: string; onChange: (value: string, alt: string) => void }) {
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (value.startsWith("journal-images/")) {
      supabase.storage.from("journal-images").createSignedUrl(value.slice(15), 3600).then(({ data }) => { if (active) setPreview(data?.signedUrl ?? ""); });
    } else setPreview(value);
    return () => { active = false; };
  }, [value]);
  return <section className="space-y-4"><h2 className="font-serif text-2xl">Omslagsbild</h2>
    {preview && <img src={preview} alt={alt} className="w-full max-w-xl aspect-video object-cover" />}
    <label className="admin-field">Ladda upp bild<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async e => {
      const input = e.currentTarget;
      const file = input.files?.[0]; if (!file) return;
      setError("");
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) { setError("Välj JPG, PNG eller WebP, högst 10 MB."); return; }
      setBusy(true);
      try {
        const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
        const path = `${crypto.randomUUID()}.${extension}`;
        const { error } = await supabase.storage.from("journal-images").upload(path, file, { contentType: file.type });
        if (error) throw error;
        onChange(`journal-images/${path}`, alt);
      } catch { setError("Bilden kunde inte laddas upp. Försök igen."); } finally { setBusy(false); input.value = ""; }
    }} /></label>
    {busy && <p role="status" className="text-sm">Laddar upp…</p>}
    <label className="admin-field">Bildadress<input type="url" placeholder="https://…" value={value.startsWith("journal-images/") ? "" : value} onChange={e => onChange(e.target.value, alt)} /></label>
    <label className="admin-field">Bildbeskrivning<input value={alt} onChange={e => onChange(value, e.target.value)} /></label>
    {value && <Button variant="outline" onClick={() => onChange("", "")}><X />Återställ standardbild</Button>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </section>;
}