import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { useJournalSession } from "@/hooks/use-journal-session";
import { editorialHead } from "@/lib/seo";
export const Route = createFileRoute("/auth")({ component: AuthPage, head: () => ({ ...editorialHead("Admininloggning", "Logga in till journalens redaktion.", "/auth"), meta: [...editorialHead("Admininloggning", "Logga in till journalens redaktion.", "/auth").meta, { name: "robots", content: "noindex" }] }) });
function AuthPage() {
  const { user } = useJournalSession(); const navigate = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login"); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { if (user) void navigate({ to: "/admin" }); }, [user, navigate]);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      if (mode === "reset") { const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }); if (error) throw error; setMessage("Om kontot finns skickas ett återställningsmejl. Kontrollera även skräpposten."); }
      else if (mode === "signup") { const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } }); if (error) throw error; setMessage(data.session ? "Kontot är skapat." : "Bekräfta din e-post via länken i mejlet. Kontot behöver separat administratörsbehörighet."); }
      else { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; await navigate({ to: "/admin" }); }
    } catch { setMessage("Det gick inte att fortsätta. Kontrollera uppgifterna och försök igen."); } finally { setBusy(false); }
  }
  async function social(provider: "google" | "lovable") { setBusy(true); setMessage(""); try { const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` }); if (result.error) throw result.error; if (!result.redirected) await navigate({ to: "/admin" }); } catch { setMessage("Inloggningen kunde inte slutföras."); } finally { setBusy(false); } }
  return <main id="main-content" className="journal-shell"><div className="auth-layout"><span className="eyebrow text-muted-foreground">Journalens redaktion</span><h1 className="font-serif text-4xl mt-4 mb-8">{mode === "reset" ? "Återställ lösenord" : mode === "signup" ? "Skapa konto" : "Logga in"}</h1><form className="space-y-5" onSubmit={submit}><label className="admin-field">E-post<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)}/></label>{mode !== "reset" && <label className="admin-field">Lösenord<input type="password" minLength={8} required autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)}/></label>}<Button type="submit" disabled={busy} className="w-full">{busy ? "Vänta…" : mode === "reset" ? "Skicka återställningslänk" : mode === "signup" ? "Skapa konto" : "Logga in"}</Button></form>
    {mode !== "reset" && <div className="space-y-3 mt-6"><Button variant="outline" className="google-signin w-full" disabled={busy} onClick={() => social("google")}><svg aria-hidden="true" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>Fortsätt med Google</Button><Button variant="outline" className="w-full" disabled={busy} onClick={() => social("lovable")}><LovableMark/>Fortsätt med Lovable</Button></div>}
    <p role="status" className="text-sm mt-5 text-muted-foreground">{message}</p><div className="flex flex-wrap gap-3 mt-5"><Button variant="link" onClick={() => { setMode(mode === "signup" || mode === "reset" ? "login" : "signup"); setMessage(""); }}>{mode === "login" ? "Skapa konto" : "Tillbaka till inloggning"}</Button>{mode === "login" && <Button variant="link" onClick={() => { setMode("reset"); setMessage(""); }}>Glömt lösenord?</Button>}</div></div></main>;
}