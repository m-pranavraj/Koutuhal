/**
 * Centralized error handler to map technical error messages (from Supabase, Postgres, etc.)
 * to user-friendly, actionable feedback.
 */

export const getFriendlyErrorMessage = (error: any): string => {
  if (!error) return "An unexpected error occurred. Please try again.";

  // Extract message and code from various error formats
  const message = error.message || (typeof error === 'string' ? error : "");
  const code = error.code || "";
  const status = error.status || 0;

  // ─── AUTHENTICATION ERRORS ──────────────────────────────────────────────────
  
  // Sign Up / User Conflict
  if (
    message.includes("User already registered") || 
    message.includes("User already exists") || 
    code === "user_already_exists" || 
    (status === 422 && message.includes("already registered"))
  ) {
    return "An account with this email already exists. Please sign in instead.";
  }

  // Invalid Credentials
  if (
    message.includes("Invalid login credentials") || 
    code === "invalid_credentials" ||
    message.includes("invalid claim")
  ) {
    return "Incorrect email or password. Please check your credentials and try again.";
  }

  // Weak Password
  if (
    message.includes("Password should be at least 6 characters") || 
    code === "weak_password"
  ) {
    return "Your password is too weak. It must be at least 6 characters long.";
  }

  // Email Verification
  if (message.includes("Email not confirmed")) {
    return "Your email address hasn't been verified yet. Please check your inbox for a confirmation link.";
  }

  // Multi-account / Social Link Issues
  if (message.includes("identity already exists")) {
    return "This social account is already linked to another user.";
  }

  // ─── DATABASE / CONSTRAINT ERRORS ───────────────────────────────────────────

  // Unique Violation (Postgres 23505)
  if (message.includes("unique violation") || code === "23505") {
    // Attempt to make it context-aware if possible, but fallback to general
    if (message.includes("applications_student_id_job_id_key")) {
      return "You have already applied for this position.";
    }
    return "This record already exists in our system.";
  }

  // RLS / Permission Denied
  if (message.includes("row-level security") || message.includes("permission denied") || code === "42501") {
    return "You don't have permission to perform this action.";
  }

  // Network / Persistence Issues
  if (message.includes("fetch") || message.includes("network")) {
    return "Connection error. Please check your internet and try again.";
  }

  // ─── FALLBACK ───────────────────────────────────────────────────────────────
  
  // If no friendly mapping found, clean up the message (capitalize, remove tech jargon)
  let cleanMessage = message.replace(/violation|constraint|supabase|postgres|error/gi, "").trim();
  if (!cleanMessage) return "An unexpected error occurred. Please try again.";
  
  // Ensure it starts with a capital letter
  return cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
};
