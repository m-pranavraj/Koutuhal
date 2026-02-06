export interface Job {
  id: number;
  title: string;
  company: string;
  type: 'Full-time' | 'Internship' | 'Contract';
  mode: 'WFO' | 'WFH' | 'Hybrid';
  location: string;
  experience: string;
  salary: string;
  description: string;
  skills: string[];
  postedDays?: number;
  category?: string;
}

const ROLES = [
  { title: "Senior Software Engineer", skills: ["React", "Node.js", "AWS", "System Design"], category: "Engineering" },
  { title: "Product Manager", skills: ["Product Strategy", "User Research", "Agile", "Roadmapping"], category: "Product" },
  { title: "UX/UI Designer", skills: ["Figma", "User Flow", "Prototyping", "Wireframing"], category: "Design" },
  { title: "Data Scientist", skills: ["Python", "Machine Learning", "SQL", "Tableau"], category: "Data" },
  { title: "DevOps Engineer", skills: ["Docker", "Kubernetes", "CI/CD", "Terraform"], category: "Engineering" },
  { title: "Digital Marketing Manager", skills: ["SEO", "Google Ads", "Content Strategy", "Analytics"], category: "Marketing" },
  { title: "Frontend Developer", skills: ["Vue.js", "Tailwind CSS", "JavaScript", "Redux"], category: "Engineering" },
  { title: "Backend Developer", skills: ["Java", "Spring Boot", "Microservices", "PostgreSQL"], category: "Engineering" },
  { title: "Full Stack Engineer", skills: ["Next.js", "TypeScript", "Prisma", "Vercel"], category: "Engineering" },
  { title: "Machine Learning Engineer", skills: ["PyTorch", "TensorFlow", "NLP", "Computer Vision"], category: "Data" }
];

const COMPANIES = [
  "Google", "Microsoft", "Amazon", "Netflix", "Meta", "Spotify", "Airbnb", "Uber", "Lyft", "Stripe",
  "Coinbase", "Notion", "Figma", "Canva", "Adobe", "Salesforce", "Atlassian", "Zoom", "Slack", "Shopify",
  "TechStart Inc", "InnovateLabs", "FutureSystems", "CloudNative Solutions", "DataMind Corp", "Creative Pulse",
  "HealthTech One", "FinServe Global", "EduLearn Now", "GreenEnergy Co"
];

const LOCATIONS = ["SF Bay Area", "New York, NY", "Austin, TX", "London, UK", "Bangalore, India", "Pune, India", "Hyderabad, India", "Remote", "Berlin, Germany", "Toronto, Canada"];
const TYPES = ["Full-time", "Contract", "Internship"] as const;
const MODES = ["WFO", "Hybrid", "WFH"] as const;

// Deterministic random generator for stability
const getRandom = (arr: any[], seed: number) => arr[(seed * 12345) % arr.length];

export const jobs: Job[] = Array.from({ length: 100 }, (_, i) => {
  const role = getRandom(ROLES, i);
  const company = getRandom(COMPANIES, i);
  const location = getRandom(LOCATIONS, i);

  return {
    id: i + 1,
    title: role.title,
    company: company,
    type: TYPES[i % 3], // Distribute types evenly
    mode: MODES[i % 3], // Distribute modes evenly
    location: location,
    experience: `${(i % 8) + 1}+ Years`,
    salary: `₹${(i % 20) + 10}-${(i % 20) + 25} LPA`,
    description: `We are looking for a talented ${role.title} to join our team at ${company}. You will be responsible for driving key initiatives and working on cutting-edge problems in the ${role.category} space.`,
    skills: role.skills,
    category: role.category,
    postedDays: i % 14 // Posted within last 2 weeks
  };
});

export const jobTypes = ["All Types", "Full-time", "Internship", "Contract"];
export const experienceLevels = [
  "All Levels",
  "Early Career (1-3 years)",
  "Mid Level (3-5 years)",
  "Mid Senior (5-8 years)",
  "Senior (8-10 years)",
];
export const jobLocations = ["All Locations", ...LOCATIONS];
