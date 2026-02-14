// Classify job as remote/on_site/hybrid based on keywords (informational only)
function classifyWorkType(jobText) {
  if (!jobText) return "on_site";
  const text = jobText.toLowerCase();
  
  const remoteKeywords = ["remote", "work from home", "wfh", "work from anywhere", "anywhere"];
  const hybridKeywords = ["hybrid", "flexible"];
  
  for (const keyword of remoteKeywords) {
    if (text.includes(keyword)) return "remote";
  }
  
  for (const keyword of hybridKeywords) {
    if (text.includes(keyword)) return "hybrid";
  }
  
  return "on_site";
}

export default async function handler(req, res) {
  const { role, location = "Global", count = "5" } = req.query;

  if (!role) {
    return res.status(400).json({ error: "Missing role" });
  }

  const requestedCount = Math.min(Math.max(parseInt(count, 10) || 5, 2), 20);
  // Fetch more from API to account for filtering out jobs without apply links
  const fetchCount = Math.min(requestedCount * 3, 100);

  try {
    const url = "https://www.searchapi.io/api/v1/search";

    const params = new URLSearchParams({
      engine: "google",
      q: `${role} jobs ${location}`,
      api_key: process.env.SEARCHAPI_KEY,
    });
    
    // Only add location if it's not "Global"
    if (location !== "Global") {
      params.append("location", location);
    }

    const response = await fetch(`${url}?${params.toString()}`);
    const data = await response.json();

    // Normalize to { title, company, location, apply_url, snippet } for UI
    const raw = data.jobs || [];
    const jobs = raw
      .map((j) => {
        const fullText = `${j.title || ""} ${j.description || ""} ${j.snippet || ""}`;
        // Try multiple sources for apply link
        const applyUrl = j.apply_link || (j.apply_links?.[0]?.link) || j.link || j.url || null;
        return {
          title: j.title || j.job_title || "",
          company: j.company_name || j.company || "Company",
          location: j.location || location,
          apply_url: applyUrl,
          snippet: j.description?.slice(0, 200) || j.snippet || null,
          work_type: classifyWorkType(fullText),
        };
      })
      .filter((j) => j.title) // Only keep jobs with title
      .slice(0, requestedCount);

    return res.status(200).json(jobs);
  } catch (err) {
    console.error("SearchAPI error:", err);
    return res.status(500).json({ error: "Failed to fetch jobs" });
  }
}
