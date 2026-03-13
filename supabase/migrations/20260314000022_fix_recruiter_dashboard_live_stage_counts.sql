-- Fix recruiter dashboard counts to use stage precedence per application.
-- Priority: hired > offer > interview > assessment > applied/rejected.
-- This prevents accepted/offer applications from also being counted as interview.

CREATE OR REPLACE VIEW public.recruiter_dashboard AS
WITH offer_state AS (
  SELECT
    o.application_id,
    BOOL_OR(o.status = 'accepted') AS has_accepted_offer,
    BOOL_OR(o.status <> 'accepted' AND o.status <> 'rejected') AS has_active_offer
  FROM public.offers o
  GROUP BY o.application_id
),
app_stage AS (
  SELECT
    op.id AS org_id,
    op.user_id,
    a.id AS application_id,
    CASE
      WHEN COALESCE(os.has_accepted_offer, false) OR a.status = 'accepted' THEN 'hired'
      WHEN COALESCE(os.has_active_offer, false) OR a.status::text IN ('selected', 'offer') THEN 'offer'
      WHEN a.status = 'interview' THEN 'interview'
      WHEN a.status = 'assessment' THEN 'assessment'
      WHEN a.status = 'rejected' THEN 'rejected'
      ELSE 'applied'
    END AS stage
  FROM public.organization_profiles op
  LEFT JOIN public.jobs j ON j.org_id = op.id
  LEFT JOIN public.applications a ON a.job_id = j.id
  LEFT JOIN offer_state os ON os.application_id = a.id
)
SELECT
  op.id AS org_id,
  op.user_id,
  COUNT(DISTINCT j.id) AS total_jobs,
  COUNT(DISTINCT a.id) AS total_applications,
  COUNT(DISTINCT CASE WHEN s.stage = 'interview' THEN a.id END) AS total_interviews,
  COUNT(DISTINCT CASE WHEN s.stage = 'offer' THEN a.id END) AS total_offers,
  COUNT(DISTINCT CASE WHEN s.stage = 'hired' THEN a.id END) AS total_hired,
  CASE
    WHEN COUNT(DISTINCT a.id) > 0
      THEN ROUND((COUNT(DISTINCT CASE WHEN s.stage = 'hired' THEN a.id END)::DECIMAL / COUNT(DISTINCT a.id) * 100), 1)
    ELSE 0
  END AS conversion_rate
FROM public.organization_profiles op
LEFT JOIN public.jobs j ON j.org_id = op.id
LEFT JOIN public.applications a ON a.job_id = j.id
LEFT JOIN app_stage s ON s.application_id = a.id AND s.org_id = op.id
GROUP BY op.id, op.user_id;

NOTIFY pgrst, 'reload schema';
