import { Database } from "@/integrations/supabase/types";


export type ApplicationStatus = Database["public"]["Enums"]["application_status"];
export type JobType = Database["public"]["Enums"]["job_type"];
export type JobStatus = Database["public"]["Enums"]["job_status"];

export type OrganizationRow = Database["public"]["Tables"]["organization_profiles"]["Row"];

export type JobRow = Database["public"]["Tables"]["jobs"]["Row"] & {
  organization_profiles: OrganizationRow | null;
  applications?: { count: number }[];
};

export type StudentProfileRow = Database["public"]["Tables"]["student_profiles"]["Row"] & {
  profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
  college_profiles?: Database["public"]["Tables"]["college_profiles"]["Row"] | null;
};

export type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"] & {
  jobs: JobRow | null;
  student_profiles: StudentProfileRow | null;
  application_activity?: any[]; // Local fallback as it's missing from types.ts
  job_match_scores?: { match_score: number }[];
};


export type InterviewRow = Database["public"]["Tables"]["interviews"]["Row"] & {
  applications: ApplicationRow | null;
};

export type OfferRow = Database["public"]["Tables"]["offers"]["Row"] & {
  applications: ApplicationRow | null;
};
