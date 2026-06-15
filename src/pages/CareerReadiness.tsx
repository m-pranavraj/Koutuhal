import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    FileText,
    Target,
    Search,
    Briefcase,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Plus,
    X,
    Loader2,
    TrendingUp,
    Brain,
    ShieldCheck,
    Star,
    Wand2,
    CheckCircle,
    ArrowRight,
    Copy,
    Download,
    RefreshCw,
    Linkedin,
    Sparkles,
    GraduationCap,
    Award,
    Check,
    BookOpen,
    Video,
    Camera,
    Mic,
    Volume2,
    VolumeX,
    UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import ResumeTailorPanel from "@/components/jobs/ResumeTailorPanel";
import { Job } from "@/types";

// --- Types ---
interface RoleItem {
    role: string;
    job_description: string;
}

interface AnalysisResult {
    is_resume: boolean;
    not_resume_reason: string | null;
    ats_score: {
        overall: number;
        formatting: number;
        keyword_optimization?: number;
        structure?: number;
        quantification?: number;
        readability?: number;
        completeness?: number;
        tips: string[];
    };
    role_matches: Array<{
        role: string;
        match_percentage: number;
        verdict: string;
        why_good: string;
        why_not_good: string;
    }>;
    best_for: {
        role: string;
        match_percentage: number;
        reasoning: string;
    };
    strengths: string[];
        gaps: string[];
    recommendations: Array<{
        role: string;
        score: number;
        reason: string;
    }>;
    summary: string;
    missing_skills?: Array<{ name: string; type: string }>;
    bullet_rewrites?: Array<{ original: string; rewritten: string }>;
}

// ─── LOCAL QUESTION BANK ─────────────────────────────────────────────────
// All 200 questions generated locally — no API call needed for static templates

const BEHAVIORAL_TEMPLATES = [
  "Tell me about yourself and your journey to becoming a {role}.",
  "Why do you want to work as a {role} at our company?",
  "Describe a time when you faced a major obstacle as a {role} and how you overcame it.",
  "Tell me about a project you worked on as a {role} that you are most proud of.",
  "Describe a situation where you had to work with a difficult coworker or stakeholder.",
  "How do you handle tight deadlines or high-pressure situations in your work?",
  "Tell me about a mistake you made as a {role} and what you learned from it.",
  "How do you prioritize your tasks when you have multiple competing deadlines?",
  "Describe a time when you had to learn a new tool or technology quickly to complete a task.",
  "How do you handle constructive criticism or negative feedback on your work?",
  "Tell me about a time you went above and beyond your standard duties as a {role}.",
  "How do you explain complex technical concepts to non-technical team members?",
  "Describe a time you had to persuade someone to see your point of view or accept your idea.",
  "Tell me about a time you had to manage a project with vague or changing requirements.",
  "How do you stay motivated during repetitive or less interesting tasks?",
  "Describe a time when you had a disagreement with your manager and how you resolved it.",
  "Tell me about a time you had to make a quick decision without all the information you wanted.",
  "How do you ensure quality and accuracy in your work as a {role}?",
  "Describe a time you had to work in a cross-functional team. What was your role?",
  "What is your greatest professional achievement as a {role}?",
  "Where do you see yourself in five years in your career as a {role}?",
  "What do you think is the most important skill for a successful {role}?",
  "How do you handle failure or setbacks in your projects?",
  "Describe a time when you had to take lead on a task or project. What was the outcome?",
  "Tell me about a time you helped a team member who was struggling with their work.",
  "How do you manage stress and maintain a healthy work-life balance?",
  "Describe a time you had to adapt to a major change in your workplace or project structure.",
  "What is your approach to setting and achieving professional goals?",
  "Tell me about a time you had to handle an unhappy client or customer.",
  "How do you ensure you stay up-to-date with industry trends and developments as a {role}?",
  "Describe a time you had to collaborate with someone whose working style was very different from yours.",
  "What motivated you to pursue a career as a {role}?",
  "Tell me about a time you resolved a conflict within your team.",
  "How do you handle situations where you do not know the answer to a problem?",
  "Describe a time you proposed an innovative solution that improved a workflow or product.",
  "Tell me about a time you had to work with a teammate who was not pulling their weight.",
  "How do you maintain a positive attitude during challenging projects?",
  "Describe a time you had to deliver bad news to a stakeholder or team lead.",
  "What is your ideal work environment or company culture?",
  "Tell me about a time you had to balance short-term tasks with long-term strategic goals.",
  "How do you handle ambiguity in your daily tasks as a {role}?",
  "Describe a time when you successfully onboarded or mentored a junior colleague.",
  "What do you find most rewarding about your work as a {role}?",
  "Tell me about a time you had to present your work to senior management.",
  "How do you handle context switching between multiple projects?",
  "Describe a time when you had to compromise on your ideal solution to meet a business constraint.",
  "What is your strategy for managing your daily energy and productivity?",
  "Tell me about a time you noticed a process inefficiency and took steps to fix it.",
  "How do you approach building trust and rapport with new team members?",
  "Describe a time you had to work with data or systems you were not familiar with."
];

const SYSTEM_TEMPLATES = [
  "How do you design a robust workflow or system for your daily tasks as a {role}?",
  "Describe the lifecycle of a typical project or task in your role.",
  "What methodologies (e.g. Agile, Scrum, Kanban) do you prefer for managing your work?",
  "How do you establish standard operating procedures (SOPs) or guidelines for your team?",
  "What metrics or key performance indicators (KPIs) do you track to measure your success?",
  "How do you manage documentation and knowledge sharing in your team?",
  "Describe your process for gathering requirements before starting a major task.",
  "How do you ensure compliance and security standards are met in your workflow?",
  "What tools and software do you consider essential for your workflow as a {role}?",
  "How do you handle version control or change management in your deliverables?",
  "What is your approach to system integration or cross-team collaboration workflows?",
  "How do you perform risk assessment and mitigation before launching a project?",
  "Describe how you structure your communication channels with stakeholders.",
  "How do you handle backups, recovery, or rollbacks in your work?",
  "What is your process for QA, review, or double-checking work before delivery?",
  "How do you optimize a bottleneck or slow process in your workflow?",
  "Describe how you handle task delegation or collaboration in a team environment.",
  "How do you design for scalability and future growth in your projects?",
  "What is your strategy for managing dependencies or external vendors in a project?",
  "How do you conduct post-mortem or retrospective reviews after a project finishes?",
  "What is your approach to budget or resource allocation for your tasks?",
  "Describe how you handle escalations when a workflow or system breaks down.",
  "How do you align your daily workflows with the overall business objectives?",
  "What is your method for tracking progress and reporting it to managers?",
  "How do you handle technical debt or process debt in your daily operations?",
  "Describe your approach to user testing or client feedback incorporation.",
  "How do you ensure design consistency or standards across all deliverables?",
  "What is your process for onboarding a new tool or platform into your workflow?",
  "How do you design disaster recovery or contingency plans for your projects?",
  "What role does automation play in your workflow, and how do you implement it?",
  "How do you balance speed of delivery with high-quality standards?",
  "Describe how you structure your files, data, or code repositories for collaboration.",
  "How do you manage access control, permissions, or confidentiality in your projects?",
  "What is your method for conducting research before proposing a new system?",
  "How do you handle legacy systems, outdated processes, or technical debt?",
  "Describe your approach to standardization vs. customization in your solutions.",
  "How do you monitor system health, performance, or output quality over time?",
  "What is your protocol for releasing updates or deploying changes?",
  "How do you design a feedback loop to continuously improve your workflows?",
  "Describe your strategy for scaling a service or operation under heavy demand.",
  "How do you handle data management, storage, and retrieval in your projects?",
  "What is your approach to modularity and reusability in your work deliverables?",
  "How do you design workflows that are accessible and inclusive?",
  "Describe your method for testing corner cases or edge-case failures.",
  "How do you handle capacity planning or future resource forecasting?",
  "What is your protocol for security breaches or data leaks in your domain?",
  "How do you ensure cross-platform or cross-device compatibility in your outputs?",
  "Describe your approach to refactoring or optimizing existing systems.",
  "How do you align technical architecture with user experience requirements?",
  "What is your philosophy on build vs. buy decisions for tools and platforms?"
];

const SCENARIO_TEMPLATES = [
  "What would you do if a critical system or workflow failed right before a major launch?",
  "If a client requests a sudden change in requirements halfway through, how do you manage it?",
  "How would you handle a situation where two senior stakeholders give you conflicting directions?",
  "If you find a major error in a colleague's completed work, how do you address it?",
  "How do you react if you realize you cannot meet a committed deadline for a key deliverable?",
  "If you are asked to implement a solution you strongly disagree with, how do you handle it?",
  "What would you do if a tool or service you rely on went down during critical operations?",
  "If your project budget is suddenly cut by 30%, how do you adjust your strategy?",
  "How would you handle a team member who refuses to adopt a new process or tool?",
  "If you suspect a security or data privacy breach in your project, what steps do you take?",
  "What do you do if your deliverables are dependent on another team that is delaying you?",
  "If a feature or service you launched receives highly negative feedback, how do you respond?",
  "How would you handle being assigned a task with no documentation or guidelines?",
  "If you notice a sudden drop in performance metrics, how do you troubleshoot the issue?",
  "What would you do if you discovered a critical bug or flaw in production or live operations?",
  "If a customer or user reports a blocker issue that you cannot replicate, how do you debug it?",
  "How do you handle a situation where your manager asks you to do something unethical?",
  "If you are overwhelmed with 5 urgent tasks simultaneously, how do you manage your time?",
  "What would you do if you ran out of storage or resources during a critical data run?",
  "If a key team member leaves unexpectedly in the middle of a project, how do you adapt?",
  "How would you handle a client who refuses to pay or claims the work is unsatisfactory?",
  "If you make a mistake that causes a temporary outage or delay, how do you recover?",
  "What would you do if a proposed solution violates a technical or design constraint?",
  "If you are asked to estimate a timeline for a project with many unknown variables, how do you proceed?",
  "How would you handle a stakeholder who constantly bypasses communication channels?",
  "If your presentation deck or demo fails to load during a live meeting, how do you handle it?",
  "What do you do if you notice a teammate is experiencing severe burnout?",
  "If you find out a competitor has launched a product that makes your project obsolete, what do you suggest?",
  "How would you handle a dispute over intellectual property or code ownership?",
  "If you are asked to work overtime persistently to meet a deadline, how do you handle it?",
  "What would you do if a critical vendor goes out of business in the middle of a project?",
  "If you are assigned a role on a project where you have zero interest or matching skills, how do you handle it?",
  "How do you handle a situation where a client asks for free out-of-scope work (scope creep)?",
  "What would you do if you found out your project violates a new government regulation?",
  "If a key tool is deprecating an API you heavily rely on, how do you plan the migration?",
  "How would you handle a team lead who micromanages your daily tasks?",
  "If a coworker takes credit for your work or ideas, how do you address the situation?",
  "What do you do if you realize you gave an incorrect answer or data point in a major meeting?",
  "If you have to choose between a perfect, slow solution and a fast, hacky solution, how do you decide?",
  "How would you handle a situation where your teammate is using outdated methodologies?",
  "What would you do if a user interface or dashboard you built is deemed inaccessible to disabled users?",
  "If your model or analysis starts drifting and giving inaccurate results over time, how do you fix it?",
  "How do you handle a code or configuration merge conflict that breaks the main branch?",
  "What would you do if you found out a critical dependency is no longer maintained?",
  "If your database or system experiences a sudden surge of spam requests, how do you mitigate it?",
  "How would you handle a client who has extremely unrealistic expectations of AI/tech capabilities?",
  "What do you do if your project is cancelled after months of hard work?",
  "If you notice another department is duplicating your efforts, how do you address it?",
  "How would you handle a critical team member who constantly shows up late to standups?",
  "What would you do if you lost internet connection during a critical live release or event?"
];

const TECH_TECHNICAL = [
  "What is your approach to writing clean, maintainable, and self-documenting code?",
  "Explain the difference between SQL and NoSQL databases, and when you would use each.",
  "How do you design, build, and document a secure RESTful API?",
  "What is the difference between synchronous and asynchronous programming, and when is async needed?",
  "Describe the Git workflow you use for collaborative code development.",
  "What is CI/CD, and how do you set up an automated deployment pipeline?",
  "How do you optimize database queries and indexes to improve performance?",
  "Explain the concepts of containerization (Docker) and orchestration (Kubernetes).",
  "What is your approach to unit testing, integration testing, and mock objects?",
  "How do you handle state management in complex frontend applications?",
  "What is serverless computing, and what are its pros and cons?",
  "Explain MVC architecture and how it supports separation of concerns.",
  "How do you protect applications against common vulnerabilities like SQL injection and XSS?",
  "What is your strategy for debugging a memory leak in a running application?",
  "Explain the difference between Monolithic and Microservices architectures.",
  "How do you implement authentication and authorization (e.g. JWT, OAuth) securely?",
  "What is your approach to error handling, logging, and application monitoring?",
  "Explain the concept of caching (e.g. Redis) and how you design cache invalidation.",
  "What is the difference between REST, GraphQL, and gRPC?",
  "How do you optimize front-end performance (e.g. bundle splitting, lazy loading)?",
  "Explain object-oriented programming (OOP) principles vs. functional programming.",
  "What is your process for conducting code reviews and giving feedback?",
  "How do you design a database schema to support many-to-many relationships?",
  "Explain the HTTP protocol, status codes, and standard request/response headers.",
  "What is CORS, and how do you configure it securely in backend systems?",
  "How do you handle database migrations safely without causing downtime?",
  "What are design patterns, and can you explain one you use frequently?",
  "How do you handle API versioning and deprecation?",
  "Explain horizontal vs. vertical scaling and how to implement each.",
  "What is a message broker (e.g. RabbitMQ, Kafka), and when would you use it?",
  "How do you secure secrets, API keys, and environment variables?",
  "Explain DNS, SSL/TLS handshakes, and how HTTPS works.",
  "What is your strategy for writing high-performance Javascript or Python code?",
  "How do you structure CSS or styling in large-scale React projects?",
  "Explain semantic HTML5 and why accessibility (a11y) is important.",
  "How do you write reusable components and design systems?",
  "What is rate limiting, and how do you implement it in an API?",
  "Explain database transaction isolation levels and ACID properties.",
  "How do you handle file uploads, storage, and CDNs securely?",
  "What is the difference between client-side rendering (CSR) and server-side rendering (SSR)?",
  "Explain web sockets and how they facilitate real-time communication.",
  "How do you profile application performance to find bottlenecks?",
  "What is the role of a reverse proxy (e.g. Nginx) and load balancers?",
  "Explain browser storage mechanisms: cookies, localStorage, and sessionStorage.",
  "How do you handle background jobs and cron queues in backend applications?",
  "Explain the concept of reactivity and virtual DOM in modern frameworks.",
  "How do you implement search capabilities (e.g. full-text search, Elasticsearch)?",
  "What is your approach to data serialization (e.g. JSON, Protocol Buffers)?",
  "Explain test-driven development (TDD) and its advantages.",
  "How do you keep dependencies updated and secure in your projects?"
];

