export interface Instructor {
  id: number;
  name: string;
  title: string;
  bio: string;
  image: string;
  experience: string;
  specialties: string[];
}

export const instructors: Instructor[] = [
  {
    id: 1,
    name: "Pritam",
    title: "AI Automation Expert",
    bio: "AI Automation Expert with 18+ years of experience in developing intelligent systems and automation solutions for enterprise clients.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop",
    experience: "18+ years",
    specialties: ["AI Automation", "Enterprise AI Solutions", "Intelligent Systems"],
  },
  {
    id: 2,
    name: "Shuchi",
    title: "AI Coach",
    bio: "Experienced AI Coach with 10+ years of expertise in training students and professionals in artificial intelligence and machine learning technologies.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop",
    experience: "10+ years",
    specialties: ["AI Coaching", "Machine Learning", "Student Training"],
  },
  {
    id: 3,
    name: "Agrim Mehta",
    title: "Generative AI Expert",
    bio: "Generative AI Engineer at Koutuhal AI. Building AI-first learning products for schools. Experience in AI agents & automated workflows.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop",
    experience: "5+ years",
    specialties: ["Generative AI", "AI Agents", "Automated Workflows"],
  },
];

export const curriculum = {
  schools: {
    title: "AI Education Program for Schools",
    duration: "12 Weeks",
    tools: 25,
    projects: 8,
    weeks: [
      {
        week: "Week 1",
        title: "Introduction to AI",
        topics: ["What is AI and Machine Learning?", "Real-world AI applications", "Setting up your first AI tools"],
      },
      {
        week: "Week 2",
        title: "Text Generation with AI",
        topics: ["Understanding language models", "Creating content with ChatGPT", "Writing assistance and homework help"],
      },
      {
        week: "Week 3",
        title: "Image Generation and Visual AI",
        topics: ["Introduction to image generation", "Creating art with AI tools", "Understanding DALL-E and Midjourney"],
      },
      {
        week: "Week 4",
        title: "AI for Learning and Research",
        topics: ["Research assistants and AI tools", "Study helpers and note-taking", "Academic integrity with AI"],
      },
      {
        week: "Week 5",
        title: "Video and Multimedia AI",
        topics: ["AI video creation tools", "Animation and multimedia projects", "Presentation enhancement"],
      },
      {
        week: "Week 6",
        title: "AI in Science and Math",
        topics: ["AI for problem-solving", "Scientific simulations", "Math tutoring with AI"],
      },
      {
        week: "Week 7",
        title: "Creative AI Projects",
        topics: ["Building AI-powered games", "Interactive storytelling", "Music and art generation"],
      },
      {
        week: "Week 8",
        title: "Chatbots and Conversational AI",
        topics: ["Building simple chatbots", "Understanding NLP basics", "Creating helpful AI assistants"],
      },
      {
        week: "Week 9",
        title: "AI Ethics and Responsibility",
        topics: ["Understanding AI bias", "Privacy and data protection", "Responsible AI use"],
      },
      {
        week: "Week 10",
        title: "AI for Social Good",
        topics: ["Solving community problems with AI", "Environmental applications", "Healthcare and education AI"],
      },
      {
        week: "Week 11",
        title: "Final Project Planning",
        topics: ["Choosing your AI project", "Planning and design", "Team collaboration"],
      },
      {
        week: "Week 12",
        title: "Final Project Presentation",
        topics: ["Completing your AI project", "Presenting to peers", "Reflection and next steps"],
      },
    ],
    toolsList: [
      "ChatGPT", "DALL-E", "Midjourney", "Canva AI", "Quillbot",
      "Grammarly", "Notion AI", "Wolfram Alpha", "Photomath", "Socratic",
      "Scratch", "Teachable Machine", "Runway ML", "Lumen5", "Beautiful.ai",
    ],
    projectsList: [
      "AI Story Generator",
      "Personal Study Assistant",
      "AI Art Gallery",
      "Smart Homework Helper",
      "Environmental Monitor",
      "AI Chatbot Friend",
      "Science Experiment Simulator",
      "Final Innovation Project",
    ],
    learnings: [
      "Understand fundamental AI and ML concepts",
      "Use 25+ AI tools effectively and responsibly",
      "Create content using generative AI",
      "Build simple AI-powered projects",
      "Apply AI to learning and problem-solving",
      "Understand AI ethics and responsible use",
      "Collaborate on technology projects",
      "Present technical projects confidently",
    ],
  },
  bootcamp: {
    title: "Master Generative AI Bootcamp",
    duration: "16 Weeks",
    tools: 40,
    projects: 12,
    weeks: [
      {
        week: "Week 1",
        title: "Foundation - Introduction to AI and ML",
        topics: ["What is AI, ML, and Deep Learning", "History and evolution of AI", "Real-world applications and use cases", "Setting up development environment"],
      },
      {
        week: "Week 2",
        title: "Text AI and Language Models",
        topics: ["Understanding Large Language Models (LLMs)", "GPT, Claude, and other text models", "Prompt engineering fundamentals", "Building text applications"],
      },
      {
        week: "Week 3",
        title: "Image Generation and Computer Vision",
        topics: ["Diffusion models and GANs", "DALL-E, Midjourney, Stable Diffusion", "Image editing and manipulation", "Visual AI applications"],
      },
      {
        week: "Week 4",
        title: "Audio and Video AI",
        topics: ["Speech recognition and synthesis", "Music generation with AI", "Video creation and editing tools", "Multimedia AI applications"],
      },
      {
        week: "Week 5",
        title: "Advanced Prompt Engineering",
        topics: ["Prompt design patterns", "Chain-of-thought prompting", "Few-shot and zero-shot learning", "Optimizing AI outputs"],
      },
      {
        week: "Week 6",
        title: "AI APIs and Integration",
        topics: ["OpenAI, Anthropic, and other APIs", "Building AI-powered applications", "API authentication and best practices", "Rate limiting and optimization"],
      },
      {
        week: "Week 7",
        title: "Vector Databases and Embeddings",
        topics: ["Understanding embeddings", "Vector databases (Pinecone, Weaviate)", "Semantic search implementation", "Building knowledge bases"],
      },
      {
        week: "Week 8",
        title: "RAG (Retrieval Augmented Generation)",
        topics: ["RAG architecture and concepts", "Building RAG systems", "Document processing and chunking", "Context-aware AI applications"],
      },
      {
        week: "Week 9",
        title: "LangChain and AI Frameworks",
        topics: ["Introduction to LangChain", "Building chains and agents", "Memory and state management", "Production patterns"],
      },
      {
        week: "Week 10",
        title: "AI Agents and Autonomous Systems",
        topics: ["Building AI agents", "Tool use and function calling", "Multi-agent systems", "Agent orchestration"],
      },
      {
        week: "Week 11",
        title: "Fine-tuning and Model Training",
        topics: ["Transfer learning basics", "Fine-tuning LLMs", "Dataset preparation", "Training optimization"],
      },
      {
        week: "Week 12",
        title: "AI Ethics and Safety",
        topics: ["Bias and fairness in AI", "Privacy and security considerations", "Responsible AI development", "Regulatory compliance"],
      },
      {
        week: "Week 13",
        title: "Production Deployment",
        topics: ["Deploying AI applications", "Scalability and performance", "Monitoring and logging", "Cost optimization"],
      },
      {
        week: "Week 14",
        title: "Building AI Products",
        topics: ["Product ideation and validation", "User experience with AI", "Business models", "Go-to-market strategies"],
      },
      {
        week: "Week 15",
        title: "Capstone Project Development",
        topics: ["Project planning and architecture", "Implementation and testing", "Team collaboration", "Documentation best practices"],
      },
      {
        week: "Week 16",
        title: "Final Presentations and Career Prep",
        topics: ["Project presentations", "Portfolio development", "Interview preparation", "Industry networking"],
      },
    ],
    toolsList: [
      "ChatGPT", "Claude", "Midjourney", "DALL-E", "Stable Diffusion",
      "RunwayML", "ElevenLabs", "Whisper", "LangChain", "Pinecone",
      "Weaviate", "Hugging Face", "Cohere", "Replicate", "Weights & Biases",
      "Streamlit", "Gradio", "LlamaIndex", "Chroma", "AutoGPT",
    ],
    projectsList: [
      "AI Content Generator",
      "Semantic Search Engine",
      "RAG-powered Chatbot",
      "AI Image Editor",
      "Voice-powered Assistant",
      "Document Intelligence System",
      "AI Code Assistant",
      "Multi-modal AI Application",
      "AI Agent Workflow",
      "Fine-tuned Custom Model",
      "Production AI SaaS",
      "Capstone Innovation Project",
    ],
    learnings: [
      "Master generative AI fundamentals and architectures",
      "Build production-ready AI applications",
      "Implement RAG and vector search systems",
      "Develop and deploy AI agents",
      "Fine-tune and optimize models",
      "Apply AI ethics and safety principles",
      "Create scalable AI products",
      "Prepare for AI engineering roles",
    ],
  },
  business: {
    title: "AI Strategies Bootcamp for Business Growth",
    duration: "8 Weeks",
    tools: 30,
    projects: 6,
    weeks: [
      {
        week: "Week 1",
        title: "Introduction to AI and Business Fundamentals",
        topics: ["Understanding AI, Machine Learning, and Business Applications", "Overview of AI-powered business tools and platforms", "Setting up your AI toolkit for business"],
      },
      {
        week: "Week 2",
        title: "Strategic AI Applications for Product Creation",
        topics: ["Using Generative AI for product development", "Creating prototypes and MVPs with AI tools", "AI-powered market research and validation"],
      },
      {
        week: "Week 3",
        title: "AI-Driven Agent and Communications",
        topics: ["Building AI chatbots for customer service", "Implementing AI communication strategies", "Automating customer interactions"],
      },
      {
        week: "Week 4",
        title: "Intermediate AI Tools and Value Extraction",
        topics: ["Advanced AI tool integration", "Data analysis with AI", "ROI measurement and optimization"],
      },
      {
        week: "Week 5",
        title: "AI Research Agents and Workflow",
        topics: ["Creating AI research assistants", "Automating business intelligence", "Building efficient AI workflows"],
      },
      {
        week: "Week 6",
        title: "Advanced AI Agent Orchestration",
        topics: ["Multi-agent systems for business", "Coordinating AI tools for complex tasks", "Enterprise AI implementation"],
      },
      {
        week: "Week 7",
        title: "AI in Business: Survey, Workflow, and Sales Integration",
        topics: ["AI-powered customer surveys and feedback", "Sales automation with AI", "CRM integration and optimization"],
      },
      {
        week: "Week 8",
        title: "AI System Integration and Business Communication",
        topics: ["Integrating AI across business functions", "Professional AI communication strategies", "Future-proofing your business with AI"],
      },
    ],
    toolsList: [
      "ChatGPT", "Claude", "Midjourney", "DALL-E", "Canva AI",
      "Jasper", "Copy.ai", "HubSpot AI", "Zapier", "Make",
      "Notion AI", "Fireflies.ai", "Otter.ai", "Grammarly", "Lumen5",
      "Synthesia", "Beautiful.ai", "Tableau", "Power BI", "MonkeyLearn",
    ],
    projectsList: [
      "AI-Powered Marketing Campaign",
      "Customer Service Chatbot",
      "Business Intelligence Dashboard",
      "Sales Automation System",
      "Content Marketing Engine",
      "AI Strategy Implementation",
    ],
    learnings: [
      "Understand AI fundamentals and business applications",
      "Master 30+ AI tools for business operations",
      "Build AI-powered workflows and automations",
      "Create AI chatbots and customer service solutions",
      "Implement AI-driven marketing strategies",
      "Develop data-driven decision-making skills",
      "Design and execute AI integration roadmaps",
      "Measure and optimize AI ROI",
    ],
  },
};

