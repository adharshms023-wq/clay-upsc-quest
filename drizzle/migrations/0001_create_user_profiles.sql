CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  avatar_url text,
  attempt_year integer,
  preparation_level text CHECK (preparation_level IS NULL OR preparation_level IN ('Beginner', 'Intermediate', 'Advanced')),
  daily_study_time text CHECK (daily_study_time IS NULL OR daily_study_time IN ('Less than 1 hour', '1–2 hours', '2–4 hours', '4+ hours')),
  xp integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  questions_solved integer NOT NULL DEFAULT 0,
  mock_tests_completed integer NOT NULL DEFAULT 0,
  topics_completed integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name, avatar_url, attempt_year, preparation_level, daily_study_time) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, email, avatar_url, attempt_year, preparation_level, daily_study_time
  ) VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''), NULLIF(trim(NEW.raw_user_meta_data ->> 'name'), ''), NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''), 'UPSC Aspirant'),
    COALESCE(NEW.email, ''),
    NULLIF(COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture'), ''),
    CASE WHEN NEW.raw_user_meta_data ->> 'attempt_year' ~ '^[0-9]{4}$' THEN (NEW.raw_user_meta_data ->> 'attempt_year')::integer ELSE NULL END,
    CASE WHEN NEW.raw_user_meta_data ->> 'preparation_level' IN ('Beginner', 'Intermediate', 'Advanced') THEN NEW.raw_user_meta_data ->> 'preparation_level' ELSE NULL END,
    CASE WHEN NEW.raw_user_meta_data ->> 'daily_study_time' IN ('Less than 1 hour', '1–2 hours', '2–4 hours', '4+ hours') THEN NEW.raw_user_meta_data ->> 'daily_study_time' ELSE NULL END
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_user_profile() FROM PUBLIC;
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

CREATE OR REPLACE FUNCTION public.set_profile_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_profile_updated_at();

INSERT INTO public.profiles (id, full_name, email, avatar_url, attempt_year, preparation_level, daily_study_time)
SELECT
  u.id,
  COALESCE(NULLIF(trim(u.raw_user_meta_data ->> 'full_name'), ''), NULLIF(trim(u.raw_user_meta_data ->> 'name'), ''), NULLIF(split_part(COALESCE(u.email, ''), '@', 1), ''), 'UPSC Aspirant'),
  COALESCE(u.email, ''),
  NULLIF(COALESCE(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture'), ''),
  CASE WHEN u.raw_user_meta_data ->> 'attempt_year' ~ '^[0-9]{4}$' THEN (u.raw_user_meta_data ->> 'attempt_year')::integer ELSE NULL END,
  CASE WHEN u.raw_user_meta_data ->> 'preparation_level' IN ('Beginner', 'Intermediate', 'Advanced') THEN u.raw_user_meta_data ->> 'preparation_level' ELSE NULL END,
  CASE WHEN u.raw_user_meta_data ->> 'daily_study_time' IN ('Less than 1 hour', '1–2 hours', '2–4 hours', '4+ hours') THEN u.raw_user_meta_data ->> 'daily_study_time' ELSE NULL END
FROM auth.users u
ON CONFLICT (id) DO NOTHING;