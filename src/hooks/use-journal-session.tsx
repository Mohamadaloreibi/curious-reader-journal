import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
const SessionContext = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });
export function JournalSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); const queryClient = useQueryClient();
  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (active) { setUser(session?.user ?? null); setLoading(false); }
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      void router.invalidate();
      if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
    });
    void supabase.auth.getUser().then(({ data }) => { if (active) { setUser(data.user); setLoading(false); } });
    return () => { active = false; subscription.unsubscribe(); };
  }, [router, queryClient]);
  return <SessionContext.Provider value={{ user, loading }}>{children}</SessionContext.Provider>;
}
export function useJournalSession() { return useContext(SessionContext); }