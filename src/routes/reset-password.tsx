import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { editorialHead } from "@/lib/seo";
export const Route = createFileRoute("/reset-password")({ component: ResetPasswordPage, head: () => editorialHead("Återställ lösenord", "Välj ett nytt lösenord för journalen.", "/reset-password") });
function ResetPasswordPage() {
  const [ready, setReady] = useState(false); const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false); const navigate = useNavigate();
  useEffect(() => { if (new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery") setReady(true); const { data: { subscription } } = supabase.auth.onAuthStateChange(event => { if (event === "PASSWORD_RECOVERY") setReady(true); }); return () => subscription.unsubscribe(); }, []);
  return <main id="main-content" className="journal-shell"><div className="auth-layout"><h1 className="font-serif text-4xl mb-8">Nytt lösenord</h1>{ready ? <form onSubmit={async e => { e.preventDefault(); setBusy(true); const { error } = await supabase.auth.updateUser({ password }); setBusy(false); if (error) setMessage("Lösenordet kunde inte uppdateras. Försök med en ny återställningslänk."); else { setMessage("Lösenordet är uppdaterat."); await navigate({ to: "/admin" }); } }}><label className="admin-field">Nytt lösenord<input type="password" minLength={8} autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)}/></label><Button className="mt-5" disabled={busy}>Spara lösenord</Button></form> : <p className="font-serif text-xl">Öppna sidan via återställningslänken i ditt mejl.</p>}<p role="status" className="mt-5 text-sm">{message}</p></div></main>;
}