const DATA_TECHNICAL = [
  "What is the difference between supervised and unsupervised machine learning?",
  "Explain the bias-variance tradeoff and how you prevent overfitting.",
  "What is your workflow for cleaning, preprocessing, and transforming raw data?",
  "Explain how database indexes work in SQL and how you optimize query times.",
  "What is a Pandas DataFrame, and how do you handle missing values in Python?",
  "Explain the difference between L1 (Lasso) and L2 (Ridge) regularization.",
  "How do you evaluate a classification model's performance (e.g. ROC, Precision, Recall)?",
  "Explain the Central Limit Theorem and its importance in data analysis.",
  "What is a confusion matrix, and when is F1-score preferred over accuracy?",
  "How do you write a complex SQL query using Joins, Group By, and CTEs?",
  "Explain the difference between K-Means clustering and Hierarchical clustering.",
  "What is feature engineering, and can you share an example of a feature you created?",
  "How do you handle imbalanced datasets (e.g. SMOTE, class weights)?",
  "Explain how Decision Trees split nodes, and what Random Forest does.",
  "What is PCA (Principal Component Analysis), and when do you use it?",
  "Explain A/B testing: how do you calculate sample size and statistical significance?",
  "What is the difference between deep learning and traditional machine learning?",
  "Describe how a Convolutional Neural Network (CNN) processes image data.",
  "What is an RNN, and how does LSTM improve gradient vanishing issues?",
  "Explain the Transformer architecture and the self-attention mechanism.",
  "How do you deploy machine learning models to production APIs?",
  "What is MLflow or DVC, and how do you track experiments?",
  "Explain the difference between batch data processing and real-time stream processing.",
  "What is Hadoop, Spark, and when is Big Data tooling actually needed?",
  "How do you explain a complex data model to business stakeholders?",
  "Explain cross-validation and why it is crucial for model validation.",
  "What is a statistical p-value, and how do you interpret hypothesis tests?",
  "Explain linear regression assumptions and how you check for homoscedasticity.",
  "What is logistic regression, and how do you interpret its odds ratios?",
  "Explain gradient descent and how learning rate adjustments affect training.",
  "What is hyperparameter tuning, and what are Grid Search vs. Random Search?",
  "How do you perform text tokenization, TF-IDF, and word embeddings in NLP?",
  "Explain time-series analysis: what are seasonality, trend, and ARIMA models?",
  "What is data normalization vs. standardization, and when to use each?",
  "How do you build interactive data dashboards (e.g. Tableau, PowerBI, Streamlit)?",
  "Explain database normalization levels (1NF, 2NF, 3NF) and why they matter.",
  "What is a vector database (e.g. Pinecone, Milvus), and when is it used?",
  "Describe retrieval-augmented generation (RAG) and how it enhances LLMs.",
  "What is fine-tuning an LLM vs. prompt engineering?",
  "How do you audit models for algorithmic bias and data fairness?",
  "What is an ETL pipeline, and what orchestration tools (e.g. Airflow) do you use?",
  "Explain dimensional modeling: facts vs. dimension tables in data warehousing.",
  "What is the difference between a Data Lake and a Data Warehouse?",
  "How do you perform outlier detection and handle anomalies in data?",
  "Explain correlation vs. causation and how to establish causal links.",
  "What is your approach to exploratory data analysis (EDA) on a new dataset?",
  "Explain confidence intervals and how to calculate them.",
  "How do you secure sensitive data and comply with GDPR/HIPAA regulations?",
  "What is data virtualization, and how does it differ from ETL?",
  "How do you ensure data quality and schema consistency in data pipelines?"
];

const DESIGN_TECHNICAL = [
  "What is the difference between UI (User Interface) and UX (User Experience)?",
  "Describe your user research process before sketching any design layouts.",
  "Explain the core principles of visual hierarchy and how you direct user attention.",
  "How do you establish a design system or component library in Figma?",
  "What is your approach to responsive design and designing across multiple devices?",
  "Explain color theory and how you choose cohesive color palettes for digital products.",
  "How do you ensure your web designs comply with WCAG 2.1 accessibility standards?",
  "What is typography hierarchy, and how do you choose typefaces for readability?",
  "Describe how you conduct usability testing and gather feedback on a prototype.",
  "What is information architecture, and how do you design user flow diagrams?",
  "Explain the difference between wireframes, mockups, and interactive prototypes.",
  "How do you design for different states of an interface (e.g. empty, loading, error)?",
  "What is design thinking, and how do you apply its phases to your projects?",
  "How do you handle grid systems (e.g. 8pt grid) to create layout consistency?",
  "Explain the concept of micro-interactions and how they enhance UX.",
  "How do you collaborate with software developers to ensure pixel-perfect handoff?",
  "What is a user persona, and how does it guide your design decisions?",
  "How do you design checkout flows, sign-up funnels, and landing pages for conversion?",
  "What is cognitive load, and how do you minimize it in complex application dashboards?",
  "Explain mobile-first design philosophy and its advantages.",
  "How do you use white space (negative space) to improve design readability?",
  "What is your process for wireframing a new page layout from scratch?",
  "How do you design navigation menus, search bars, and filter interfaces?",
  "Explain card sorting and how it helps design website menus.",
  "What is your approach to motion design and page transitions in prototypes?",
  "How do you design dashboards that make complex data easily understandable?",
  "What is atomic design, and how does it map to Figma components?",
  "How do you benchmark your designs against competitors or industry standards?",
  "Describe how you design forms to minimize friction and bounce rates.",
  "What is your process for designing a dark mode interface?",
  "How do you design tooltips, popups, and modal dialogs to not annoy users?",
  "What is A/B testing in design, and how do you iterate based on results?",
  "How do you design interfaces that handle multilingual translations (localization)?",
  "Explain the concept of affordance and signifiers in interface design.",
  "How do you write microcopy (UX writing) that guides user behavior?",
  "What is heuristic evaluation, and how do you audit a website for usability?",
  "How do you design search results pages that are easy to scan?",
  "Describe how you design multi-step forms (wizards) without overwhelming users.",
  "What is your method for tracking user behaviour (e.g. Hotjar heatmaps, click rates)?",
  "How do you design empty states that encourage user engagement?",
  "Explain the difference between flat design, skeuomorphism, and glassmorphism.",
  "How do you handle feedback from non-designers and business stakeholders?",
  "What is your approach to illustration, iconography, and custom image assets?",
  "How do you design onboarding flows for new users of a product?",
  "What is the role of psychology (e.g. Fitts's law, Hick's law) in UX design?",
  "How do you design notification systems and badge alerts?",
  "Describe how you design interfaces that prevent user errors.",
  "What is your process for designing responsive tables and data lists?",
  "How do you design feedback states (e.g. success checkmarks, toast alerts)?",
  "How do you keep up with design trends while maintaining usability?"
];

const MARKETING_TECHNICAL = [
  "What is the difference between inbound marketing and outbound marketing?",
  "Explain SEO (Search Engine Optimization) and how you optimize on-page content.",
  "How do you design, set up, and optimize a Google Ads or Meta Ads campaign?",
  "What is a marketing funnel (TOFU, MOFU, BOFU), and how do you address each stage?",
  "Explain email marketing optimization: how do you improve open rates and CTR?",
  "What is your approach to content strategy, blogging, and organic lead generation?",
  "Explain customer acquisition cost (CAC) and customer lifetime value (LTV).",
  "How do you use Google Analytics to track site traffic, conversions, and user behavior?",
  "What is a lead magnet, and how do you design landing pages to capture emails?",
  "Explain social media management, brand voice, and community engagement.",
  "How do you design and execute an A/B test for a marketing landing page?",
  "What is influencer marketing, and how do you evaluate potential partners?",
  "Explain CTR, CPA, CPC, CPM, and how they impact campaign budgets.",
  "How do you conduct keyword research to identify high-intent search terms?",
  "What is cold email outreach, and what is your process for writing templates?",
  "Explain CRM (Customer Relationship Management) tools and lead scoring pipelines.",
  "What is account-based marketing (ABM), and when is it preferred over broad campaigns?",
  "How do you handle brand management and public relations (PR) for a business?",
  "What is affiliate marketing, and how do you set up an affiliate program?",
  "Explain product-led growth (PLG) vs. sales-led growth models.",
  "How do you write persuasive copywriting headlines that boost conversions?",
  "What is viral marketing, and how do you design loops to encourage sharing?",
  "Explain the role of video marketing and platforms like YouTube or TikTok.",
  "How do you measure marketing ROI (Return on Investment) across channels?",
  "What is mobile marketing, app store optimization (ASO), and push alerts?",
  "Explain marketing automation and designing drip campaigns for user onboarding.",
  "How do you analyze competitor marketing strategies and traffic sources?",
  "What is your approach to event marketing, webinars, and virtual summits?",
  "Explain the difference between marketing qualified leads (MQL) and sales qualified leads (SQL).",
  "How do you handle brand positioning, messaging frameworks, and value propositions?",
  "What is conversion rate optimization (CRO), and how do you identify friction points?",
  "Explain remarketing and retargeting ads, and how they improve conversion rates.",
  "How do you comply with GDPR, CCPA, and privacy regulations in marketing databases?",
  "What is content distribution, and how do you repurpose content across platforms?",
  "Explain local SEO and how to optimize a business for local Google maps.",
  "How do you execute a product launch campaign from planning to post-launch?",
  "What is the difference between brand marketing and performance marketing?",
  "How do you conduct market segmentation and define target customer personas?",
  "Explain email deliverability, SPF, DKIM, DMARC, and avoiding spam folders.",
  "What is your approach to corporate sponsorship, partnerships, and co-marketing?",
  "Explain growth hacking and how rapid experimentation cycles drive scale.",
  "How do you write a compelling press release that journalists will publish?",
  "What is community-led growth, and how do you build a customer community?",
  "Explain social proof, testimonials, and case studies, and how to utilize them.",
  "How do you analyze customer churn and design marketing strategies to reduce it?",
  "What is customer advocacy, and how do you build a referral program?",
  "Explain user generated content (UGC) and its impact on brand trust.",
  "How do you handle social media crisis management or negative PR?",
  "What tools are in your daily marketing stack (e.g. HubSpot, SEMrush, Canva)?",
  "How do you adapt marketing campaigns to different cultures and global regions?"
];

const BUSINESS_TECHNICAL = [
  "What is your process for conducting a financial analysis or projection for a project?",
  "Explain the key financial statements: Income Statement, Balance Sheet, and Cash Flow.",
  "What is SWOT analysis, and how do you use it for strategic planning?",
  "How do you design, optimize, and document business processes or workflows?",
  "Explain change management principles and how you implement process changes in a team.",
  "What is Agile project management, and what are Scrum ceremonies?",
  "How do you perform stakeholder management and communicate progress to executives?",
  "Explain key business metrics: EBITDA, Profit Margins, ROI, and NPV.",
  "How do you manage project budgets, cost allocation, and resource forecasting?",
  "What is risk management, and how do you build a corporate risk register?",
  "Describe your approach to vendor management, negotiating contracts, and SLA reviews.",
  "What is corporate governance, compliance, and regulatory risk auditing?",
  "How do you conduct market research and competitive analysis for new operations?",
  "Explain HR recruitment pipelines, onboarding workflows, and talent acquisition.",
  "How do you design employee performance review systems and KPIs?",
  "What is employee engagement, retention strategy, and managing corporate burnout?",
  "Explain payroll management, benefits administration, and labor law compliance.",
  "What is organizational design, hierarchy structure, and span of control?",
  "How do you handle conflict resolution and employee relations in a team?",
  "What is corporate social responsibility (CSR) and its role in brand value?",
  "Explain supply chain logistics, inventory optimization, and procurement workflows.",
  "What is lean management, Six Sigma, and reducing process wastes?",
  "How do you perform data-driven decision making using business intelligence tools?",
  "Explain B2B client onboarding, account management, and CRM pipelines.",
  "What is your approach to strategic consulting and advising business leaders?",
  "How do you conduct a cost-benefit analysis for implementing a new software tool?",
  "Explain data governance, information security, and internal access control policies.",
  "What is crisis management, and how do you design business continuity plans?",
  "How do you manage cross-departmental alignment and break down corporate silos?",
  "Explain customer experience (CX) strategy and tracking Net Promoter Score (NPS).",
  "What is your method for setting annual budgets and quarterly targets?",
  "How do you audit corporate expenditures and identify cost-saving initiatives?",
  "Explain equity distribution, options pool structuring, and cap table management.",
  "What is merger and acquisition (M&A) due diligence, and what metrics do you audit?",
  "How do you manage global remote operations, timezone logistics, and virtual teams?",
  "Explain the role of business development in driving corporate partnerships.",
  "How do you build a business case to justify expanding into a new market?",
  "Explain workspace design, safety compliance, and hybrid work policies.",
  "What is performance management, and how do you implement PIPs (Performance Improvement Plans)?",
  "How do you design an internship or graduate training program for a company?",
  "Explain key metrics in SaaS business model: MRR, ARR, Churn, and LTV/CAC.",
  "How do you run a brainstorming workshop or strategic alignment session?",
  "What is intellectual property (IP) protection, patents, and trademark management?",
  "How do you manage internal corporate communications and town hall meetings?",
  "Explain operations auditing and optimizing supply chain delivery times.",
  "What is data privacy compliance under ISO 27001 or SOC 2?",
  "How do you design onboarding training manuals for customer support staff?",
  "Explain pricing strategy models: cost-plus, value-based, and subscription models.",
  "How do you handle performance analytics for campaigns from a business perspective?",
  "What is your philosophy on building vs. buying backend business infrastructure?"
];

// Pure local function — generates 200 questions for any role without any API call
const getRoleQuestions = (role: string) => {
  const roleLower = role.toLowerCase();
  let techQs: string[];
  if (["data", "machine learning", "ai", "scientist", "analyst", "intelligence", "nlp"].some(k => roleLower.includes(k))) {
    techQs = DATA_TECHNICAL;
  } else if (["design", "ux", "ui", "figma", "user", "graphics"].some(k => roleLower.includes(k))) {
    techQs = DESIGN_TECHNICAL;
  } else if (["sales", "marketing", "sdr", "account", "growth", "seo", "content", "social", "copywriter", "customer"].some(k => roleLower.includes(k))) {
    techQs = MARKETING_TECHNICAL;
  } else if (["engineer", "developer", "architect", "programmer", "devops", "cloud", "blockchain", "qa", "backend", "full stack", "scrum", "system"].some(k => roleLower.includes(k))) {
    techQs = TECH_TECHNICAL;
  } else {
    techQs = BUSINESS_TECHNICAL;
  }

  const questions: Array<{ id: string; text: string; category: string }> = [];
  BEHAVIORAL_TEMPLATES.forEach((t, i) => questions.push({ id: `behavioral-${i + 1}`, text: t.replace(/\{role\}/g, role), category: "Behavioral & Fit" }));
  techQs.forEach((t, i) => questions.push({ id: `technical-${i + 1}`, text: t.replace(/\{role\}/g, role), category: "Technical & Domain" }));
  SYSTEM_TEMPLATES.forEach((t, i) => questions.push({ id: `system-${i + 1}`, text: t.replace(/\{role\}/g, role), category: "System & Architecture" }));
  SCENARIO_TEMPLATES.forEach((t, i) => questions.push({ id: `scenario-${i + 1}`, text: t.replace(/\{role\}/g, role), category: "Scenario & Troubleshooting" }));
  return questions;
};