export const pricingPlans = [
  {
    id: 1,
    name: "Silver",
    price: "₹15,000",
    duration: "2 months program",
    features: [
      "8 interactive AI learning sessions",
      "4 sessions with industry experts",
      "1 hands-on live project",
      "5 interactive quizzes",
      "Basic AI tools introduction",
      "Community forum access",
      "Certificate of completion",
    ],
    isPopular: false,
  },
  {
    id: 2,
    name: "Gold",
    price: "₹40,000",
    duration: "4 months program",
    features: [
      "12 interactive AI learning sessions",
      "8 sessions with industry experts",
      "3 hands-on live projects",
      "10 interactive quizzes",
      "Advanced AI tools training",
      "Project certificates",
      "Priority community support",
      "Parent progress reports",
    ],
    isPopular: true,
  },
  {
    id: 3,
    name: "Platinum",
    price: "₹75,000",
    duration: "12 weeks program",
    features: [
      "20 interactive AI learning sessions",
      "20 sessions with industry experts",
      "5 hands-on live projects",
      "15 interactive quizzes",
      "Personal 1:1 mentorship",
      "Advanced project portfolio",
      "Direct mentor access",
      "Career guidance for young learners",
      "Exclusive AI tools access",
    ],
    isPopular: false,
  },
];

export const faqs = [
  {
    question: "Do I need prior programming experience?",
    answer: "No prior programming experience is required for our beginner courses. We start with the basics and use user-friendly AI tools. For advanced bootcamps, basic Python knowledge is helpful but not mandatory.",
  },
  {
    question: "What kind of certificate do I receive?",
    answer: "Upon successful completion, you receive an industry-recognized certificate that you can share on LinkedIn and add to your resume. Our certificates are valued by top tech companies in India.",
  },
  {
    question: "Are there any live sessions?",
    answer: "Yes! All our programs include live interactive sessions with instructors and industry experts. You'll also have access to recorded sessions for revision.",
  },
  {
    question: "What is the refund policy?",
    answer: "We offer a 7-day money-back guarantee if you're not satisfied with the program. Please refer to our Terms and Conditions for complete details.",
  },
  {
    question: "How is this different from other online courses?",
    answer: "Koutuhal focuses on practical, hands-on learning with real AI tools. You'll build actual projects, get mentorship from industry experts, and receive career support—not just watch videos.",
  },
  {
    question: "What are the system requirements?",
    answer: "You need a computer or tablet with a stable internet connection. All tools we use are web-based and work on any modern browser. No special hardware is required.",
  },
];
