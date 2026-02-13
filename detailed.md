# System Architecture & Technical Deep Dive

This document provides a comprehensive overview of the **Koutuhal Pathways** system, detailing the chosen technology stack, architectural decisions, and a technical deep dive into the **ATS Resume Scorer & Builder** module.

---

## 1. Technology Stack

### A. Frontend (Client-Side)
The current application is built as a **Single Page Application (SPA)**.

*   **Core Framework**: **React 18** with **TypeScript**.
    *   *Why*: React offers a component-based architecture perfect for interactive UIs like the drag-and-drop resume builder. TypeScript ensures type safety, reducing bugs in complex data structures (like resume JSONs).
*   **Build Tool**: **Vite**.
    *   *Why*: Extremely fast hot-module replacement (HMR) compared to Webpack (Create React App).
*   **Styling**: **Tailwind CSS**.
    *   *Why*: Utility-first approach allows for rapid UI development and easy dark mode implementation (`dark:` variants).
*   **Component Library**: **shadcn/ui** (built on Radix UI).
    *   *Why*: Accessible, headless components that we fully own (updates are code-copy, not npm dependencies), allowing maximum customization.
*   **State Management**: **TanStack Query (React Query)** + React Context.
    *   *Why*: TanStack Query handles server state (caching, loading states) efficiently, while Context handles global UI state (Theme, Auth).
*   **Animations**: **Framer Motion**.
    *   *Why*: Declarative, production-ready animations (used for the "wow" factor in the UI).

**Alternative Options Considered:**
*   *Next.js*: Better for SEO and initial load (SSR). *Reason for rejection*: The current app is highly interactive (Dashboard, Resume Builder); an SPA (Vite) is simpler to host and sufficiently fast. We can migrate to Next.js if SEO becomes the #1 priority for public pages.

---

### B. Backend (Server-Side) - *Recommended*
Since the current repo is frontend-focused, the following is the *recommended* production backend architecture, specifically chosen to support the **AI/ATS features**.

*   **Language**: **Python 3.10+**.
    *   *Why*: Python is the native language of AI. Libraries like `PyPDF2`, `spacy`, `langchain`, and `numpy` make building the ATS scorer significantly easier than Node.js.
*   **Framework**: **FastAPI**.
    *   *Why*: Modern, high-performance (async support), and auto-generates Swagger documentation. It's lighter than Django but more robust than Flask.
*   **Database**:
    *   **Primary (Relational)**: **PostgreSQL**.
        *   *Why*: Structured data (Users, Courses, Orders, Resume Metadata) requires ACID compliance.
    *   **Secondary (Vector)**: **Pinecone** or **pgvector**.
        *   *Why*: To store embeddings of resumes and job descriptions for semantic matching (ATS Scoring).

**Alternative Options Considered:**
*   *Node.js/Express*: Great for I/O, but handling heavy text processing (PDF parsing, NLP) blocks the Event Loop. Python is superior for the specific requirement of an ATS Scorer.

---

## 2. Requirements & Planning

### Essential APIs & Services
To build the fully functional system, you will need:
1.  **Authentication**: Clerk, Auth0, or Firebase Auth (simplifies user management).
2.  **LLM Provider**: **Google Gemini 1.5 Pro** or **OpenAI GPT-4o**.
    *   *Usage*: For "improving" bullet points, generating summaries, and acting as the "AI Tutor".
3.  **PDF/Doc Processing**: `unstructured.io` or `PyMuPDF`.
    *   *Usage*: Extracting raw text from user-uploaded PDFs.
4.  **Storage**: AWS S3 or Supabase Storage.
    *   *Usage*: Storing profile pictures and generated PDF resumes.

---

## 3. Deep Dive: ATS Resume Scorer & Builder

This is the core differentiator. An Applicant Tracking System (ATS) Scorer mimics the bots used by companies to filter candidates.

### 3. Deep Dive: The AI Engines (ATS Resume Scorer)

#### A. Architecture Analysis: "World Class" Recommendation
The system you proposed (**Vectorization + Cosine Similarity**) is the **Gold Standard** for modern AI-based matching. It essentially replicates how a human "understands" a role rather than how a legacy regex script counts keywords.

However, to be truly "Top Notch" and differentiate Koutuhal from basic wrappers, we must add **three layers** to this logic:

| Layer | Technology | Function | Why it's "World Class" |
| :--- | :--- | :--- | :--- |
| **1. Semantic Match** | OpenAI Embeddings + Cosine Similarity | Measures *Relevance*. | Catches "React" when JD asks for "Frontend". Matches meaning. |
| **2. Structural Audit** | Layout Analysis (PyMuPDF) | Measures *Readability*. | Checks if parsing failed due to columns/graphics (A huge ATS pain point). |
| **3. Impact Scoring** | Spacy NLP (NER) | Measures *Quality*. | Detects "Action Verbs" + "Metrics" (e.g., "Increased sales by 40%"). |

#### B. The Koutuhal ATS Flow (Course Recommendation Engine)
The ultimate goal is not just to grade, but to *convert* users into learners.

1.  **Input**:
    *   **Resume**: Parsed PDF text.
    *   **Job Description (JD)**: Copied text from LinkedIn/Glassdoor.
2.  **Analysis Pipeline**:
    *   *Step 1 (Hard Skills)*: Extract Entities from JD (e.g., "Docker", "AWS"). Check logic existence in Resume. -> **Gap List**.
    *   *Step 2 (Soft Skills)*: Analyze tone/culture fit.
    *   *Step 3 (Formatting)*: Check for parsing errors.
3.  **The "Koutuhal Edge" (Recommendation)**:
    *   If `Missing Skill` == "React" OR "Next.js" $\rightarrow$ Recommend **"Advanced Frontend Patterns"** Course.
    *   If `Impact Score` < 50% $\rightarrow$ Recommend **"Resume Writing Masterclass"**.

#### C. Backend Implementation (Current State)
We have transitioned from simulation to a **Real, Dynamic Backend** using Docker.

- **Infrastructure**: One-click orchestration via `docker-compose` (FastAPI, Worker, PostgreSQL, Redis).
- **Real Extraction**: Using `text_extractor.py` and `storage.py` for real file handling.
- **Dynamic AI**: Seamless integration with OpenAI/Gemini/DeepSeek via `LLM_BASE_URL`.
- **Zero-Mocks**: All demonstration code has been cleaned to ensure production-ready logic for local auditing.
