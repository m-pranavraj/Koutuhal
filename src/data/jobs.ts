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

export const jobs: Job[] = [
  {
    id: 1,
    title: "Graphic Designer",
    company: "Independent, founder-led marketing company",
    type: "Full-time",
    mode: "Hybrid",
    location: "Bangalore",
    experience: "4+ Years",
    salary: "9-15 LPA",
    description: "We're looking for a Graphic Designer who thinks in concepts, not just compositions. Design here needs to do work—sell, explain, persuade, disrupt.",
    skills: ["Figma", "Adobe Creative Suite", "Typography", "Motion Design"],
    category: "Design",
  },
  {
    id: 2,
    title: "Head of Engineering: Prototyping",
    company: "Privately held innovation and research-driven company",
    type: "Full-time",
    mode: "WFO",
    location: "Pune",
    experience: "5-10 Years",
    salary: "10-20 LPA",
    description: "This is your chance to work on defence technologies of national importance, co-develop with India's leading agencies.",
    skills: ["Prototyping", "CAD", "Circuits", "Hardware"],
    category: "Engineering",
  },
  {
    id: 3,
    title: "Performance Marketing Head",
    company: "Independent, founder-led marketing company",
    type: "Full-time",
    mode: "WFH",
    location: "Remote",
    experience: "8-10 years",
    salary: "18-30 LPA",
    description: "Looking for a Performance Marketing Head to own and scale the performance function. This is for someone who owns outcomes, not just campaigns.",
    skills: ["Performance Marketing", "Strategy", "Team Building", "Analytics"],
  },
  {
    id: 4,
    title: "Associate Product Manager",
    company: "E-Commerce & AI Company",
    type: "Full-time",
    mode: "WFO",
    location: "Bengaluru/Gurugram",
    experience: "1+ Year",
    salary: "Up to ₹18 LPA + ESOPs",
    description: "You'll own the full product lifecycle for new features in our AI agents- from understanding client needs to shipping and measuring impact.",
    skills: ["Product Management", "Python", "Analytics", "E-commerce"],
  },
  {
    id: 5,
    title: "Senior Account Executive",
    company: "Premier Horticultural Leader",
    type: "Full-time",
    mode: "WFO",
    location: "Pune",
    experience: "2-5 Years",
    salary: "3-5 LPA",
    description: "Manage the full spectrum of financial accounting, with emphasis on GST compliance, Income Tax, and AR/AP management.",
    skills: ["Tally Prime", "MS Excel", "GST", "Financial Modeling"],
  },
  {
    id: 6,
    title: "Junior Construction Manager & Estimator",
    company: "Construction Service Inc",
    type: "Full-time",
    mode: "WFH",
    location: "Remote",
    experience: "0-2 Years",
    salary: "3.4-4 LPA",
    description: "Responsible for assisting the Project Manager in managing all administrative and technical requirements for construction projects.",
    skills: ["Project Management", "Bluebeam Revu", "Microsoft Project", "Smartsheet"],
  },
  {
    id: 7,
    title: "Video Producer/Motion Designer",
    company: "AI-powered visualization platform",
    type: "Full-time",
    mode: "WFH",
    location: "Remote",
    experience: "4+ years",
    salary: "Upto Rs. 15 LPA",
    description: "Create videos for product launches, marketing campaigns, and social content. Blend motion graphics with screen capture to tell product stories.",
    skills: ["Motion Graphics", "Video Production", "Video Editing", "After Effects"],
  },
  {
    id: 8,
    title: "Account Executive (SMB, Mid Market)",
    company: "E-Commerce & AI Company",
    type: "Full-time",
    mode: "WFO",
    location: "Bengaluru/Gurugram",
    experience: "2-4 Years",
    salary: "10-12 LPA + Variable + ESOPs",
    description: "Turn cold curiosity into clear urgency, and conversations into live trials. Run 100+ high-quality demos every month.",
    skills: ["Sales", "Communication", "Storytelling", "SaaS"],
  },
  {
    id: 9,
    title: "Manager – Projects (Prototyping Division)",
    company: "Specialized manufacturer of Rapid Prototypes",
    type: "Full-time",
    mode: "WFO",
    location: "Pune",
    experience: "5-8 years",
    salary: "4.8-6 LPA",
    description: "Responsible for end-to-end planning, execution, monitoring, and delivery of prototyping projects across multiple manufacturing processes.",
    skills: ["Project Planning", "Client Communication", "Risk Management", "Stakeholder Management"],
  },
  {
    id: 10,
    title: "Production Planning & Control Executive",
    company: "Specialized manufacturer of Rapid Prototypes",
    type: "Full-time",
    mode: "WFO",
    location: "Pune",
    experience: "4-5 Years",
    salary: "4.2-6 LPA",
    description: "Planning, coordinating, and controlling manufacturing operations to ensure efficient production flow.",
    skills: ["MS Excel", "ERP Systems", "Injection Moulding", "Production Planning"],
  },
  {
    id: 11,
    title: "Sales and Business Development Executive",
    company: "Specialized manufacturer of Rapid Prototypes",
    type: "Full-time",
    mode: "WFO",
    location: "Pune",
    experience: "3-7 years",
    salary: "4.8-7.2 LPA",
    description: "Sales & Marketing within the Manufacturing sector with exposure to Tool Room, Moulding Shop, or Prototyping environment.",
    skills: ["Sales", "Business Development", "MS Excel", "PowerPoint"],
  },
];

export const jobTypes = ["All Types", "Full-time", "Internship", "Contract"];
export const experienceLevels = [
  "All Levels",
  "Early Career (1-3 years)",
  "Mid Level (3-5 years)",
  "Mid Senior (5-8 years)",
  "Senior (8-10 years)",
];
export const jobLocations = ["All Locations", "Bangalore", "Pune", "Gurugram", "Remote", "Delhi"];
