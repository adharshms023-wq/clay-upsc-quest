CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read their own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  explanation text NOT NULL DEFAULT '',
  subject text NOT NULL,
  topic text NOT NULL DEFAULT '',
  subtopic text NOT NULL DEFAULT '',
  topic_id text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'Medium',
  language text NOT NULL DEFAULT 'English',
  exam text NOT NULL DEFAULT 'UPSC Prelims',
  year integer,
  marks numeric NOT NULL DEFAULT 2,
  negative_marks numeric NOT NULL DEFAULT 0.66,
  question_type text NOT NULL DEFAULT 'MCQ',
  question_source text NOT NULL DEFAULT 'AI',
  status text NOT NULL DEFAULT 'approved',
  tags text[] NOT NULL DEFAULT '{}',
  solving_seconds integer NOT NULL DEFAULT 60,
  question_key text GENERATED ALWAYS AS (lower(regexp_replace(question, '[^a-zA-Z0-9]+', ' ', 'g'))) STORED,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX questions_unique_stem ON public.questions (question_key);
CREATE INDEX questions_filter_idx ON public.questions (status, subject, difficulty, language, exam);
CREATE INDEX questions_topic_idx ON public.questions (topic_id);

GRANT SELECT ON public.questions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved questions are readable by everyone" ON public.questions
FOR SELECT TO anon, authenticated USING (status = 'approved');

CREATE POLICY "Admins can read all questions" ON public.questions
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert questions" ON public.questions
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update questions" ON public.questions
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete questions" ON public.questions
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER questions_set_updated_at BEFORE UPDATE ON public.questions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.pick_random_questions(
  _limit integer,
  _subjects text[] DEFAULT NULL,
  _topic_ids text[] DEFAULT NULL,
  _difficulties text[] DEFAULT NULL,
  _types text[] DEFAULT NULL,
  _language text DEFAULT NULL,
  _exam text DEFAULT NULL,
  _exclude uuid[] DEFAULT NULL
)
RETURNS SETOF public.questions
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT *
  FROM public.questions q
  WHERE q.status = 'approved'
    AND (_subjects IS NULL OR array_length(_subjects, 1) IS NULL OR q.subject = ANY(_subjects))
    AND (_topic_ids IS NULL OR array_length(_topic_ids, 1) IS NULL OR q.topic_id = ANY(_topic_ids))
    AND (_difficulties IS NULL OR array_length(_difficulties, 1) IS NULL OR q.difficulty = ANY(_difficulties))
    AND (_types IS NULL OR array_length(_types, 1) IS NULL OR q.question_type = ANY(_types))
    AND (_language IS NULL OR q.language = _language)
    AND (_exam IS NULL OR q.exam = _exam)
    AND (_exclude IS NULL OR array_length(_exclude, 1) IS NULL OR NOT (q.id = ANY(_exclude)))
  ORDER BY random()
  LIMIT GREATEST(_limit, 0)
$$;

GRANT EXECUTE ON FUNCTION public.pick_random_questions(integer, text[], text[], text[], text[], text, text, uuid[]) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.count_matching_questions(
  _subjects text[] DEFAULT NULL,
  _topic_ids text[] DEFAULT NULL,
  _difficulties text[] DEFAULT NULL,
  _types text[] DEFAULT NULL,
  _language text DEFAULT NULL,
  _exam text DEFAULT NULL
)
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::int
  FROM public.questions q
  WHERE q.status = 'approved'
    AND (_subjects IS NULL OR array_length(_subjects, 1) IS NULL OR q.subject = ANY(_subjects))
    AND (_topic_ids IS NULL OR array_length(_topic_ids, 1) IS NULL OR q.topic_id = ANY(_topic_ids))
    AND (_difficulties IS NULL OR array_length(_difficulties, 1) IS NULL OR q.difficulty = ANY(_difficulties))
    AND (_types IS NULL OR array_length(_types, 1) IS NULL OR q.question_type = ANY(_types))
    AND (_language IS NULL OR q.language = _language)
    AND (_exam IS NULL OR q.exam = _exam)
$$;

GRANT EXECUTE ON FUNCTION public.count_matching_questions(text[], text[], text[], text[], text, text) TO anon, authenticated, service_role;