CREATE TABLE public.profiles (id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, display_name text NOT NULL DEFAULT '', avatar_url text NOT NULL DEFAULT '');
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_read_own ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE FUNCTION public.create_journal_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN INSERT INTO public.profiles(id,display_name) VALUES(NEW.id,COALESCE(NEW.raw_user_meta_data->>'full_name','')) ON CONFLICT(id) DO NOTHING; RETURN NEW; END; $$;
CREATE TRIGGER journal_profile_on_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_journal_profile();
CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role public.app_role NOT NULL, UNIQUE(user_id,role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY roles_read_own ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE FUNCTION public.has_role(_user_id uuid,_role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;
REVOKE ALL ON FUNCTION public.has_role(uuid,public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role) TO authenticated;
CREATE TABLE public.journal_articles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE, title text NOT NULL, subtitle text NOT NULL DEFAULT '', excerpt text NOT NULL DEFAULT '', category text NOT NULL DEFAULT 'Player Development', author text NOT NULL DEFAULT '', date text NOT NULL DEFAULT '', language text NOT NULL DEFAULT 'sv' CHECK(language IN ('sv','en')), reading_time text NOT NULL DEFAULT '', featured boolean NOT NULL DEFAULT false, sources jsonb NOT NULL DEFAULT '[]', body text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz,
 CONSTRAINT published_has_body CHECK(status <> 'published' OR (length(trim(body)) > 0 AND length(trim(title)) > 0)), CONSTRAINT valid_article_slug CHECK(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
GRANT SELECT ON public.journal_articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_articles TO authenticated;
GRANT ALL ON public.journal_articles TO service_role;
ALTER TABLE public.journal_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY published_articles_read ON public.journal_articles FOR SELECT TO anon,authenticated USING(status='published');
CREATE POLICY admin_articles_read ON public.journal_articles FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE POLICY admin_articles_insert ON public.journal_articles FOR INSERT TO authenticated WITH CHECK(public.has_role(auth.uid(),'admin') AND created_by=auth.uid());
CREATE POLICY admin_articles_update ON public.journal_articles FOR UPDATE TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE POLICY admin_articles_delete ON public.journal_articles FOR DELETE TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE INDEX journal_articles_status_date ON public.journal_articles(status,date DESC);