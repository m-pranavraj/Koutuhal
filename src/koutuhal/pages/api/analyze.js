import Groq from "groq-sdk";
import { supabaseServer } from "../../lib/supabaseServer";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/** Extract JSON from AI response (handles markdown code blocks and trailing text) */
function parseJsonFromResponse(text) {
  if (!text || typeof text !== "string") return null;
  let raw = text.trim();
  
  // Try to extract from markdown code block first
  const jsonBlock = raw.match(/```(?:json|JSON)?\s*([\s\S]*?)```/);
  if (jsonBlock) {
    raw = jsonBlock[1].trim();
  }
  
  // Remove common text patterns before JSON
  raw = raw.replace(/^[^{]*/, ""); // remove text before first {
  
  // Find the first { and last }
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No valid JSON object found in response");
  }
  
  raw = raw.slice(start, end + 1);
  
  // Try to parse - any error here will be caught by caller
  const parsed = JSON.parse(raw);
  
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Parsed JSON is not an object");
  }
  
  return parsed;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      user_id,
      resume_id,
      resume_text,
      roles,          // array: [{ role: "Web Developer", job_description?: "..." }]
      career_prefs,   // { search_status, current_company, designation, previous_companies, job_profile, experience, location, previous_salary }
    } = req.body;

    if (!user_id || !resume_id || !resume_text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const rolesArr = Array.isArray(roles) ? roles : [];
    const prefs = career_prefs || {};

    // ── Build career context block ──
    const careerContext = [
      prefs.search_status   ? `Job search status: ${prefs.search_status}` : null,
      prefs.current_company ? `Current company: ${prefs.current_company}` : null,
      prefs.designation     ? `Current designation: ${prefs.designation}` : null,
      prefs.previous_companies ? `Previous companies: ${prefs.previous_companies}` : null,
      prefs.job_profile     ? `Job profile / summary: ${prefs.job_profile}` : null,
      prefs.experience      ? `Total experience: ${prefs.experience}` : null,
      prefs.location        ? `Location preferences: ${prefs.location}` : null,
      prefs.previous_salary ? `Previous salary: ${prefs.previous_salary}` : null,
    ].filter(Boolean).join("\n");

    // ── Build roles block ──
    const rolesBlock = rolesArr.length > 0
      ? rolesArr.map((r, i) => {
          let s = `${i + 1}. ${r.role}`;
          if (r.job_description) s += `\n   JD: ${r.job_description.slice(0, 2000)}`;
          return s;
        }).join("\n")
      : "Not specified";

    // ─────────────────────────────────────────────────────────
    //  MEGA-PROMPT: resume detection + ATS + role match + recs
    // ─────────────────────────────────────────────────────────
    const prompt = `
You are the world's best resume analyst, ATS expert, and career strategist with 20 years of experience at top recruiting firms (Google, McKinsey, LinkedIn Talent).

DOCUMENT TEXT (extracted from uploaded PDF):
"""
${resume_text.slice(0, 14000)}
"""

CANDIDATE-PROVIDED CAREER CONTEXT:
${careerContext || "None provided"}

TARGET ROLE(S) CANDIDATE WANTS TO APPLY FOR:
${rolesBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK — Follow these steps IN ORDER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 0 — DOCUMENT VALIDATION
IMPORTANT: The user has uploaded this as their resume. ALWAYS set "is_resume" to true UNLESS the document is clearly something completely unrelated like a restaurant menu, a novel, a math textbook, or a blank/empty document with zero text.
If there is ANY person-related content (name, skills, experience, education, projects, contact info), it IS a resume. When in doubt, treat it as a resume.

STEP 1 — ATS SCORE ANALYSIS (Applicant Tracking System)
Grade the resume on these 6 ATS dimensions (each 0–100):
• formatting: Standard section headers, clean layout, no tables/graphics/columns that break parsers
• keyword_optimization: Industry-relevant keywords, skills match, action verbs
• structure: Reverse chronological order, consistent formatting, proper sections (Summary, Experience, Education, Skills)
• quantification: Numbers, metrics, percentages in achievements (e.g. "increased revenue by 40%")
• readability: Clear language, appropriate length, no jargon overload
• completeness: All essential sections present (contact, summary, experience, education, skills, certifications if applicable)
Compute overall ATS score as weighted average: formatting 15%, keywords 25%, structure 15%, quantification 15%, readability 15%, completeness 15%.
Provide 3-5 specific ATS improvement tips.

STEP 2 — PER-ROLE MATCH ANALYSIS
CRITICAL: You must ANALYZE EVERY role listed above. Do NOT skip any. For EACH target role, provide:
• match_percentage (0–100): How well this resume matches that specific role
• verdict: One of "Strong Match", "Good Match", "Partial Match", "Weak Match"
• why_good: 2-3 sentences on why this resume IS suitable (be specific, cite resume evidence)
• why_not_good: 2-3 sentences on why this resume is NOT ideal (specific gaps)
IMPORTANT: Even if there are 5 roles listed, you MUST provide role_matches with 5 entries — one for each role, with all fields populated.
If NO target roles provided, skip this and return empty array.

STEP 3 — BEST FIT DETERMINATION
From ALL the target roles you analyzed above, pick the ONE with the highest match. This MUST be one of the roles you analyzed in STEP 2. Explain why in 2 sentences referencing specific skills or experience from the resume.

STEP 4 — STRENGTHS (exactly 5)
Resume strengths relevant to the target roles. Each strength MUST reference specific evidence from the resume text. 
Format: "Strength title — evidence/proof from resume"

STEP 5 — GAPS (exactly 5)
Specific, actionable gaps this candidate should address to better match the target roles. Be direct and useful. Reference which roles are affected if applicable.

STEP 6 — AI RECOMMENDATIONS
Analyze the candidate's skills, tools, experience, and achievements to recommend 3-5 OTHER roles (not the ones the user listed) that would be excellent fits.
For each recommendation:
- Identify specific tools, skills, or experience from the resume that match that role
- Provide role title, estimated fit score (0–100 based on resume evidence), and a detailed 1-2 sentence reason
- Focus on roles that directly leverage their existing skills and experience
- Order by fit score (highest first)
Example: If resume mentions Python, SQL, Tableau → recommend Data Analyst (80%) because of SQL + Tableau skills shown.

STEP 7 — EXECUTIVE SUMMARY
2-3 sentence professional summary of the candidate's profile and market positioning.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT — Reply with a single JSON object. NO markdown, NO code blocks, NO extra text.
CRITICAL RULES:
- role_matches MUST contain ONE entry per target role listed above (if 3 roles → 3 entries, if 2 roles → 2 entries)
- Every role_matches entry MUST have: role, match_percentage, verdict, why_good, why_not_good
- Never omit why_good or why_not_good even if it's the best match
- best_for must be one of the roles from role_matches
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "is_resume": true,
  "not_resume_reason": null,
  "ats_score": {
    "overall": 72,
    "formatting": 80,
    "keyword_optimization": 65,
    "structure": 78,
    "quantification": 60,
    "readability": 75,
    "completeness": 70,
    "tips": ["tip1", "tip2", "tip3"]
  },
  "role_matches": [
    {
      "role": "Web Developer",
      "match_percentage": 78,
      "verdict": "Good Match",
      "why_good": "...",
      "why_not_good": "..."
    }
  ],
  "best_for": {
    "role": "Frontend Developer",
    "match_percentage": 85,
    "reasoning": "..."
  },
  "strengths": ["strength1 — evidence", "strength2 — evidence", "strength3 — evidence", "strength4 — evidence", "strength5 — evidence"],
  "gaps": ["gap1", "gap2", "gap3", "gap4", "gap5"],
  "recommendations": [
    {"role": "Full Stack Developer", "score": 82, "reason": "..."},
    {"role": "DevOps Engineer", "score": 70, "reason": "..."}
  ],
  "summary": "2-3 sentence executive summary"
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are the world's top resume and ATS analyst. You output ONLY valid raw JSON — no markdown fences, no extra text, no commentary. Be brutally honest and specific in your evaluations.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.15,
      max_tokens: 8000,
    });

    const aiText = completion.choices?.[0]?.message?.content;
    if (aiText == null || typeof aiText !== "string") {
      console.error("Groq returned no content:", completion);
      return res.status(500).json({ error: "AI returned no content" });
    }

    let analysis;
    try {
      analysis = parseJsonFromResponse(aiText);
    } catch (e) {
      console.error("JSON parsing failed:", e.message);
      console.error("AI response (first 1000 chars):", aiText.slice(0, 1000));
      return res.status(500).json({ 
        error: "AI response was not valid JSON", 
        details: e.message,
        raw: aiText.slice(0, 300) 
      });
    }
    if (!analysis || typeof analysis !== "object") {
      console.error("Analysis is not a valid object:", analysis);
      return res.status(500).json({ error: "AI response was not valid JSON", details: "Result is not an object" });
    }

    // ── Normalize fields — FORCE is_resume=true unless text was truly empty ──
    const hasContent = resume_text && resume_text.trim().length > 50;
    const is_resume = hasContent ? true : (analysis.is_resume !== false);
    const not_resume_reason = analysis.not_resume_reason || null;
    const ats_score = analysis.ats_score && typeof analysis.ats_score === "object" ? analysis.ats_score : null;
    const role_matches = Array.isArray(analysis.role_matches) ? analysis.role_matches : [];
    const best_for = analysis.best_for && typeof analysis.best_for === "object" ? analysis.best_for : null;
    const strengths = Array.isArray(analysis.strengths) ? analysis.strengths : [];
    const gaps = Array.isArray(analysis.gaps) ? analysis.gaps : [];
    const recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];
    const summary = analysis.summary || "";

    // Legacy compat: compute a single top-level score from ATS overall
    const score = ats_score?.overall ?? 0;
    const better_roles = recommendations.map((r) => ({
      role: r.role,
      score: r.score,
    }));

    // ── Save to Supabase ──
    const roleStr = rolesArr.map((r) => r.role).join(", ");
    const jdStr = rolesArr[0]?.job_description || null;

    const { data: saved, error: saveError } = await supabaseServer
      .from("analyses")
      .insert([
        {
          user_id,
          resume_id,
          role: roleStr,
          job_description: jdStr,
          score,
          strengths,
          gaps,
          better_roles,
        },
      ])
      .select()
      .single();

    if (saveError) throw saveError;

    // ── Return full analysis ──
    return res.status(200).json({
      analysis_id: saved.id,
      is_resume,
      not_resume_reason,
      ats_score,
      role_matches,
      best_for,
      strengths,
      gaps,
      recommendations,
      summary,
      score,
      better_roles,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Analysis failed", details: err?.message ?? String(err) });
  }
}
