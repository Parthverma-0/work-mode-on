/**
 * Curated suggestions for the skills autocomplete. Not exhaustive — the input
 * always lets a user add whatever they type (the "Add …" row), this just makes
 * the common cases a tap away on mobile where there's no reliable Enter key.
 */
export const SKILL_SUGGESTIONS = [
  // Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust',
  'Kotlin', 'Swift', 'PHP', 'Ruby', 'Dart', 'Scala', 'R', 'SQL', 'HTML', 'CSS',
  // Frontend
  'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Tailwind CSS', 'Redux',
  'React Native', 'Flutter', 'Bootstrap', 'jQuery', 'Figma', 'Framer Motion',
  // Backend
  'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'NestJS',
  'GraphQL', 'REST APIs', 'gRPC', 'Microservices',
  // Data & DB
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Supabase', 'Firebase', 'Prisma',
  'SQLite', 'Elasticsearch', 'Pandas', 'NumPy', 'Power BI', 'Tableau', 'Excel',
  // AI / ML
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP',
  'Computer Vision', 'Data Analysis', 'LLMs', 'Prompt Engineering',
  // DevOps / Cloud
  'Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'Azure', 'CI/CD', 'Git',
  'GitHub Actions', 'Linux', 'Nginx', 'Terraform',
  // Design / Product
  'UI/UX Design', 'Product Management', 'Wireframing', 'Prototyping',
  'User Research', 'Adobe Photoshop', 'Adobe Illustrator',
  // Marketing / Business
  'SEO', 'Content Writing', 'Digital Marketing', 'Social Media Marketing',
  'Copywriting', 'Google Analytics', 'Sales', 'Business Development',
  // Soft skills
  'Communication', 'Teamwork', 'Leadership', 'Problem Solving',
  'Project Management', 'Agile', 'Scrum', 'Time Management',
] as const
