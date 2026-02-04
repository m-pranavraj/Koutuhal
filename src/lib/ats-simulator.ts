// This acts as a client-side simulation of the Python backend logic.
// In production, this would be an API call to FastAPI + OpenAI.

export interface AnalysisResult {
    score: number;
    missingKeywords: string[];
    foundKeywords: string[];
    structureScore: number;
    impactScore: number;
}

// A small dictionary of tech keywords for demonstration
const TECH_KEYWORDS = [
    "React", "TypeScript", "Node.js", "Python", "Java", "Docker", "AWS", "Kubernetes",
    "SQL", "NoSQL", "MongoDB", "PostgreSQL", "GraphQL", "REST", "API",
    "Git", "CI/CD", "Terraform", "Next.js", "Vue", "Angular", "System Design",
    "Microservices", "Testing", "Jest", "Cypress", "Machine Learning", "AI",
    "Communication", "Leadership", "Agile", "Scrum"
];

export const analyzeResume = async (resumeText: string, jdText: string): Promise<AnalysisResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const resumeLower = resumeText.toLowerCase();
    const jdLower = jdText.toLowerCase();

    // 1. Extract Keywords from JD
    // Simple heuristic: If a known keyword appears in JD, it's required.
    const requiredKeywords = TECH_KEYWORDS.filter(kw => jdLower.includes(kw.toLowerCase()));

    if (requiredKeywords.length === 0) {
        return {
            score: 80, // High baseline if no specific keywords found
            missingKeywords: [],
            foundKeywords: [],
            structureScore: 90,
            impactScore: 70
        };
    }

    // 2. Check for presence in Resume
    const missingKeywords: string[] = [];
    const foundKeywords: string[] = [];

    requiredKeywords.forEach(kw => {
        if (resumeLower.includes(kw.toLowerCase())) {
            foundKeywords.push(kw);
        } else {
            missingKeywords.push(kw);
        }
    });

    // 3. Calculate Score
    // Weight: 60% Content (Keywords), 20% Structure, 20% Impact
    const matchRatio = foundKeywords.length / requiredKeywords.length;
    let contentScore = Math.round(matchRatio * 100);

    // Impact Heuristic: Look for numbers/metrics
    const impactRegex = /\d+%|\$\d+|\d+x|increased|reduced|optimized/gi;
    const impactMatches = resumeLower.match(impactRegex);
    const impactScore = Math.min(100, (impactMatches?.length || 0) * 10 + 40); // Baseline 40

    // Structure Heuristic: Length check (simulated)
    const structureScore = resumeText.length > 500 ? 95 : 60; // Too short = bad structure

    // Weighted Total
    const totalScore = Math.round((contentScore * 0.6) + (structureScore * 0.2) + (impactScore * 0.2));

    return {
        score: totalScore,
        missingKeywords,
        foundKeywords,
        structureScore,
        impactScore
    };
};