const FAMOUS_ROLES = [
    "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Mobile App Developer", "DevOps Engineer", "Cloud Architect", "Data Scientist",
    "Data Analyst", "Machine Learning Engineer", "AI Engineer", "Database Administrator",
    "QA Automation Engineer", "Site Reliability Engineer (SRE)", "Solution Architect",
    "Security Analyst", "System Administrator", "Network Engineer", "Salesforce Developer",
    "Embedded Systems Engineer", "Product Manager", "Technical Product Manager (TPM)",
    "UX/UI Designer", "UX Researcher", "Product Designer", "Business Analyst",
    "IT Project Manager", "Scrum Master", "Agile Coach", "Chief Technology Officer (CTO)",
    "Engineering Manager", "Solutions Engineer", "Technical Writer", "SEO Specialist",
    "Growth Hacker", "Digital Marketer", "Social Media Manager", "Content Strategist",
    "Copywriter", "Sales Development Representative (SDR)", "Account Executive (AE)",
    "Customer Success Manager (CSM)", "Financial Analyst", "Investment Banker",
    "Accountant", "Operations Manager", "Supply Chain Analyst", "HR Specialist",
    "Talent Acquisition Specialist", "Management Consultant"
];

const CareerReadiness = () => {
    const [stage, setStage] = useState<"upload" | "results">("upload");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    // Top-level active section
    const [activeSection, setActiveSection] = useState<"resume" | "linkedin" | "qa" | "interview">("resume");

    // Mode State
    const [mode, setMode] = useState<"resume" | "linkedin">("resume");

    // Q&A Database States
    const [qaRole, setQaRole] = useState<string>("Software Engineer");
    const [qaSearch, setQaSearch] = useState<string>("");
    const [qaCategory, setQaCategory] = useState<string>("Behavioral & Fit");
    const [qaQuestions, setQaQuestions] = useState<any[]>([]);
    const [qaQuestionsLoading, setQaQuestionsLoading] = useState<boolean>(false);
    const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
    const [expandedQuestionLoading, setExpandedQuestionLoading] = useState<boolean>(false);
    const [answersStore, setAnswersStore] = useState<Record<string, { suggested_answer: string; tips: string[] }>>({});

    // Video Mock Interview States
    const [interviewRole, setInterviewRole] = useState<string>("Software Engineer");
    const [interviewStage, setInterviewStage] = useState<"setup" | "calibrating" | "running" | "evaluating" | "completed">("setup");
    const [webcamActive, setWebcamActive] = useState<boolean>(false);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [faceMeshLoaded, setFaceMeshLoaded] = useState<boolean>(false);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
    const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);
    const [spokenAnswers, setSpokenAnswers] = useState<Array<{ question: string; answer: string }>>([]);
    const [transcribing, setTranscribing] = useState<boolean>(false);
    const [transcript, setTranscript] = useState<string>("");
    const [calibrated, setCalibrated] = useState<boolean>(false);
    const [calibrationBaseline, setCalibrationBaseline] = useState<any>(null);
    const [evaluatingLoading, setEvaluatingLoading] = useState<boolean>(false);
    const [evaluationResult, setEvaluationResult] = useState<any>(null);

    // Dynamic metrics
    const [liveMetrics, setLiveMetrics] = useState({
        eyeContact: true,
        headStability: true,
        posture: true
    });
    const [trackingMetrics, setTrackingMetrics] = useState({
        eyeContactFrames: 0,
        headStabilityFrames: 0,
        postureFrames: 0,
        totalFrames: 0
    });

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        resumeFile: null as File | null,
    });
    const [linkedinFile, setLinkedinFile] = useState<File | null>(null);

    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [newRole, setNewRole] = useState("");
    const [newJD, setNewJD] = useState("");

    // Result State
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [linkedinAnalysis, setLinkedinAnalysis] = useState<any | null>(null);
    const [resumeText, setResumeText] = useState("");
    const [jobs, setJobs] = useState<any[]>([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [jobsRequested, setJobsRequested] = useState(false);
    const [isTailorOpen, setIsTailorOpen] = useState(false);
    const [tailorJobIdx, setTailorJobIdx] = useState(0);

    // Active Results Tab
    const [activeTab, setActiveTab] = useState<string>("ats");

    // Interactive Skills Gap Adder
    const [addedSkills, setAddedSkills] = useState<string[]>([]);

    // Cover Letter State
    const [coverLetter, setCoverLetter] = useState<string>("");
    const [coverLetterTips, setCoverLetterTips] = useState<string[]>([]);
    const [coverLetterLoading, setCoverLetterLoading] = useState<boolean>(false);

    // Bullet Rewriter State
    const [customBullet, setCustomBullet] = useState<string>("");
    const [rewrittenBullet, setRewrittenBullet] = useState<string>("");
    const [rewritingBullet, setRewritingBullet] = useState<boolean>(false);

    // --- Handlers ---
    const addRoleItem = () => {
        if (newRole.trim()) {
            setRoles([...roles, { role: newRole.trim(), job_description: newJD.trim() }]);
            setNewRole("");
            setNewJD("");
        }
    };

    const removeRoleItem = (index: number) => {
        setRoles(roles.filter((_, i) => i !== index));
    };
    const fetchRecommendedJobs = async (roleQuery: string) => {
        if (!roleQuery) return;
        setJobsLoading(true);
        setJobsRequested(true);
        try {
            const res = await fetch(`/api/v1/career/jobs?role=${encodeURIComponent(roleQuery)}&location=Remote&num_pages=1`);
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            } else {
                console.error("Job fetch failed:", res.status);
            }
        } catch (err) {
            console.error("Job fetch failed", err);
        } finally {
            setJobsLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === "linkedin") {
            if (!formData.name || !formData.email || !linkedinFile) {
                toast.error("Please fill in your name, email, and upload your LinkedIn PDF profile.");
                return;
            }

            setLoading(true);
            setStatus("AI is auditing your LinkedIn profile...");

            try {
                const uploadFormData = new FormData();
                uploadFormData.append("name", formData.name);
                uploadFormData.append("email", formData.email);
                if (roles.length > 0) {
                    uploadFormData.append("role", roles[0].role);
                }
                uploadFormData.append("linkedin_profile", linkedinFile);

                const res = await fetch("/api/v1/career/analyze-linkedin", {
                    method: "POST",
                    body: uploadFormData,
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.detail || "Failed to analyze LinkedIn profile");
                }

                const data = await res.json();
                setLinkedinAnalysis(data);
                setStage("results");
                setActiveTab("linkedin");
                toast.success("LinkedIn profile audit complete!");
            } catch (err: any) {
                toast.error(err.message || "An unexpected error occurred during LinkedIn analysis.");
            } finally {
                setLoading(false);
            }
            return;
        }

        // Resume flow
        const finalRoles = [...roles];
        if (newRole.trim()) {
            finalRoles.push({ role: newRole.trim(), job_description: newJD.trim() });
            setRoles(finalRoles);
            setNewRole("");
            setNewJD("");
        }

        if (finalRoles.length === 0) {
            toast.error("Please add at least one target role.");
            return;
        }

        if (!formData.name || !formData.email || !formData.resumeFile) {
            toast.error("Please fill in all required fields and upload your resume.");
            return;
        }

        setLoading(true);
        setStatus("Parsing your resume...");

        try {
            const uploadFormData = new FormData();
            uploadFormData.append("name", formData.name);
            uploadFormData.append("email", formData.email);
            uploadFormData.append("phone", formData.phone);
            uploadFormData.append("role", finalRoles[0]?.role || "General");
            uploadFormData.append("resume", formData.resumeFile);
            if (finalRoles[0]?.job_description) {
                uploadFormData.append("job_description", finalRoles[0].job_description);
            }

            // 1. Upload & Parse
            const uploadRes = await fetch("/api/v1/career/upload", {
                method: "POST",
                body: uploadFormData,
            });

            if (!uploadRes.ok) throw new Error("Failed to upload resume");
            const uploadData = await uploadRes.json();

            // 2. Analyze
            setStatus("AI is analyzing your profile...");
            const analyzeRes = await fetch("/api/v1/career/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: uploadData.user_id,
                    resume_id: uploadData.resume_id,
                    resume_text: uploadData.resume_text,
                    roles: finalRoles,
                }),
            });

            if (!analyzeRes.ok) throw new Error("AI analysis failed");
            const analysisData = await analyzeRes.json();

            // 3. Fake resume guard
            if (analysisData.is_resume === false) {
                const reason = analysisData.not_resume_reason || "That doesn't look like a resume.";
                toast.error(`Oops! ${reason} Please re-upload a proper resume file.`, { duration: 6000 });
                return;
            }

            setResumeText(uploadData.resume_text || "");
            setAnalysis(analysisData);
            setAddedSkills([]);
            setStage("results");
            setActiveTab("ats");
            toast.success("Resume analysis complete!");
            
            // Auto-generate cover letter if JD is present
            if (finalRoles[0]?.job_description?.trim()) {
                handleGenerateCoverLetter(
                    uploadData.resume_text || "",
                    finalRoles[0].job_description,
                    finalRoles[0].role
                );
            }

        } catch (err: any) {
            toast.error(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCoverLetter = async (textOverride?: string, jdOverride?: string, roleOverride?: string) => {
        const textToUse = textOverride || resumeText;
        if (!textToUse) {
            toast.error("Please upload a resume first.");
            return;
        }

        const primaryJD = jdOverride || roles[0]?.job_description || "";
        if (!primaryJD.trim()) {
            toast.error("A Job Description (JD) is required to generate a tailored cover letter.");
            return;
        }

        setCoverLetterLoading(true);
        try {
            const res = await fetch("/api/v1/career/generate-cover-letter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resume_text: textToUse,
                    job_description: primaryJD,
                    role_name: roleOverride || roles[0]?.role || "Target Role",
                }),
            });

            if (!res.ok) throw new Error("Failed to generate cover letter");
            const data = await res.json();
            setCoverLetter(data.cover_letter);
            setCoverLetterTips(data.tips || []);
            toast.success("Cover letter generated successfully!");
        } catch (err: any) {
            toast.error(err.message || "Could not generate cover letter.");
        } finally {
            setCoverLetterLoading(false);
        }
    };

    const handleRewriteBullet = async () => {
        if (!customBullet.trim()) {
            toast.error("Please enter a bullet point to rewrite.");
            return;
        }

        setRewritingBullet(true);
        try {
            const res = await fetch("/api/v1/career/rewrite-bullet-item", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bullet: customBullet,
                    job_description: roles[0]?.job_description || "",
                }),
            });

            if (!res.ok) throw new Error("Failed to rewrite bullet");
            const data = await res.json();
            setRewrittenBullet(data.rewritten);
            toast.success("Bullet point rewritten successfully!");
        } catch (err: any) {
            toast.error(err.message || "Could not rewrite bullet point.");
        } finally {
            setRewritingBullet(false);
        }
    };

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const recognitionRef = useRef<any>(null);

    // Initial load of questions on role change
    useEffect(() => {
        if (activeSection === "qa") {
            loadQaQuestions(qaRole);
        }
    }, [qaRole, activeSection]);

    // Load dynamic scripts for MediaPipe Face Mesh & Pose
    const loadMediaPipe = async () => {
        if ((window as any).FaceMesh && (window as any).Pose) {
            setFaceMeshLoaded(true);
            return;
        }
        try {
            await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
            await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js");
            await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js");
            setFaceMeshLoaded(true);
            toast.success("AI eye, face, and full body posture tracking loaded!");
        } catch (err) {
            console.error("Failed to load MediaPipe scripts", err);
            toast.error("Failed to load tracking models.");
        }
    };

    const loadScript = (src: string) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };

    // --- Q&A Handlers --- (purely local, no API call needed for question list)
    const loadQaQuestions = (roleName: string) => {
        setQaQuestionsLoading(true);
        // Small artificial delay for smooth loading UX
        setTimeout(() => {
            const data = getRoleQuestions(roleName);
            setQaQuestions(data);
            setQaQuestionsLoading(false);
        }, 300);
    };

    const loadQuestionAnswer = async (questionText: string) => {
        const cacheKey = `${qaRole}:${questionText}`;
        if (answersStore[cacheKey]) {
            return;
        }
        setExpandedQuestionLoading(true);
        try {
            const res = await fetch("/api/v1/career/question-answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: qaRole, question: questionText }),
            });
            if (res.ok) {
                const data = await res.json();
                // Normalize: suggested_answer may be string or object
                const normalizedAnswer = typeof data.suggested_answer === 'string'
                    ? data.suggested_answer
                    : typeof data.suggested_answer === 'object'
                        ? Object.entries(data.suggested_answer).map(([k, v]) => `**${k}**: ${v}`).join('\n\n')
                        : JSON.stringify(data.suggested_answer);
                const normalizedData = { ...data, suggested_answer: normalizedAnswer };
                setAnswersStore(prev => ({
                    ...prev,
                    [cacheKey]: normalizedData
                }));
            } else {
                toast.error("Failed to fetch answer.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error fetching answer.");
        } finally {
            setExpandedQuestionLoading(false);
        }
    };

    const startSpeechRecognition = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Web Speech Recognition not supported in this browser. Please use Chrome/Safari.");
            return;
        }

        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) {}
        }

        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onstart = () => {
            setTranscribing(true);
            setTranscript("");
        };

        rec.onresult = (event: any) => {
            let interimTranscript = "";
            let finalTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setTranscript(finalTranscript || interimTranscript);
        };

        rec.onerror = (e: any) => {
            console.error("Speech recognition error:", e);
        };

        rec.onend = () => {
            setTranscribing(false);
        };

        recognitionRef.current = rec;
        try {
            rec.start();
        } catch (e) {
            console.error("Failed to start speech recognition", e);
        }
    };

    const stopSpeechRecognition = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {}
        }
        setTranscribing(false);
    };

    const speakQuestion = (text: string) => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    // --- Mock Interview Handlers --- (questions generated locally, no API needed)
    const handleStartMockInterview = async () => {
        setLoading(true);
        try {
            // Generate 200 questions locally then pick 5 random ones
            const data = getRoleQuestions(interviewRole);
            const bQs = data.filter(q => q.category.includes("Behavioral"));
            const tQs = data.filter(q => q.category.includes("Technical"));
            const syQs = data.filter(q => q.category.includes("System"));
            const scQs = data.filter(q => q.category.includes("Scenario"));

            const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
            const selected = [pick(bQs), pick(tQs), pick(syQs), pick(scQs), pick(bQs)].filter(Boolean);

            setInterviewQuestions(selected);
            setSpokenAnswers([]);
            setCurrentQuestionIdx(0);
            setTrackingMetrics({ eyeContactFrames: 0, headStabilityFrames: 0, postureFrames: 0, totalFrames: 0 });

            // Request webcam
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
                audio: true
            });
            setMediaStream(stream);
            setWebcamActive(true);
            setInterviewStage("calibrating");

            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(err => console.error("Video play error", err));
                }
            }, 300);

            // Load MediaPipe (optional - tracking enhancement)
            await loadMediaPipe();

            // Run calibration countdown
            let count = 3;
            const interval = setInterval(() => {
                count--;
                if (count <= 0) {
                    clearInterval(interval);
                    setCalibrated(true);
                    setInterviewStage("running");
                    speakQuestion(selected[0].text);
                    startSpeechRecognition();
                }
            }, 1000);

        } catch (err: any) {
            const msg = err?.name === 'NotAllowedError'
                ? "Camera access denied. Please allow camera permissions and try again."
                : err.message || "Failed to initialize webcam.";
            toast.error(msg);
            setWebcamActive(false);
            setMediaStream(null);
            setInterviewStage("setup");
        } finally {
            setLoading(false);
        }
    };

    const handleNextQuestion = () => {
        stopSpeechRecognition();
        
        const currentQ = interviewQuestions[currentQuestionIdx];
        const nextAnswers = [...spokenAnswers, { question: currentQ.text, answer: transcript || "[No spoken response captured]" }];
        setSpokenAnswers(nextAnswers);
        setTranscript("");
        
        if (currentQuestionIdx < interviewQuestions.length - 1) {
            const nextIdx = currentQuestionIdx + 1;
            setCurrentQuestionIdx(nextIdx);
            speakQuestion(interviewQuestions[nextIdx].text);
            startSpeechRecognition();
        } else {
            handleFinishInterview(nextAnswers);
        }
    };

    const handleFinishInterview = async (finalAnswers: any[]) => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
        }
        setWebcamActive(false);
        setMediaStream(null);
        stopSpeechRecognition();
        
        setInterviewStage("evaluating");
        setEvaluatingLoading(true);
        
        const t = trackingMetrics.totalFrames || 1;
        const metrics = {
            eye_contact_ratio: trackingMetrics.eyeContactFrames / t,
            head_stability_ratio: trackingMetrics.headStabilityFrames / t,
            posture_alignment_ratio: trackingMetrics.postureFrames / t
        };
        
        try {
            const res = await fetch("/api/v1/career/evaluate-interview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role: interviewRole,
                    answers: finalAnswers,
                    metrics: metrics
                })
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || "Server failed to evaluate interview.");
            }
            const data = await res.json();
            setEvaluationResult(data);
            setInterviewStage("completed");
            toast.success("Interview evaluation complete!");
        } catch (err: any) {
            console.error("Evaluation Error:", err);
            toast.error(err.message || "Interview evaluation failed. Are you sure the backend was deployed with the new routes?");
            setInterviewStage("setup");
        } finally {
            setEvaluatingLoading(false);
        }
    };

    // MediaPipe processing loop effect
    useEffect(() => {
        let activeFaceMesh: any = null;
        let activePose: any = null;
        let activeCamera: any = null;

        if (webcamActive && videoRef.current && (window as any).FaceMesh && (window as any).Pose && (interviewStage === "calibrating" || interviewStage === "running")) {
            const FaceMesh = (window as any).FaceMesh;
            const Pose = (window as any).Pose;
            const Camera = (window as any).cameraUtils?.Camera || (window as any).Camera;

            activeFaceMesh = new FaceMesh({
                locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
            });
            activeFaceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });

            activePose = new Pose({
                locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
            });
            activePose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });

            // Clear canvas only once per frame via a flag or just do it in face mesh, assuming face mesh runs first
            activeFaceMesh.onResults((results: any) => {
                if (!canvasRef.current || !videoRef.current) return;
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");
                if (!ctx) return;

                canvas.width = videoRef.current.videoWidth || 640;
                canvas.height = videoRef.current.videoHeight || 480;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.save();
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);

                if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                    const landmarks = results.multiFaceLandmarks[0];

                    ctx.strokeStyle = "#ADFF44";
                    ctx.lineWidth = 1;
                    
                    const jawOutline = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
                    ctx.beginPath();
                    jawOutline.forEach((idx, i) => {
                        const pt = landmarks[idx];
                        if (pt) {
                            const x = pt.x * canvas.width;
                            const y = pt.y * canvas.height;
                            if (i === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        }
                    });
                    ctx.closePath();
                    ctx.stroke();

                    const leftEyeCorner = landmarks[33];
                    const rightEyeCorner = landmarks[263];
                    const noseTip = landmarks[4];

                    let roll = 0;
                    let yawRatio = 1.0;
                    let eyeContact = true;
                    let headStability = true;
                    let posture = true;

                    if (leftEyeCorner && rightEyeCorner && noseTip) {
                        roll = Math.atan2(rightEyeCorner.y - leftEyeCorner.y, rightEyeCorner.x - leftEyeCorner.x) * (180 / Math.PI);
                        const distLeft = noseTip.x - leftEyeCorner.x;
                        const distRight = rightEyeCorner.x - noseTip.x;
                        if (distRight > 0) yawRatio = distLeft / distRight;

                        const leftIris = landmarks[468];
                        const rightIris = landmarks[473];
                        const leftInnerCorner = landmarks[133];
                        const rightInnerCorner = landmarks[362];

                        if (leftIris && rightIris && leftInnerCorner && rightInnerCorner) {
                            const leftEyeWidth = leftInnerCorner.x - leftEyeCorner.x;
                            const rightEyeWidth = rightEyeCorner.x - rightInnerCorner.x;
                            if (leftEyeWidth > 0 && rightEyeWidth > 0) {
                                const leftRatio = (leftIris.x - leftEyeCorner.x) / leftEyeWidth;
                                const rightRatio = (rightIris.x - rightInnerCorner.x) / rightEyeWidth;
                                if (leftRatio < 0.35 || leftRatio > 0.65 || rightRatio < 0.35 || rightRatio > 0.65) {
                                    eyeContact = false;
                                }
                            }
                        }

                        if (Math.abs(roll) > 10 || yawRatio < 0.7 || yawRatio > 1.4) headStability = false;

                        const faceSize = Math.sqrt(Math.pow(rightEyeCorner.x - leftEyeCorner.x, 2) + Math.pow(rightEyeCorner.y - leftEyeCorner.y, 2));
                        
                        if (interviewStage === "calibrating") {
                            setCalibrationBaseline({ x: noseTip.x, y: noseTip.y, size: faceSize });
                        } else if (interviewStage === "running" && calibrationBaseline) {
                            const calib = calibrationBaseline;
                            const dx = Math.abs(noseTip.x - calib.x);
                            const dy = Math.abs(noseTip.y - calib.y);
                            const sizeRatio = faceSize / calib.size;
                            if (dx > 0.1 || dy > 0.1 || sizeRatio < 0.8 || sizeRatio > 1.2) {
                                posture = false;
                            }
                        }
                    }

                    if (landmarks[468]) {
                        ctx.fillStyle = eyeContact ? "#ADFF44" : "#FF5555";
                        ctx.beginPath();
                        ctx.arc(landmarks[468].x * canvas.width, landmarks[468].y * canvas.height, 3, 0, 2 * Math.PI);
                        ctx.arc(landmarks[473].x * canvas.width, landmarks[473].y * canvas.height, 3, 0, 2 * Math.PI);
                        ctx.fill();
                    }

                    setLiveMetrics(prev => ({ ...prev, eyeContact, headStability, posture }));

                    if (interviewStage === "running") {
                        setTrackingMetrics(prev => ({
                            ...prev,
                            eyeContactFrames: prev.eyeContactFrames + (eyeContact ? 1 : 0),
                            headStabilityFrames: prev.headStabilityFrames + (headStability ? 1 : 0),
                            postureFrames: prev.postureFrames + (posture ? 1 : 0),
                            totalFrames: prev.totalFrames + 1
                        }));
                    }
                }
                ctx.restore();
            });

            activePose.onResults((results: any) => {
                if (!canvasRef.current) return;
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");
                if (!ctx) return;

                ctx.save();
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);

                if (results.poseLandmarks) {
                    const lm = results.poseLandmarks;
                    ctx.strokeStyle = "#44ADFF";
                    ctx.lineWidth = 3;
                    ctx.fillStyle = "#ADFF44";

                    const drawLine = (p1: number, p2: number) => {
                        if(lm[p1] && lm[p2] && lm[p1].visibility > 0.5 && lm[p2].visibility > 0.5) {
                            ctx.beginPath();
                            ctx.moveTo(lm[p1].x * canvas.width, lm[p1].y * canvas.height);
                            ctx.lineTo(lm[p2].x * canvas.width, lm[p2].y * canvas.height);
                            ctx.stroke();
                        }
                    }
                    const drawNode = (p: number) => {
                        if (lm[p] && lm[p].visibility > 0.5) {
                            ctx.beginPath();
                            ctx.arc(lm[p].x * canvas.width, lm[p].y * canvas.height, 4, 0, 2 * Math.PI);
                            ctx.fill();
                        }
                    }

                    // Draw body skeleton
                    drawLine(11, 12); // shoulders
                    drawLine(11, 13); // L arm
                    drawLine(13, 15);
                    drawLine(12, 14); // R arm
                    drawLine(14, 16);
                    drawLine(11, 23); // L torso
                    drawLine(12, 24); // R torso
                    drawLine(23, 24); // hips
                    
                    [11, 12, 13, 14, 15, 16, 23, 24].forEach(drawNode);
                }
                ctx.restore();
            });

            if (Camera) {
                activeCamera = new Camera(videoRef.current, {
                    onFrame: async () => {
                        if (videoRef.current) {
                            if (activeFaceMesh) await activeFaceMesh.send({ image: videoRef.current });
                            if (activePose) await activePose.send({ image: videoRef.current });
                        }
                    },
                    width: 640,
                    height: 480
                });
                activeCamera.start();
            }
        }

        return () => {
            if (activeCamera) {
                try { activeCamera.stop(); } catch (e) {}
            }
            if (activeFaceMesh) {
                try { activeFaceMesh.close(); } catch (e) {}
            }
            if (activePose) {
                try { activePose.close(); } catch (e) {}
            }
        };
    }, [webcamActive, interviewStage]);

    return (
        <div className="min-h-screen bg-black text-white career-readiness-page selection:bg-[#ADFF44] selection:text-black">

            <main className="max-w-7xl mx-auto px-4 py-32">
                {/* Top Level Suite Navigation Switcher */}
                <div className="flex justify-center mb-16">
                    <div className="inline-flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl gap-1">
                        {[
                            { id: "resume", label: "Resume Optimizer", icon: FileText },
                            { id: "linkedin", label: "LinkedIn Auditor", icon: Linkedin },
                            { id: "qa", label: "Interview Q&A Explorer", icon: BookOpen },
                            { id: "interview", label: "AI Video Mock Interview", icon: Video }
                        ].map((sec) => (
                            <button
                                key={sec.id}
                                type="button"
                                onClick={() => {
                                    setActiveSection(sec.id as any);
                                    if (sec.id === "resume") setMode("resume");
                                    if (sec.id === "linkedin") setMode("linkedin");
                                    // Stop video stream if leaving mock interview
                                    if (sec.id !== "interview" && mediaStream) {
                                        mediaStream.getTracks().forEach(track => track.stop());
                                        setWebcamActive(false);
                                        setMediaStream(null);
                                        stopSpeechRecognition();
                                        setInterviewStage("setup");
                                    }
                                }}
                                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-xl transition-all ${activeSection === sec.id ? "bg-[#ADFF44] text-black shadow-lg shadow-[#ADFF44]/20" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                            >
                                <sec.icon size={14} />
                                {sec.label}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {(activeSection === "resume" || activeSection === "linkedin") && (
                        stage === "upload" ? (
                            <motion.div
                            key="upload-stage"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            {/* Hero Header */}
                            <div className="text-center space-y-4 max-w-3xl mx-auto">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ADFF44]/10 border border-[#ADFF44]/20 text-[#ADFF44] text-xs font-bold uppercase tracking-widest mb-4"
                                >
                                    <Brain size={14} />
                                    AI-Powered Readiness Check
                                </motion.div>
                                <h1 className="text-5xl md:text-7xl font-bold font-sora tracking-tight leading-none text-white overflow-hidden">
                                    Is Your Career <br />
                                    <span className="text-[#ADFF44]">Market Ready?</span>
                                </h1>
                                <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mt-6">
                                    Upload your resume and get a professional ATS score, gap analysis, and personalized career recommendations in seconds.
                                </p>
                            </div>

                            {/* Main Interaction Area */}
                            <div className="grid lg:grid-cols-2 gap-12 items-start mt-16">
                                {/* Left: Value Props */}
                                <div className="space-y-8 py-4">
                                    <div className="grid gap-6">
                                        {[
                                            { icon: ShieldCheck, title: "ATS Optimization", desc: "Get scored by the same algorithms used by top corporate recruiters." },
                                            { icon: Target, title: "Role Alignment", desc: "See exactly how well your skills match your dream job descriptions." },
                                            { icon: TrendingUp, title: "Gap Discovery", desc: "Uncover missing skills and certifications needed to bridge the gap." }
                                        ].map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.4 + (i * 0.1) }}
                                                className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#ADFF44]/30 transition-colors"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-[#ADFF44]/10 flex items-center justify-center shrink-0 border border-[#ADFF44]/20 group-hover:scale-110 transition-transform">
                                                    <item.icon className="text-[#ADFF44]" size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                                                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="p-8 rounded-3xl premium-shell relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ADFF44]/10 blur-3xl -mr-16 -mt-16 group-hover:bg-[#ADFF44]/20 transition-all duration-500" />
                                        <div className="relative space-y-4">
                                            <div className="flex items-center gap-2 text-[#ADFF44]">
                                                <Star size={18} fill="currentColor" />
                                                <span className="text-sm font-bold tracking-widest uppercase">Premium Feature</span>
                                            </div>
                                            <h4 className="text-2xl font-bold leading-tight">Comprehensive AI Career Roadmaps</h4>
                                            <p className="text-gray-400 text-sm">Our AI doesn't just score you—it builds a step-by-step roadmap to your goal role based on current market trends.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Upload Form */}
                                <div className="form-panel p-8 md:p-10 relative overflow-hidden">
                                    <form onSubmit={handleUpload} className="space-y-6 relative z-10">
                                        {/* Mode Switcher Toggle */}
                                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mb-6">
                                            <button
                                                type="button"
                                                onClick={() => setMode("resume")}
                                                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${mode === "resume" ? "bg-[#ADFF44] text-black" : "text-gray-400 hover:text-white"}`}
                                            >
                                                Resume Optimizer
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMode("linkedin")}
                                                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${mode === "linkedin" ? "bg-[#ADFF44] text-black" : "text-gray-400 hover:text-white"}`}
                                            >
                                                LinkedIn Auditor
                                            </button>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                                                <Input
                                                    className="bg-black/50 border-white/10 focus:border-[#ADFF44] h-12 rounded-xl"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                                                <Input
                                                    type="email"
                                                    className="bg-black/50 border-white/10 focus:border-[#ADFF44] h-12 rounded-xl"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                                                {mode === "resume" ? "Target Roles & Optional JD" : "Target Roles or Industry (Optional)"}
                                            </label>
                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                                    <Input
                                                        className="bg-black/50 border-white/10 focus:border-[#ADFF44] h-12 rounded-xl"
                                                        placeholder={mode === "resume" ? "e.g., Software Engineer" : "e.g., Marketing Manager"}
                                                        value={newRole}
                                                        onChange={(e) => setNewRole(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRoleItem())}
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={addRoleItem}
                                                        className="h-12 w-12 rounded-xl bg-[#ADFF44] hover:bg-[#9BE63D] text-black shrink-0"
                                                    >
                                                        <Plus size={20} />
                                                    </Button>
                                                </div>
                                                {mode === "resume" && (
                                                    <Textarea
                                                        placeholder="Paste the Job Description (JD) here..."
                                                        className="bg-black/50 border-white/10 focus:border-[#ADFF44] min-h-[100px] rounded-xl text-sm"
                                                        value={newJD}
                                                        onChange={(e) => setNewJD(e.target.value)}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {roles.map((role, idx) => (
                                                    <div key={idx} className="role-chip px-4 py-2 rounded-xl text-xs font-bold flex flex-col gap-1 border border-[#ADFF44]/30 animate-in fade-in zoom-in duration-300 max-w-full">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="truncate">{role.role}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeRoleItem(idx)}
                                                                className="hover:text-white transition-colors shrink-0"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                        {role.job_description && mode === "resume" && (
                                                            <span className="text-[10px] text-gray-400 font-medium line-clamp-1 border-t border-[#ADFF44]/10 pt-1">
                                                                JD attached
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {mode === "resume" ? (
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Upload Resume (PDF)</label>
                                                <div
                                                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group hover:border-[#ADFF44]/50 hover:bg-[#ADFF44]/5
                            ${formData.resumeFile ? 'border-[#ADFF44]/50 bg-[#ADFF44]/5' : 'border-white/10 bg-black/40'}`}
                                                >
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        className="hidden"
                                                        id="resume-upload"
                                                        onChange={(e) => e.target.files && setFormData({ ...formData, resumeFile: e.target.files[0] })}
                                                    />
                                                    <label htmlFor="resume-upload" className="cursor-pointer space-y-4 block">
                                                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto border border-white/10 group-hover:border-[#ADFF44]/40 transition-colors">
                                                            <Upload className={`${formData.resumeFile ? 'text-[#ADFF44]' : 'text-gray-500'} group-hover:text-[#ADFF44] transition-colors`} size={28} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-lg">
                                                                {formData.resumeFile ? formData.resumeFile.name : "Click to upload resume"}
                                                            </p>
                                                            <p className="text-gray-500 text-sm italic">Maximum size 5MB • PDF Only</p>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Upload LinkedIn Profile (PDF)</label>
                                                <div
                                                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group hover:border-[#ADFF44]/50 hover:bg-[#ADFF44]/5
                            ${linkedinFile ? 'border-[#ADFF44]/50 bg-[#ADFF44]/5' : 'border-white/10 bg-black/40'}`}
                                                >
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        className="hidden"
                                                        id="linkedin-upload"
                                                        onChange={(e) => e.target.files && setLinkedinFile(e.target.files[0])}
                                                    />
                                                    <label htmlFor="linkedin-upload" className="cursor-pointer space-y-4 block">
                                                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto border border-white/10 group-hover:border-[#ADFF44]/40 transition-colors">
                                                            <Upload className={`${linkedinFile ? 'text-[#ADFF44]' : 'text-gray-500'} group-hover:text-[#ADFF44] transition-colors`} size={28} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-lg">
                                                                {linkedinFile ? linkedinFile.name : "Click to upload LinkedIn PDF"}
                                                            </p>
                                                            <p className="text-gray-500 text-sm italic">Maximum size 5MB • PDF Only</p>
                                                        </div>
                                                    </label>
                                                </div>
                                                <p className="text-[11px] text-gray-500 mt-2 ml-1 leading-relaxed">
                                                    How to get this? Go to your LinkedIn Profile page → click the <strong className="text-white">More</strong> button → select <strong className="text-white">"Save to PDF"</strong>.
                                                </p>
                                            </div>
                                        )}

                                        <Button
                                            disabled={loading}
                                            type="submit"
                                            className="w-full h-14 rounded-2xl bg-[#ADFF44] hover:bg-[#9BE63D] text-black font-bold text-lg shadow-2xl shadow-[#ADFF44]/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {loading ? (
                                                <div className="flex items-center gap-3">
                                                    <Loader2 className="animate-spin" size={20} />
                                                    <span>{status}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span>Proceed for Detailed Analysis</span>
                                                    <ChevronRight size={20} className="text-black" />
                                                </div>
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results-stage"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-10 pb-20"
                        >
                            {/* Results Topbar */}
                            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[#ADFF44] font-bold text-sm uppercase tracking-widest mb-1">
                                        <CheckCircle2 size={16} /> Results Ready
                                    </div>
                                    <h2 className="text-4xl font-bold font-sora">Intelligence Report</h2>
                                    <p className="text-gray-400">Analysis for {formData.name} • {new Date().toLocaleDateString()}</p>
                                </div>
                                <Button
                                    onClick={() => setStage("upload")}
                                    variant="outline"
                                    className="rounded-xl border-white/10 hover:bg-white/5 h-12"
                                >
                                    <X className="mr-2" size={18} /> New Analysis
                                </Button>
                            </div>
                                                      {/* Tab Switcher */}
                            {linkedinAnalysis ? (
                                <div className="flex border-b border-white/10 gap-8 mb-8 overflow-x-auto scrollbar-none">
                                    <button
                                        onClick={() => setActiveTab("linkedin")}
                                        className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === "linkedin" ? "border-[#ADFF44] text-[#ADFF44]" : "border-transparent text-gray-400 hover:text-white"}`}
                                    >
                                        <Linkedin size={16} /> LinkedIn Optimizer
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveTab("jobs");
                                            if (!jobsRequested) {
                                                fetchRecommendedJobs(roles[0]?.role || "General Professional");
                                            }
                                        }}
                                        className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === "jobs" ? "border-[#ADFF44] text-[#ADFF44]" : "border-transparent text-gray-400 hover:text-white"}`}
                                    >
                                        <Briefcase size={16} /> Job Openings
                                    </button>
                                </div>
                            ) : (
                                <div className="flex border-b border-white/10 gap-8 mb-8 overflow-x-auto scrollbar-none">
                                    {[
                                        { id: "ats", label: "ATS Score & Review", icon: ShieldCheck },
                                        { id: "skills", label: "Skills Gap & Jobs", icon: Target },
                                        { id: "cover", label: "Cover Letter", icon: FileText },
                                        { id: "rewriter", label: "Bullet Rewriter", icon: Sparkles }
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => {
                                                setActiveTab(t.id);
                                                if (t.id === "skills" && !jobsRequested) {
                                                    fetchRecommendedJobs(analysis?.best_for?.role || roles[0]?.role || "");
                                                }
                                            }}
                                            className={`pb-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === t.id ? "border-[#ADFF44] text-[#ADFF44]" : "border-transparent text-gray-400 hover:text-white"}`}
                                        >
                                            <t.icon size={16} /> {t.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Tab Contents */}
                            <div>
                                {/* LINKEDIN MODE AUDIT RESULTS (HIRATION STYLE) */}
                                {linkedinAnalysis && activeTab === "linkedin" && (
                                    <div className="space-y-10 animate-in fade-in duration-300">
                                        <div className="grid lg:grid-cols-4 gap-8">
                                            {/* Left Column: Overall Score & Summary */}
                                            <div className="lg:col-span-1 space-y-6">
                                                <Card className="p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 flex flex-col items-center text-center space-y-6 shadow-2xl relative overflow-hidden">
                                                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ADFF44] to-transparent"></div>
                                                    <h3 className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Resume Score</h3>
                                                    <div className="relative">
                                                        <svg className="w-48 h-48 transform -rotate-90">
                                                            <circle className="text-neutral-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="88" cx="96" cy="96" />
                                                            <circle
                                                                className={`${(linkedinAnalysis.overall_score || 0) > 75 ? "text-[#ADFF44]" : (linkedinAnalysis.overall_score || 0) > 50 ? "text-amber-400" : "text-red-500"} transition-all duration-1000 ease-out`}
                                                                strokeWidth="8"
                                                                strokeDasharray={2 * Math.PI * 88}
                                                                strokeDashoffset={2 * Math.PI * 88 * (1 - (linkedinAnalysis.overall_score || 0) / 100)}
                                                                strokeLinecap="round"
                                                                stroke="currentColor"
                                                                fill="transparent"
                                                                r="88" cx="96" cy="96"
                                                            />
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                                                            <span className="text-6xl font-bold font-sora score-text leading-none">{linkedinAnalysis.overall_score}</span>
                                                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mt-1">Out of 100</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                                                        {(linkedinAnalysis.overall_score || 0) >= 80 ? "Excellent profile! You're in the top percentile." : 
                                                         (linkedinAnalysis.overall_score || 0) >= 60 ? "Good start, but some critical sections need work." : 
                                                         "Your profile needs a major overhaul to get noticed."}
                                                    </p>
                                                </Card>

                                                <Card className="p-6 rounded-3xl bg-[#ADFF44]/5 border border-[#ADFF44]/15 shadow-xl">
                                                    <h4 className="text-[10px] font-black text-[#ADFF44] uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <Sparkles size={12} /> Expert Verdict
                                                    </h4>
                                                    <p className="text-sm text-neutral-300 leading-relaxed">"{linkedinAnalysis.summary}"</p>
                                                </Card>
                                            </div>

                                            {/* Right Column: Section Chips & Drill Down */}
                                            <div className="lg:col-span-3 flex flex-col gap-8">
                                                
                                                {/* Section Score Chips */}
                                                <div className="flex flex-wrap gap-3">
                                                    {Object.entries(linkedinAnalysis.sections || {}).map(([secKey, secValue]: [string, any]) => {
                                                        const scorePercent = (secValue.score / secValue.max_points) * 100;
                                                        const isPerfect = scorePercent === 100;
                                                        const isGood = scorePercent >= 75;
                                                        const isBad = scorePercent < 50;

                                                        return (
                                                            <button 
                                                                key={secKey} 
                                                                onClick={() => {
                                                                    const el = document.getElementById(`linkedin-section-${secKey}`);
                                                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                                }}
                                                                className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 hover:border-neutral-600 transition-colors group relative overflow-hidden"
                                                            >
                                                                <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full"></div>
                                                                <div className="flex flex-col text-left">
                                                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{secValue.label || secKey}</span>
                                                                    <div className="flex items-baseline gap-1 mt-0.5">
                                                                        <span className={`text-base font-black ${isPerfect ? 'text-[#ADFF44]' : isGood ? 'text-white' : isBad ? 'text-red-400' : 'text-amber-400'}`}>
                                                                            {secValue.score}
                                                                        </span>
                                                                        <span className="text-xs text-neutral-600 font-bold">/{secValue.max_points}</span>
                                                                    </div>
                                                                </div>
                                                                {isPerfect && <CheckCircle2 className="w-5 h-5 text-[#ADFF44] ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />}
                                                                {!isPerfect && isGood && <Check className="w-4 h-4 text-white ml-2 opacity-30" />}
                                                                {isBad && <AlertCircle className="w-4 h-4 text-red-500 ml-2 opacity-50" />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {/* Section Drill-downs */}
                                                <div className="space-y-6">
                                                    {Object.entries(linkedinAnalysis.sections || {}).map(([secKey, secValue]: [string, any]) => {
                                                        const scorePercent = (secValue.score / secValue.max_points) * 100;
                                                        const isPerfect = scorePercent === 100;
                                                        const isGood = scorePercent >= 75;

                                                        return (
                                                            <Card key={secKey} id={`linkedin-section-${secKey}`} className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden relative">
                                                                {/* Colored top bar based on score */}
                                                                <div className={`h-1.5 w-full ${isPerfect ? 'bg-[#ADFF44]' : isGood ? 'bg-amber-400' : 'bg-red-500'}`}></div>
                                                                
                                                                <div className="p-6">
                                                                    <div className="flex items-center justify-between mb-6">
                                                                        <div className="flex items-center gap-3">
                                                                            <h4 className="font-bold text-xl text-white">{secValue.label || secKey}</h4>
                                                                            {isPerfect && <span className="bg-[#ADFF44]/20 text-[#ADFF44] text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">Perfect</span>}
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <span className={`text-2xl font-black ${isPerfect ? 'text-[#ADFF44]' : 'text-white'}`}>{secValue.score}</span>
                                                                            <span className="text-sm font-bold text-neutral-600 ml-1">/ {secValue.max_points}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid md:grid-cols-2 gap-8">
                                                                        {/* Left: Feedback */}
                                                                        <div className="space-y-6">
                                                                            {secValue.things_right && secValue.things_right.length > 0 && secValue.things_right[0] !== "" && (
                                                                                <div className="space-y-3">
                                                                                    <h5 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                                                                        <CheckCircle2 size={12} className="text-[#ADFF44]" /> What you did well
                                                                                    </h5>
                                                                                    <ul className="space-y-2">
                                                                                        {secValue.things_right.map((tr: string, idx: number) => (
                                                                                            <li key={idx} className="text-xs text-neutral-300 leading-relaxed flex items-start gap-2">
                                                                                                <div className="w-1 h-1 rounded-full bg-[#ADFF44] mt-1.5 shrink-0"></div>
                                                                                                {tr}
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            )}

                                                                            {secValue.suggestions && secValue.suggestions.length > 0 && secValue.suggestions[0] !== "" && (
                                                                                <div className="space-y-3">
                                                                                    <h5 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                                                                        <AlertCircle size={12} className="text-amber-400" /> How to improve
                                                                                    </h5>
                                                                                    <ul className="space-y-2">
                                                                                        {secValue.suggestions.map((sug: string, idx: number) => (
                                                                                            <li key={idx} className="text-xs text-neutral-300 leading-relaxed flex items-start gap-2">
                                                                                                <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0"></div>
                                                                                                {sug}
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Right: Before / After */}
                                                                        <div className="space-y-4">
                                                                            <div className="space-y-2">
                                                                                <div className="flex items-center justify-between">
                                                                                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Original Text</span>
                                                                                </div>
                                                                                <div className="bg-black/40 border border-neutral-800 rounded-xl p-4 min-h-[80px] text-xs text-neutral-400 whitespace-pre-wrap font-mono line-clamp-4 hover:line-clamp-none transition-all">
                                                                                    {secValue.current || <span className="italic opacity-50">No content provided...</span>}
                                                                                </div>
                                                                            </div>

                                                                            <div className="space-y-2">
                                                                                <div className="flex items-center justify-between">
                                                                                    <span className="text-[10px] font-black text-[#ADFF44] uppercase tracking-widest flex items-center gap-1.5">
                                                                                        <Sparkles size={10} /> Optimized Draft
                                                                                    </span>
                                                                                    <button 
                                                                                        onClick={() => {
                                                                                            navigator.clipboard.writeText(secValue.optimized_draft);
                                                                                            toast.success("Draft copied!");
                                                                                        }}
                                                                                        className="text-neutral-500 hover:text-[#ADFF44] transition-colors"
                                                                                        title="Copy Draft"
                                                                                    >
                                                                                        <Copy size={12} />
                                                                                    </button>
                                                                                </div>
                                                                                <div className="bg-[#ADFF44]/5 border border-[#ADFF44]/20 rounded-xl p-4 min-h-[80px] text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed select-text">
                                                                                    {secValue.optimized_draft}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Card>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* RESUME MODE: ATS SCORE & REVIEW TAB */}
                                {analysis && activeTab === "ats" && (
                                    <div className="space-y-10 animate-in fade-in duration-300">
                                        <div className="grid lg:grid-cols-3 gap-8">
                                            {/* Score circular block */}
                                            <div className="lg:col-span-1 space-y-8">
                                                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-6">
                                                    <h3 className="font-bold text-gray-400 uppercase tracking-widest text-sm">Overall ATS Score</h3>
                                                    <div className="relative">
                                                        <svg className="w-48 h-48 transform -rotate-90">
                                                            <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="88" cx="96" cy="96" />
                                                            <circle
                                                                className="text-[#ADFF44] transition-all duration-1000 ease-out"
                                                                strokeWidth="8"
                                                                strokeDasharray={2 * Math.PI * 88}
                                                                strokeDashoffset={2 * Math.PI * 88 * (1 - (Math.min(100, analysis.ats_score.overall + (addedSkills.length * 3)) || 0) / 100)}
                                                                strokeLinecap="round"
                                                                stroke="currentColor"
                                                                fill="transparent"
                                                                r="88" cx="96" cy="96"
                                                            />
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0">
                                                            <span className="text-6xl font-bold font-sora score-text">
                                                                {Math.min(100, analysis.ats_score.overall + (addedSkills.length * 3))}
                                                            </span>
                                                            <span className="text-xs uppercase font-bold text-gray-500 tracking-tighter">Market Readiness</span>
                                                            {addedSkills.length > 0 && (
                                                                <span className="text-[10px] text-[#ADFF44] font-bold mt-1 bg-[#ADFF44]/10 px-2.5 py-0.5 rounded-full animate-bounce">
                                                                    +{addedSkills.length * 3} points optimized
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 w-full">
                                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                                                            <span>Formatting</span>
                                                            <span className="text-[#ADFF44]">{analysis.ats_score.formatting}/100</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full bg-[#ADFF44]" style={{ width: `${analysis.ats_score.formatting}%` }} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Tips Card */}
                                                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                                                    <h3 className="font-bold flex items-center gap-2">
                                                        <AlertCircle className="text-[#ADFF44]" size={20} />
                                                        Improvement Tips
                                                    </h3>
                                                    <ul className="space-y-4">
                                                        {analysis.ats_score.tips.map((tip, i) => (
                                                            <li key={i} className="flex gap-3 text-sm text-gray-400 leading-relaxed group">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF44]/40 mt-1.5 shrink-0 group-hover:bg-[#ADFF44] transition-colors" />
                                                                {tip}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* Strengths, Gaps, Summary, and Transparency */}
                                            <div className="lg:col-span-2 space-y-8">
                                                <div className="grid md:grid-cols-2 gap-8">
                                                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                                                        <h3 className="font-bold text-lg border-l-4 border-[#ADFF44] pl-4">Core Strengths</h3>
                                                        <div className="space-y-4">
                                                            {analysis.strengths?.map((s, i) => (
                                                                <div key={i} className="flex gap-3 text-sm bg-white/5 p-4 rounded-xl border border-white/5 hover:border-[#ADFF44]/20 transition-colors">
                                                                    <div className="text-[#ADFF44] mt-0.5"><CheckCircle2 size={16} /></div>
                                                                    <span className="text-gray-300">{s}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                                                        <h3 className="font-bold text-lg border-l-4 border-red-500 pl-4">Critical Gaps</h3>
                                                        <div className="space-y-4">
                                                            {analysis.gaps?.map((g, i) => (
                                                                <div key={i} className="flex gap-3 text-sm bg-white/5 p-4 rounded-xl border border-white/5 hover:border-red-500/20 transition-colors">
                                                                    <div className="text-red-500 mt-0.5"><AlertCircle size={16} /></div>
                                                                    <span className="text-gray-300">{g}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Summary Block */}
                                                <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                                                    <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-[#ADFF44] mb-4">Executive Summary</h3>
                                                    <p className="text-gray-400 text-lg italic leading-relaxed font-medium">"{analysis.summary}"</p>
                                                </div>

                                                {/* Transparency Grid */}
                                                <div className="space-y-4 border-t border-white/10 pt-8 mt-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-[#ADFF44]/10 flex items-center justify-center border border-[#ADFF44]/20 text-[#ADFF44]">
                                                            <Search size={20} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-2xl font-bold font-sora">Transparency Grid</h3>
                                                            <p className="text-gray-500 text-sm">Review exactly what our AI analyzed side-by-side.</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* JD Card */}
                                                        <Card className="bg-white/5 border-white/10 ring-1 ring-white/5">
                                                            <CardHeader className="pb-3 border-b border-white/5 bg-[#ADFF44]/5">
                                                                <CardTitle className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Target Job Description</CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="p-4">
                                                                <div className="max-h-[250px] overflow-y-auto text-xs text-gray-500 leading-relaxed font-mono whitespace-pre-wrap">
                                                                    {roles[0]?.job_description || "No specific JD provided. Analysis based on general market standards for this role."}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                        {/* Resume Text Card */}
                                                        <Card className="bg-white/5 border-white/10 ring-1 ring-white/5">
                                                            <CardHeader className="pb-3 border-b border-white/5 bg-[#ADFF44]/5">
                                                                <CardTitle className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Extracted Resume Text</CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="p-4">
                                                                <div className="max-h-[250px] overflow-y-auto text-xs text-gray-500 leading-relaxed font-mono">
                                                                    {resumeText || "Resume text extraction in progress..."}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* RESUME MODE: SKILLS GAP & JOB EXPLORATION TAB */}
                                {analysis && activeTab === "skills" && (
                                    <div className="space-y-10 animate-in fade-in duration-300">
                                        <div className="grid lg:grid-cols-3 gap-8 items-start">
                                            {/* Left Column: Recommendations & Best Fit */}
                                            <div className="lg:col-span-1 space-y-6">
                                                {/* Best Fit Block */}
                                                <div className="p-8 rounded-3xl bg-[#ADFF44]/5 border border-[#ADFF44]/20 relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-8 text-[#ADFF44]/20">
                                                        <Star size={80} fill="currentColor" stroke="none" />
                                                    </div>
                                                    <div className="relative space-y-4">
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ADFF44] text-black text-[10px] font-black uppercase tracking-widest">
                                                            Recommended Fit
                                                        </div>
                                                        <h3 className="text-2xl font-bold font-sora">
                                                            {analysis.best_for.role}
                                                        </h3>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-3xl font-black text-[#ADFF44]">
                                                                {Math.min(100, analysis.best_for.match_percentage + (addedSkills.length * 4))}%
                                                            </span>
                                                            <span className="text-gray-400 text-xs font-medium">Alignment Score</span>
                                                        </div>
                                                        <p className="text-gray-300 leading-relaxed text-xs italic">"{analysis.best_for.reasoning}"</p>
                                                    </div>
                                                </div>

                                                {/* Per-Role list */}
                                                <div className="space-y-4">
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Per-Role Breakdown</h4>
                                                    {analysis.role_matches?.map((match, i) => {
                                                        const matchPercentage = Math.min(100, match.match_percentage + (addedSkills.length * 4));
                                                        return (
                                                            <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 relative group">
                                                                <div className="flex justify-between items-start">
                                                                    <h5 className="font-bold text-white text-sm">{match.role}</h5>
                                                                    <span className="text-xs font-bold text-[#ADFF44] bg-[#ADFF44]/10 px-2 py-0.5 rounded-full">{matchPercentage}%</span>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-[#ADFF44]" style={{ width: `${matchPercentage}%` }} />
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] leading-relaxed">
                                                                    <p className="text-gray-400 bg-[#ADFF44]/5 p-2 rounded-lg border border-[#ADFF44]/10"><strong className="text-[#ADFF44] uppercase tracking-wide block text-[9px] mb-0.5">Strengths</strong>{match.why_good}</p>
                                                                    <p className="text-gray-400 bg-red-500/5 p-2 rounded-lg border border-red-500/10"><strong className="text-red-400 uppercase tracking-wide block text-[9px] mb-0.5">Gaps</strong>{match.why_not_good}</p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setTailorJobIdx(i);
                                                                        setIsTailorOpen(true);
                                                                    }}
                                                                    className="w-full mt-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#ADFF44] hover:text-black transition-all flex items-center justify-center gap-1.5"
                                                                >
                                                                    <Wand2 size={10} /> Tailor Resume
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Right Column: Skills Gap Adder & Jobs */}
                                            <div className="lg:col-span-2 space-y-8">
                                                {/* SKILLS GAP ADDER */}
                                                <Card className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6">
                                                    <div>
                                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                                            <Target className="text-[#ADFF44]" size={20} />
                                                            Required Skills & Gaps
                                                        </h3>
                                                        <p className="text-gray-400 text-xs mt-1">Directly add missing skills required by the JD to optimize your career profile score.</p>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Missing Required Skills</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {analysis.missing_skills && analysis.missing_skills.length > 0 ? (
                                                                analysis.missing_skills
                                                                    .filter(sk => !addedSkills.includes(sk.name))
                                                                    .map((sk, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#ADFF44]/30 transition-all"
                                                                        >
                                                                            <span className="text-xs font-medium text-gray-300">{sk.name}</span>
                                                                            <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400 font-bold uppercase tracking-wider">{sk.type}</span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setAddedSkills([...addedSkills, sk.name]);
                                                                                    toast.success(`Skill "${sk.name}" added to your profile!`);
                                                                                }}
                                                                                className="p-1 rounded bg-[#ADFF44]/10 hover:bg-[#ADFF44] text-[#ADFF44] hover:text-black transition-colors"
                                                                                title="Add Skill"
                                                                            >
                                                                                <Plus size={10} />
                                                                            </button>
                                                                        </div>
                                                                    ))
                                                            ) : (
                                                                <p className="text-xs text-gray-500 italic">No missing skills detected! Your resume is highly optimized for this target role.</p>
                                                            )}
                                                        </div>

                                                        {addedSkills.length > 0 && (
                                                            <div className="pt-4 border-t border-white/5 space-y-2">
                                                                <h4 className="text-xs font-bold text-[#ADFF44] uppercase tracking-wider">Added Skills (Profile Optimization)</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {addedSkills.map((sk, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ADFF44]/10 border border-[#ADFF44]/20 text-white animate-in zoom-in duration-200"
                                                                        >
                                                                            <span className="text-xs font-semibold text-[#ADFF44]">{sk}</span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setAddedSkills(addedSkills.filter(s => s !== sk));
                                                                                    toast.info(`Removed "${sk}" from optimized skills.`);
                                                                                }}
                                                                                className="p-0.5 rounded-full hover:bg-white/10 text-[#ADFF44]"
                                                                            >
                                                                                <X size={12} />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Card>

                                                {/* MARKET JOBS */}
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-[#ADFF44]/10 flex items-center justify-center border border-[#ADFF44]/20 text-[#ADFF44]">
                                                                <Briefcase size={20} />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-2xl font-bold font-sora">Market Jobs</h3>
                                                                <p className="text-gray-500 text-sm">Live listings matching your best fit role</p>
                                                            </div>
                                                        </div>
                                                        {jobsRequested && !jobsLoading && jobs.length > 0 && (
                                                            <span className="text-xs text-gray-500 font-medium">{jobs.length} listings found</span>
                                                        )}
                                                    </div>

                                                    {!jobsRequested ? (
                                                        <div className="p-10 flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-white/10 bg-white/3">
                                                            <Briefcase className="text-[#ADFF44]/50" size={32} />
                                                            <div className="text-center">
                                                                <p className="text-white font-bold text-base">Find Jobs for Your Profile</p>
                                                                <p className="text-gray-500 text-sm mt-1">Get live listings from LinkedIn, Indeed & Glassdoor matched to your best role</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => fetchRecommendedJobs(analysis.best_for.role || roles[0]?.role || '')}
                                                                className="px-8 py-3 rounded-xl bg-[#ADFF44] text-black font-black text-sm hover:bg-[#9BE63D] transition-all hover:scale-105 shadow-lg shadow-[#ADFF44]/20 flex items-center gap-2"
                                                            >
                                                                <Search size={15} /> Explore Live Jobs
                                                            </button>
                                                        </div>
                                                    ) : jobsLoading ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />)}
                                                        </div>
                                                    ) : jobs.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {jobs.map((job, idx) => (
                                                                <motion.div
                                                                    key={idx}
                                                                    initial={{ opacity: 0, y: 16 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: Math.min(idx * 0.04, 0.5) }}
                                                                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#ADFF44]/30 hover:bg-[#ADFF44]/5 transition-all group flex flex-col gap-3"
                                                                >
                                                                    <div className="flex justify-between items-start">
                                                                        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                                                                            {job.logo ? (
                                                                                <img src={job.logo} alt={job.company} className="w-8 h-8 rounded-lg object-contain bg-white/10 flex-shrink-0 p-0.5" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                                                            ) : (
                                                                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                                                                    <Briefcase size={13} className="text-[#ADFF44]/60" />
                                                                                </div>
                                                                            )}
                                                                            <div className="overflow-hidden">
                                                                                <h4 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-[#ADFF44] transition-colors">{job.title}</h4>
                                                                                <p className="text-[10px] text-gray-500 font-bold uppercase truncate mt-0.5">{job.company}</p>
                                                                            </div>
                                                                        </div>
                                                                        <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:bg-[#ADFF44]/20 text-gray-500 group-hover:text-[#ADFF44] transition-all flex-shrink-0 ml-2">
                                                                            <ArrowRight size={13} />
                                                                        </a>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-500 uppercase font-bold tracking-wider">{job.location}</span>
                                                                        {job.employment_type && <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#ADFF44]/10 border border-[#ADFF44]/15 text-[#ADFF44] uppercase font-bold tracking-wider">{job.employment_type.replace(/_/g, ' ')}</span>}
                                                                        {job.source && <span className="text-[9px] text-gray-600 font-medium ml-auto">via {job.source}</span>}
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-10 text-center rounded-2xl border border-dashed border-white/10 text-gray-500 text-sm italic">
                                                            No listings found. Try a different role.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* RESUME MODE: COVER LETTER TAB */}
                                {analysis && activeTab === "cover" && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        {coverLetter ? (
                                            <div className="space-y-6">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                                    <div>
                                                        <h3 className="font-bold text-lg">AI Generated Cover Letter</h3>
                                                        <p className="text-gray-400 text-xs mt-0.5">Tailored specifically for {roles[0]?.role || "Target Role"} using your resume details.</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(coverLetter);
                                                                toast.success("Cover letter copied to clipboard!");
                                                            }}
                                                            className="bg-[#ADFF44] hover:bg-[#9BE63D] text-black font-bold h-10 px-4 rounded-xl flex items-center gap-1.5"
                                                        >
                                                            <Copy size={14} /> Copy Letter
                                                        </Button>
                                                        <Button
                                                            onClick={handleGenerateCoverLetter}
                                                            disabled={coverLetterLoading}
                                                            variant="outline"
                                                            className="border-white/10 hover:bg-white/5 text-white h-10 px-4 rounded-xl flex items-center gap-1.5"
                                                        >
                                                            <RefreshCw size={14} className={coverLetterLoading ? "animate-spin" : ""} /> Regenerate
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-3 gap-6">
                                                    <Card className="md:col-span-2 bg-neutral-900/50 border border-neutral-800 p-8 rounded-3xl min-h-[500px] font-serif leading-relaxed text-gray-200 whitespace-pre-wrap select-text selection:bg-[#ADFF44] selection:text-black shadow-xl">
                                                        {coverLetter}
                                                    </Card>

                                                    <div className="space-y-6">
                                                        {/* Tips */}
                                                        <Card className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                                                            <h4 className="font-bold text-sm text-[#ADFF44] flex items-center gap-1.5 uppercase tracking-wider">
                                                                <Star size={14} fill="currentColor" stroke="none" /> Cover Letter Tips
                                                            </h4>
                                                            <ul className="space-y-3">
                                                                {coverLetterTips.map((tip, idx) => (
                                                                    <li key={idx} className="flex gap-2.5 text-xs text-gray-400 leading-relaxed">
                                                                        <div className="h-4 w-4 rounded-full bg-[#ADFF44]/10 flex items-center justify-center shrink-0 text-[#ADFF44] font-bold text-[9px]">{idx + 1}</div>
                                                                        <span>{tip}</span>
                                                                    </li>
                                                                ))}
                                                                <li className="flex gap-2.5 text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-3">
                                                                    <div className="h-4 w-4 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 text-red-500 font-bold text-[9px]">!</div>
                                                                    <span>Always verify contact details, target names, dates, and placeholders before sending.</span>
                                                                </li>
                                                            </ul>
                                                        </Card>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <Card className="p-12 flex flex-col items-center justify-center text-center gap-6 rounded-3xl border border-dashed border-white/10 bg-white/3 min-h-[400px]">
                                                <div className="w-16 h-16 rounded-2xl bg-[#ADFF44]/10 border border-[#ADFF44]/20 flex items-center justify-center text-[#ADFF44]">
                                                    <FileText size={32} />
                                                </div>
                                                <div className="max-w-md space-y-2">
                                                    <h3 className="text-xl font-bold">Write a Tailored Cover Letter</h3>
                                                    <p className="text-gray-400 text-sm leading-relaxed">
                                                        Generate a professional cover letter linking your achievements directly to the requirements of the job description.
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={handleGenerateCoverLetter}
                                                    disabled={coverLetterLoading}
                                                    className="bg-[#ADFF44] hover:bg-[#9BE63D] text-black font-black px-8 py-4 h-12 rounded-xl flex items-center gap-2 shadow-lg shadow-[#ADFF44]/10"
                                                >
                                                    {coverLetterLoading ? (
                                                        <>
                                                            <Loader2 className="animate-spin" size={16} />
                                                            <span>Writing Cover Letter...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles size={16} />
                                                            <span>Generate Tailored Cover Letter</span>
                                                        </>
                                                    )}
                                                </Button>
                                            </Card>
                                        )}
                                    </div>
                                )}

                                {/* RESUME MODE: BULLET REWRITER TAB */}
                                {analysis && activeTab === "rewriter" && (
                                    <div className="space-y-8 animate-in fade-in duration-300">
                                        {analysis.bullet_rewrites && analysis.bullet_rewrites.length > 0 ? (
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Resume Bullets Refined</h4>
                                                <div className="grid gap-4">
                                                    {analysis.bullet_rewrites.map((item, idx) => (
                                                        <div key={idx} className="p-5 rounded-2xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors grid md:grid-cols-2 gap-6 items-start">
                                                            <div className="space-y-2">
                                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Original Experience Bullet</span>
                                                                <p className="text-sm text-gray-400 leading-relaxed italic">"{item.original}"</p>
                                                            </div>
                                                            <div className="space-y-2 bg-[#ADFF44]/5 p-4 rounded-xl border border-[#ADFF44]/10 relative">
                                                                <span className="text-[10px] font-black text-[#ADFF44] uppercase tracking-widest">AI X-Y-Z Optimized Version</span>
                                                                <p className="text-sm text-gray-200 leading-relaxed font-medium">"{item.rewritten}"</p>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(item.rewritten);
                                                                        toast.success("Optimized bullet copied!");
                                                                    }}
                                                                    className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-[#ADFF44]/20 text-[#ADFF44] transition-colors"
                                                                    title="Copy to clipboard"
                                                                >
                                                                    <Copy size={12} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No original experience bullets detected for auto-rewriting.</p>
                                        )}

                                        <Card className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6">
                                            <div>
                                                <h3 className="text-lg font-bold flex items-center gap-2">
                                                    <Sparkles className="text-[#ADFF44]" size={20} />
                                                    Custom Bullet Rewriter Sandbox
                                                </h3>
                                                <p className="text-gray-400 text-xs mt-1">Paste any sentence from your experience section and let AI rewrite it using strong action verbs and metrics templates.</p>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6 items-start">
                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Experience Bullet</label>
                                                    <Textarea
                                                        placeholder="e.g., Managed a team of engineers to build a new web application and fixed bugs."
                                                        className="bg-black/50 border-white/10 focus:border-[#ADFF44] min-h-[120px] rounded-xl text-sm"
                                                        value={customBullet}
                                                        onChange={(e) => setCustomBullet(e.target.value)}
                                                    />
                                                    <Button
                                                        onClick={handleRewriteBullet}
                                                        disabled={rewritingBullet || !customBullet.trim()}
                                                        className="bg-[#ADFF44] hover:bg-[#9BE63D] text-black font-bold h-10 px-5 rounded-xl flex items-center gap-1.5"
                                                    >
                                                        {rewritingBullet ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
                                                        Rewrite Bullet Point
                                                    </Button>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Metrics-Driven Rewrite</label>
                                                    <div className="bg-black/40 border border-white/5 hover:border-white/10 rounded-xl p-5 min-h-[120px] flex flex-col justify-between relative group">
                                                        {rewrittenBullet ? (
                                                            <>
                                                                <p className="text-sm text-gray-300 leading-relaxed font-medium italic">"{rewrittenBullet}"</p>
                                                                <Button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(rewrittenBullet);
                                                                        toast.success("Rewritten bullet copied!");
                                                                    }}
                                                                    className="mt-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-bold h-9 text-xs px-3 rounded-lg flex items-center gap-1.5 self-end"
                                                                >
                                                                    <Copy size={12} /> Copy Output
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center text-center h-full py-6 text-gray-600 gap-2">
                                                                <Wand2 size={24} />
                                                                <p className="text-xs font-semibold uppercase tracking-wider">Output Sandbox</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {/* LINKEDIN MODE: JOBS EXPLORATION TAB */}
                                {linkedinAnalysis && activeTab === "jobs" && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#ADFF44]/10 flex items-center justify-center border border-[#ADFF44]/20 text-[#ADFF44]">
                                                    <Briefcase size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold font-sora">Market Jobs</h3>
                                                    <p className="text-gray-500 text-sm">Live listings matching your LinkedIn profile role</p>
                                                </div>
                                            </div>
                                            {jobsRequested && !jobsLoading && jobs.length > 0 && (
                                                <span className="text-xs text-gray-500 font-medium">{jobs.length} listings found</span>
                                            )}
                                        </div>

                                        {!jobsRequested ? (
                                            <div className="p-10 flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-white/10 bg-white/3">
                                                <Briefcase className="text-[#ADFF44]/50" size={32} />
                                                <div className="text-center">
                                                    <p className="text-white font-bold text-base">Find Jobs for Your Profile</p>
                                                    <p className="text-gray-500 text-sm mt-1">Get live listings from LinkedIn, Indeed & Glassdoor matched to your best role</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => fetchRecommendedJobs(roles[0]?.role || "General Professional")}
                                                    className="px-8 py-3 rounded-xl bg-[#ADFF44] text-black font-black text-sm hover:bg-[#9BE63D] transition-all hover:scale-105 shadow-lg shadow-[#ADFF44]/20 flex items-center gap-2"
                                                >
                                                    <Search size={15} /> Explore Live Jobs
                                                </button>
                                            </div>
                                        ) : jobsLoading ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />)}
                                            </div>
                                        ) : jobs.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {jobs.map((job, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, y: 16 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: Math.min(idx * 0.04, 0.5) }}
                                                        className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#ADFF44]/30 hover:bg-[#ADFF44]/5 transition-all group flex flex-col gap-3"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                                                                {job.logo ? (
                                                                    <img src={job.logo} alt={job.company} className="w-8 h-8 rounded-lg object-contain bg-white/10 flex-shrink-0 p-0.5" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                                                        <Briefcase size={13} className="text-[#ADFF44]/60" />
                                                                    </div>
                                                                )}
                                                                <div className="overflow-hidden">
                                                                    <h4 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-[#ADFF44] transition-colors">{job.title}</h4>
                                                                    <p className="text-[10px] text-gray-500 font-bold uppercase truncate mt-0.5">{job.company}</p>
                                                                </div>
                                                            </div>
                                                            <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:bg-[#ADFF44]/20 text-gray-500 group-hover:text-[#ADFF44] transition-all flex-shrink-0 ml-2">
                                                                <ArrowRight size={13} />
                                                            </a>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-500 uppercase font-bold tracking-wider">{job.location}</span>
                                                            {job.employment_type && <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#ADFF44]/10 border border-[#ADFF44]/15 text-[#ADFF44] uppercase font-bold tracking-wider">{job.employment_type.replace(/_/g, ' ')}</span>}
                                                            {job.source && <span className="text-[9px] text-gray-600 font-medium ml-auto">via {job.source}</span>}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-10 text-center rounded-2xl border border-dashed border-white/10 text-gray-500 text-sm italic">
                                                No listings found. Try a different role.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                        )
                    )}

                    {/* INTERVIEW Q&A DATABASE */}
                    {activeSection === "qa" && (
                        <motion.div
                            key="qa-stage"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-4 max-w-3xl mx-auto">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ADFF44]/10 border border-[#ADFF44]/20 text-[#ADFF44] text-xs font-bold uppercase tracking-widest mb-2">
                                    <BookOpen size={14} />
                                    Curated Interview Q&A Database
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold font-sora">
                                    Master Your <span className="text-[#ADFF44]">Next Interview</span>
                                </h1>
                                <p className="text-gray-400 text-sm max-w-xl mx-auto">
                                    Browse 200 most-asked interview questions with expert suggested answers for 50 popular job roles.
                                </p>
                            </div>

                            <div className="grid lg:grid-cols-4 gap-8 mt-12 items-start">
                                {/* Left Controls Sidebar */}
                                <div className="lg:col-span-1 space-y-6 bg-white/5 p-6 rounded-3xl border border-white/10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Select Job Role</label>
                                        <select
                                            value={qaRole}
                                            onChange={(e) => {
                                                setQaRole(e.target.value);
                                                setExpandedQuestionId(null);
                                            }}
                                            className="w-full h-12 rounded-xl bg-black border border-white/10 px-3 text-sm text-gray-200 focus:border-[#ADFF44] outline-none"
                                        >
                                            {FAMOUS_ROLES.map((r, i) => (
                                                <option key={i} value={r} className="bg-neutral-900 text-gray-300">{r}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Search Questions</label>
                                        <div className="relative">
                                            <Search className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                                            <Input
                                                placeholder="Search question keywords..."
                                                className="bg-black border-white/10 focus:border-[#ADFF44] h-12 pl-10 rounded-xl text-sm"
                                                value={qaSearch}
                                                onChange={(e) => setQaSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2 border-t border-white/5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Question Categories</label>
                                        <div className="flex flex-col gap-2">
                                            {["Behavioral & Fit", "Technical & Domain", "System & Architecture", "Scenario & Troubleshooting"].map((cat) => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => {
                                                        setQaCategory(cat);
                                                        setExpandedQuestionId(null);
                                                    }}
                                                    className={`w-full py-3 px-4 rounded-xl text-left text-xs font-bold transition-all border flex items-center justify-between ${qaCategory === cat ? "bg-[#ADFF44]/10 border-[#ADFF44]/30 text-[#ADFF44]" : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5"}`}
                                                >
                                                    <span>{cat}</span>
                                                    <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-gray-500">50 Qs</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Questions List */}
                                <div className="lg:col-span-3 space-y-4">
                                    {qaQuestionsLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center bg-white/3 border border-white/5 px-6 py-4 rounded-2xl">
                                                <span className="text-xs font-bold text-gray-400">Showing {qaCategory} Questions for <strong className="text-white">{qaRole}</strong></span>
                                                <span className="text-xs bg-[#ADFF44]/10 text-[#ADFF44] font-bold px-3 py-1 rounded-full">200 Questions Loaded</span>
                                            </div>

                                            <div className="space-y-3">
                                                {qaQuestions
                                                    .filter(q => q.category === qaCategory && (qaSearch === "" || q.text.toLowerCase().includes(qaSearch.toLowerCase())))
                                                    .map((q, idx) => {
                                                        const isExpanded = expandedQuestionId === q.id;
                                                        const cacheKey = `${qaRole}:${q.text}`;
                                                        const answerData = answersStore[cacheKey];

                                                        return (
                                                            <div
                                                                key={q.id}
                                                                className={`border rounded-2xl transition-all overflow-hidden bg-white/3 ${isExpanded ? "border-[#ADFF44]/30 ring-1 ring-[#ADFF44]/10" : "border-white/5 hover:border-white/10"}`}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (isExpanded) {
                                                                            setExpandedQuestionId(null);
                                                                        } else {
                                                                            setExpandedQuestionId(q.id);
                                                                            loadQuestionAnswer(q.text);
                                                                        }
                                                                    }}
                                                                    className="w-full px-6 py-5 text-left flex justify-between items-start gap-4 hover:bg-white/2 transition-colors"
                                                                >
                                                                    <div className="flex gap-4">
                                                                        <span className="text-xs font-mono font-bold text-gray-600 mt-0.5">{idx + 1}.</span>
                                                                        <h4 className="font-bold text-sm text-gray-200 leading-snug">{q.text}</h4>
                                                                    </div>
                                                                    <ChevronRight
                                                                        size={16}
                                                                        className={`text-gray-500 mt-1 transition-transform shrink-0 ${isExpanded ? "rotate-90 text-[#ADFF44]" : ""}`}
                                                                    />
                                                                </button>

                                                                {isExpanded && (
                                                                    <div className="border-t border-white/5 bg-black/40 p-6 space-y-6">
                                                                        {expandedQuestionLoading && !answerData ? (
                                                                            <div className="space-y-3 animate-pulse">
                                                                                <div className="h-4 bg-white/5 rounded w-3/4" />
                                                                                <div className="h-4 bg-white/5 rounded w-5/6" />
                                                                                <div className="h-4 bg-white/5 rounded w-2/3" />
                                                                            </div>
                                                                        ) : answerData ? (
                                                                            <div className="grid md:grid-cols-3 gap-6 items-start">
                                                                                <div className="md:col-span-2 space-y-3">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <span className="text-[10px] font-black uppercase text-[#ADFF44] tracking-wider flex items-center gap-1">
                                                                                            <Sparkles size={10} /> Suggested Model Answer
                                                                                        </span>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => {
                                                                                                navigator.clipboard.writeText(answerData.suggested_answer);
                                                                                                toast.success("Answer copied to clipboard!");
                                                                                            }}
                                                                                            className="text-xs text-[#ADFF44] hover:underline flex items-center gap-1"
                                                                                        >
                                                                                            <Copy size={12} /> Copy Answer
                                                                                        </button>
                                                                                    </div>
                                                                                    <p className="text-xs text-gray-300 leading-relaxed font-sans whitespace-pre-wrap select-text selection:bg-[#ADFF44] selection:text-black">
                                                                                        {answerData.suggested_answer}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="bg-[#ADFF44]/5 border border-[#ADFF44]/15 p-4 rounded-xl space-y-3">
                                                                                    <span className="text-[10px] font-black uppercase text-[#ADFF44] tracking-wider flex items-center gap-1">
                                                                                        <Star size={10} fill="currentColor" /> Expert Response Tips
                                                                                    </span>
                                                                                    <ul className="space-y-2">
                                                                                        {answerData.tips?.map((t: string, ti: number) => (
                                                                                            <li key={ti} className="flex gap-2 text-[11px] text-gray-400 leading-normal">
                                                                                                <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF44]/40 mt-1.5 shrink-0" />
                                                                                                <span>{t}</span>
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-xs text-gray-500 italic">No answer data available.</p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* AI VIDEO MOCK INTERVIEW */}
                    {activeSection === "interview" && (
                        <motion.div
                            key="interview-stage"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {interviewStage === "setup" && (
                                <div className="max-w-2xl mx-auto space-y-8 py-12">
                                    <div className="text-center space-y-4">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ADFF44]/10 border border-[#ADFF44]/20 text-[#ADFF44] text-xs font-bold uppercase tracking-widest mb-2">
                                            <Video size={14} />
                                            AI Video Mock Interview Simulator
                                        </div>
                                        <h1 className="text-4xl md:text-5xl font-bold font-sora">
                                            Practice in <span className="text-[#ADFF44]">Real-Time</span>
                                        </h1>
                                        <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto">
                                            Connect your camera and speak your answers. Our browser-based MediaPipe model tracks your eye contact, head stability, and posture in real-time, while AI evaluates your spoken responses.
                                        </p>
                                    </div>

                                    <Card className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6">
                                        <div className="space-y-4">
                                            <label className="text-xs font-black uppercase text-gray-400 tracking-wider">Select target interview role</label>
                                            <select
                                                value={interviewRole}
                                                onChange={(e) => setInterviewRole(e.target.value)}
                                                className="w-full h-14 rounded-xl bg-black border border-white/10 px-4 text-gray-200 focus:border-[#ADFF44] outline-none font-bold"
                                            >
                                                {FAMOUS_ROLES.map((r, i) => (
                                                    <option key={i} value={r} className="bg-neutral-900 text-gray-300">{r}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 border-t border-white/5 pt-6 text-xs text-gray-400">
                                            <div className="p-4 rounded-xl bg-white/3 space-y-1.5">
                                                <h4 className="font-bold text-white flex items-center gap-1.5 uppercase text-[10px] tracking-wider"><Star size={12} fill="currentColor" className="text-[#ADFF44]" /> Eye Contact</h4>
                                                <p>Tracks iris movements to ensure you maintain direct eye engagement with the screen.</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-white/3 space-y-1.5">
                                                <h4 className="font-bold text-white flex items-center gap-1.5 uppercase text-[10px] tracking-wider"><UserCheck size={12} className="text-[#ADFF44]" /> Head Pose</h4>
                                                <p>Analyzes head pitch, roll, and yaw to record professional speaking posture stability.</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-white/3 space-y-1.5">
                                                <h4 className="font-bold text-white flex items-center gap-1.5 uppercase text-[10px] tracking-wider"><Target size={12} className="text-[#ADFF44]" /> Posture Alert</h4>
                                                <p>Monitors distance and neck alignment, warning you in real-time if you lean or slouch.</p>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleStartMockInterview}
                                            disabled={loading}
                                            className="w-full h-14 rounded-xl bg-[#ADFF44] hover:bg-[#9BE63D] text-black font-black text-base transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-[#ADFF44]/15"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={18} />
                                                    <span>Initializing AI Engine...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Camera size={18} />
                                                    <span>Start AI Video Mock Interview</span>
                                                </>
                                            )}
                                        </Button>
                                    </Card>
                                </div>
                            )}

                            {(interviewStage === "calibrating" || interviewStage === "running") && (
                                <div className="grid lg:grid-cols-5 gap-8 items-start">
                                    {/* Left: Video & Face Tracking */}
                                    <div className="lg:col-span-3 space-y-6">
                                        <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 aspect-video shadow-2xl">
                                            <video
                                                ref={videoRef}
                                                muted
                                                playsInline
                                                className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                                            />
                                            <canvas
                                                ref={canvasRef}
                                                className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none"
                                            />

                                            {interviewStage === "calibrating" && (
                                                <div className="absolute inset-0 bg-black/60 z-30 flex flex-col items-center justify-center gap-4 text-center p-6 backdrop-blur-sm animate-fade-in">
                                                    <div className="w-20 h-20 rounded-full border-4 border-dashed border-[#ADFF44] flex items-center justify-center animate-spin text-[#ADFF44] text-3xl font-black">
                                                        3
                                                    </div>
                                                    <div className="max-w-xs space-y-2">
                                                        <h3 className="font-bold text-lg text-white">Calibrating Webcam</h3>
                                                        <p className="text-xs text-gray-400">Please sit straight, look directly at your camera, and hold still.</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="absolute bottom-4 left-4 z-30 flex gap-2">
                                                <span className="px-3 py-1 rounded-full bg-black/80 text-[10px] font-bold border border-[#ADFF44]/20 text-[#ADFF44] flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#ADFF44] animate-ping" /> Camera Live
                                                </span>
                                                {calibrated && (
                                                    <span className="px-3 py-1 rounded-full bg-black/80 text-[10px] font-bold border border-white/10 text-white flex items-center gap-1">
                                                        Tracking Active
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Real-time Tracking Dials/Bars */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <Card className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center space-y-2">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Eye Contact</span>
                                                <div className={`w-3.5 h-3.5 rounded-full ${liveMetrics.eyeContact ? "bg-[#ADFF44] shadow-lg shadow-[#ADFF44]/30" : "bg-red-500 shadow-lg shadow-red-500/30"} transition-colors`} />
                                                <span className="text-xs font-bold text-white">{liveMetrics.eyeContact ? "Looking at Screen" : "Looking Away"}</span>
                                            </Card>
                                            <Card className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center space-y-2">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Head Pose</span>
                                                <div className={`w-3.5 h-3.5 rounded-full ${liveMetrics.headStability ? "bg-[#ADFF44] shadow-lg shadow-[#ADFF44]/30" : "bg-red-500 shadow-lg shadow-red-500/30"} transition-colors`} />
                                                <span className="text-xs font-bold text-white">{liveMetrics.headStability ? "Stable Posture" : "Head Movement"}</span>
                                            </Card>
                                            <Card className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center space-y-2">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Alignment</span>
                                                <div className={`w-3.5 h-3.5 rounded-full ${liveMetrics.posture ? "bg-[#ADFF44] shadow-lg shadow-[#ADFF44]/30" : "bg-red-500 shadow-lg shadow-red-500/30"} transition-colors`} />
                                                <span className="text-xs font-bold text-white">{liveMetrics.posture ? "Centered" : "Slouching / Leaning"}</span>
                                            </Card>
                                        </div>
                                    </div>

                                    {/* Right: Questions & Audio flow */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <Card className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6 min-h-[350px] flex flex-col justify-between">
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-[#ADFF44]">Question {currentQuestionIdx + 1} of {interviewQuestions.length}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => speakQuestion(interviewQuestions[currentQuestionIdx]?.text)}
                                                        className="text-gray-400 hover:text-white transition-colors"
                                                        title="Re-read Question"
                                                    >
                                                        <Volume2 size={18} />
                                                    </button>
                                                </div>

                                                <h3 className="text-2xl font-bold font-sora text-white leading-tight">
                                                    "{interviewQuestions[currentQuestionIdx]?.text}"
                                                </h3>

                                                {/* Voice transcription preview */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                                        <Mic size={14} className={transcribing ? "text-[#ADFF44] animate-pulse" : "text-gray-500"} />
                                                        <span>{transcribing ? "Transcribing spoken answer..." : "Connecting Mic..."}</span>
                                                    </div>
                                                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 min-h-[120px] max-h-[160px] overflow-y-auto text-xs text-gray-300 font-sans leading-relaxed select-text">
                                                        {transcript || (
                                                            <span className="text-gray-600 italic">Start speaking your response... transcript will appear here in real-time.</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 border-t border-white/5 pt-6">
                                                <Button
                                                    onClick={() => handleFinishInterview([...spokenAnswers, { question: interviewQuestions[currentQuestionIdx]?.text, answer: transcript || "[No spoken response captured]" }])}
                                                    variant="outline"
                                                    className="flex-1 border-white/10 hover:bg-red-500/10 hover:border-red-500/20 text-red-400 h-12 rounded-xl text-xs font-bold uppercase tracking-wider"
                                                >
                                                    Finish Early
                                                </Button>
                                                <Button
                                                    onClick={handleNextQuestion}
                                                    className="flex-1 bg-[#ADFF44] hover:bg-[#9BE63D] text-black h-12 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-[#ADFF44]/15"
                                                >
                                                    <span>{currentQuestionIdx === interviewQuestions.length - 1 ? "Submit Interview" : "Next Question"}</span>
                                                    <ArrowRight size={14} />
                                                </Button>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            )}

                            {interviewStage === "evaluating" && (
                                <div className="max-w-md mx-auto py-24 flex flex-col items-center justify-center text-center gap-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full border-4 border-[#ADFF44]/20 border-t-[#ADFF44] animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center text-[#ADFF44]">
                                            <Brain size={32} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold font-sora">Analyzing Video & Transcript</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                                            AI is grading your technical content, STAR alignment, eye contact ratios, and speaking posture stability.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {interviewStage === "completed" && evaluationResult && (
                                <div className="space-y-8">
                                    {/* Score Dials / Summary Dashboard */}
                                    <div className="grid lg:grid-cols-4 gap-8">
                                        {/* Overall Score Card */}
                                        <Card className="lg:col-span-1 bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col items-center text-center space-y-6">
                                            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs">Interview Score</h3>
                                            <div className="relative">
                                                <svg className="w-40 h-40 transform -rotate-90">
                                                    <circle className="text-white/5" strokeWidth="6" stroke="currentColor" fill="transparent" r="72" cx="80" cy="80" />
                                                    <circle
                                                        className="text-[#ADFF44]"
                                                        strokeWidth="6"
                                                        strokeDasharray={2 * Math.PI * 72}
                                                        strokeDashoffset={2 * Math.PI * 72 * (1 - (evaluationResult.overall_score || 0) / 100)}
                                                        strokeLinecap="round"
                                                        stroke="currentColor"
                                                        fill="transparent"
                                                        r="72" cx="80" cy="80"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-5xl font-black text-[#ADFF44] font-sora">{evaluationResult.overall_score}</span>
                                                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Overall</span>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => setInterviewStage("setup")}
                                                variant="outline"
                                                className="w-full border-white/10 hover:bg-white/5 h-11 text-xs font-bold uppercase tracking-wider rounded-xl"
                                            >
                                                Retake Interview
                                            </Button>
                                        </Card>

                                        {/* Details Critique Block */}
                                        <div className="lg:col-span-3 grid md:grid-cols-2 gap-6 bg-white/3 border border-white/5 p-8 rounded-3xl">
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-black uppercase tracking-wider text-[#ADFF44] flex items-center gap-1.5">
                                                    <Volume2 size={16} /> Verbal Content Feedback
                                                </h3>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                                                        <span>Content & Structure Score</span>
                                                        <span className="text-white">{evaluationResult.content_score}/100</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-[#ADFF44]" style={{ width: `${evaluationResult.content_score}%` }} />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-400 leading-relaxed font-sans">{evaluationResult.content_feedback}</p>
                                            </div>

                                            <div className="space-y-4 md:border-l md:border-white/5 md:pl-6">
                                                <h3 className="text-sm font-black uppercase tracking-wider text-[#ADFF44] flex items-center gap-1.5">
                                                    <Camera size={16} /> Non-Verbal Delivery Feedback
                                                </h3>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                                                        <span>Delivery & Posture Score</span>
                                                        <span className="text-white">{evaluationResult.delivery_score}/100</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-[#ADFF44]" style={{ width: `${evaluationResult.delivery_score}%` }} />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-400 leading-relaxed font-sans">{evaluationResult.delivery_feedback}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Graded Question Responses */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold font-sora text-white">Spoken Question Breakdown</h3>
                                        <div className="grid gap-4">
                                            {evaluationResult.graded_answers?.map((ans: any, i: number) => (
                                                <Card key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                                                        <div className="flex gap-3 items-start">
                                                            <span className="text-xs font-mono font-bold text-gray-500 mt-1">{i + 1}.</span>
                                                            <h4 className="font-bold text-sm text-white leading-tight">{ans.question}</h4>
                                                        </div>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shrink-0 border ${ans.rating === "Strong" ? "bg-[#ADFF44]/10 border-[#ADFF44]/20 text-[#ADFF44]" : ans.rating === "Good" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                                                            {ans.rating} Response
                                                        </span>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-6 text-xs leading-relaxed">
                                                        <div className="space-y-2">
                                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">AI Critique</span>
                                                            <p className="text-gray-400 font-sans">{ans.critique}</p>
                                                        </div>
                                                        <div className="space-y-2 bg-[#ADFF44]/5 p-4 rounded-xl border border-[#ADFF44]/10 relative">
                                                            <span className="text-[10px] font-black uppercase text-[#ADFF44] tracking-wider flex items-center gap-1">
                                                                <Sparkles size={10} /> How You Should Have Answered
                                                            </span>
                                                            <p className="text-gray-300 font-medium font-sans italic">"{ans.better_answer}"</p>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Resume Tailor Panel */}
            <ResumeTailorPanel
                open={isTailorOpen}
                onClose={() => setIsTailorOpen(false)}
                sharedResume={formData.resumeFile}
                onResumeShared={(f) => setFormData({ ...formData, resumeFile: f })}
                job={{
                    id: 'temp-' + Date.now(),
                    title: analysis?.role_matches?.[tailorJobIdx]?.role || roles[tailorJobIdx]?.role || 'Target Role',
                    company: 'Career Check Match',
                    description: roles[tailorJobIdx]?.job_description || '',
                    location: 'Remote',
                    type: 'Full-time',
                    mode: 'Remote',
                    experience: 'Intermediate',
                    salary: 'Competitive',
                    skills: analysis?.role_matches?.[tailorJobIdx]?.why_good ? [analysis.role_matches[tailorJobIdx].why_good] : analysis?.strengths || [],
                    category: 'Engineering',
                    postedDays: 0
                } as Job}
            />
        </div >
    );
};

export default CareerReadiness;
