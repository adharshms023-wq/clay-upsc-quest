CREATE OR REPLACE FUNCTION public.question_bank_stats()
RETURNS TABLE(subject text, difficulty text, total integer)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT q.subject, q.difficulty, count(*)::int AS total
  FROM public.questions q
  WHERE q.status = 'approved'
  GROUP BY q.subject, q.difficulty
  ORDER BY q.subject
$$;

GRANT EXECUTE ON FUNCTION public.question_bank_stats() TO anon, authenticated, service_role;