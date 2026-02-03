export interface Course {
  id: number;
  title: string;
  instructor: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  price: string;
  rating: number;
  category: string;
  image: string;
  tags?: string[];
  description: string;
  perfectFor?: string[];
  isFree?: boolean;
  isPopular?: boolean;
}

export const courses: Course[] = [
  {
    id: 1,
    title: "Master Generative AI Bootcamp",
    instructor: "Agrim Mehta",
    level: "Advanced",
    duration: "16 Weeks",
    price: "₹75,000",
    rating: 4.9,
    category: "Bootcamp",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop",
    tags: ["LLMs", "RAG", "Agents", "Production"],
    description: "Comprehensive program covering generative AI fundamentals, tools, and production-ready applications.",
    perfectFor: ["College Students", "Early Professionals", "Tech Enthusiasts"],
  },
  {
    id: 2,
    title: "AI Strategies for Business Growth",
    instructor: "Shuchi",
    level: "Intermediate",
    duration: "8 Weeks",
    price: "₹40,000",
    rating: 4.7,
    category: "Business",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop",
    tags: ["Strategy", "Automation", "Marketing"],
    description: "Learn how to leverage AI tools and strategies to drive business growth and improve efficiency.",
    perfectFor: ["Business Owners", "Entrepreneurs", "Managers"],
  },
  {
    id: 3,
    title: "Create Quizzes That Make Learning Fun",
    instructor: "Agrim",
    level: "Beginner",
    duration: "Self-Paced",
    price: "₹7,999",
    rating: 4.8,
    category: "AI Tools",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop",
    description: "Learn to design engaging AI-powered quizzes that transform traditional learning into interactive experiences.",
    perfectFor: ["Class 8-12 Students", "College Students", "Teachers"],
    isPopular: true,
  },
  {
    id: 4,
    title: "Build Your Personal AI Study Assistant",
    instructor: "Neelanjana",
    level: "Intermediate",
    duration: "Self-Paced",
    price: "₹8,499",
    rating: 4.9,
    category: "AI Applications",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop",
    description: "Create a personalized AI companion that helps with homework, explains concepts, and adapts to your learning style.",
    perfectFor: ["Class 10-12 Students", "College Students", "Self-Learners"],
  },
  {
    id: 5,
    title: "AI Math Tutor: Never Struggle with Numbers",
    instructor: "Agrim",
    level: "Intermediate",
    duration: "Self-Paced",
    price: "₹8,999",
    rating: 4.9,
    category: "Educational AI",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop",
    description: "Build an AI-powered math tutor that explains concepts step-by-step, solves problems, and adapts to your learning pace.",
    perfectFor: ["Class 8-12 Students", "College Students", "Math Enthusiasts"],
  },
  {
    id: 6,
    title: "AI Education Program for Schools",
    instructor: "Koutuhal Faculty",
    level: "Beginner",
    duration: "12 Weeks",
    price: "Request Info",
    rating: 4.8,
    category: "Schools",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop",
    description: "Comprehensive AI curriculum designed specifically for school students (Grades 8-12) to learn AI fundamentals.",
    perfectFor: ["Schools", "Educators", "Institution Partners"],
  },
  {
    id: 7,
    title: "AI-Powered Presentation Magic",
    instructor: "Shuchi",
    level: "Beginner",
    duration: "Self-Paced",
    price: "₹9,250",
    rating: 4.7,
    category: "Creative AI",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop",
    description: "Transform boring presentations into captivating visual stories using AI tools. Learn to create professional presentations that engage and inspire.",
    perfectFor: ["Class 8-12 Students", "College Students", "Professionals"],
  },
  {
    id: 8,
    title: "AI Language Learning Companion",
    instructor: "Neelanjana",
    level: "Advanced",
    duration: "Self-Paced",
    price: "₹10,499",
    rating: 4.8,
    category: "Language AI",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop",
    description: "Create an intelligent language learning assistant that provides personalized lessons, pronunciation feedback, and cultural insights.",
    perfectFor: ["College Students", "Language Learners", "Travelers"],
  },
  {
    id: 9,
    title: "AI Career Counselor: Find Your Perfect Path",
    instructor: "Shuchi",
    level: "Beginner",
    duration: "Self-Paced",
    price: "Free",
    rating: 4.6,
    category: "Career AI",
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&auto=format&fit=crop",
    description: "Develop an AI system that analyzes skills, interests, and market trends to provide personalized career guidance.",
    perfectFor: ["Class 11-12 Students", "College Students", "Career Changers"],
    isFree: true,
  },
];

export const courseCategories = [
  "All Categories",
  "AI Tools",
  "AI Applications",
  "Creative AI",
  "Educational AI",
  "Language AI",
  "Career AI",
  "Bootcamp",
  "Business",
  "Schools",
];

export const courseLevels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
