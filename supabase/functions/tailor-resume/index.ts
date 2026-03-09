import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_INPUT_LENGTH = 15000;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { jobDescription, resumeText } = body;

    if (!jobDescription || typeof jobDescription !== "string" || !resumeText || typeof resumeText !== "string") {
      return new Response(JSON.stringify({ error: "Both jobDescription and resumeText are required as strings" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (jobDescription.length > MAX_INPUT_LENGTH || resumeText.length > MAX_INPUT_LENGTH) {
      return new Response(JSON.stringify({ error: `Input too long. Maximum ${MAX_INPUT_LENGTH} characters each.` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: `You are an expert career coach and resume writer. Your task is to tailor a resume to perfectly match a job description.

INSTRUCTIONS:
- Analyze the job description for key requirements, skills, and keywords
- Restructure and rewrite the resume to highlight relevant experience
- Use professional, achievement-oriented language with quantifiable metrics where possible
- Ensure ATS compatibility with proper formatting
- Use a clean, professional format suitable for top-tier companies
- Include relevant keywords from the job description naturally
- Keep the resume concise (ideally 1-2 pages worth of content)
- Output ONLY the tailored resume text, formatted cleanly with clear sections

FORMAT:
Use clear headers with === for sections (e.g., === PROFESSIONAL EXPERIENCE ===)
Use bullet points (•) for achievements
Include: Contact placeholder, Summary, Experience, Skills, Education sections`
          },
          {
            role: "user",
            content: `JOB DESCRIPTION:\n${jobDescription.slice(0, MAX_INPUT_LENGTH)}\n\nORIGINAL RESUME:\n${resumeText.slice(0, MAX_INPUT_LENGTH)}\n\nPlease tailor this resume to match the job description.`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI service temporarily unavailable");
    }

    const data = await response.json();
    const tailoredResume = data.choices?.[0]?.message?.content || "Unable to generate tailored resume.";

    return new Response(JSON.stringify({ tailoredResume }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("tailor-resume error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
