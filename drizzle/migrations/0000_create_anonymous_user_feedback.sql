CREATE TABLE public.user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  selected_options text[] NOT NULL,
  custom_response text,
  additional_feedback text,
  anonymous_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_feedback_options_count CHECK (cardinality(selected_options) BETWEEN 1 AND 7),
  CONSTRAINT user_feedback_options_allowed CHECK (selected_options <@ ARRAY['Current Affairs','UPSC Notes','PYQ Analysis','Mains Answer Writing','Personal Progress','AI Study Assistant','Something Else']::text[]),
  CONSTRAINT user_feedback_custom_length CHECK (custom_response IS NULL OR char_length(custom_response) BETWEEN 1 AND 500),
  CONSTRAINT user_feedback_additional_length CHECK (additional_feedback IS NULL OR char_length(additional_feedback) BETWEEN 1 AND 2000),
  CONSTRAINT user_feedback_something_else_required CHECK (NOT ('Something Else' = ANY(selected_options)) OR custom_response IS NOT NULL)
);

GRANT INSERT ON public.user_feedback TO anon, authenticated;
GRANT ALL ON public.user_feedback TO service_role;

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit anonymous feedback"
ON public.user_feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (
  cardinality(selected_options) BETWEEN 1 AND 7
  AND selected_options <@ ARRAY['Current Affairs','UPSC Notes','PYQ Analysis','Mains Answer Writing','Personal Progress','AI Study Assistant','Something Else']::text[]
  AND (custom_response IS NULL OR char_length(custom_response) BETWEEN 1 AND 500)
  AND (additional_feedback IS NULL OR char_length(additional_feedback) BETWEEN 1 AND 2000)
  AND (NOT ('Something Else' = ANY(selected_options)) OR custom_response IS NOT NULL)
);

CREATE INDEX user_feedback_created_at_idx ON public.user_feedback (created_at DESC);
COMMENT ON TABLE public.user_feedback IS 'Anonymous product feedback; contains no account or contact information.';