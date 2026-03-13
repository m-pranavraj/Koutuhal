// Calculates profile strength percentage based on required fields
export function calculateProfileStrength(profile: {
  headline?: string | null;
  skills?: string[] | null;
  education?: any[] | null;
  bio?: string | null;
  resume_url?: string | null;
}): number {
  let score = 0;
  const total = 5;
  if (profile.headline && profile.headline.trim().length > 0) score++;
  if (profile.skills && profile.skills.length >= 3) score++;
  if (profile.education && profile.education.length > 0) score++;
  if (profile.bio && profile.bio.trim().length > 0) score++;
  if (profile.resume_url && profile.resume_url.trim().length > 0) score++;
  return Math.round((score / total) * 100);
}
