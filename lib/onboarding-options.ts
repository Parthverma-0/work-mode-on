/**
 * Curated option lists for onboarding/profile dropdowns. None are exhaustive —
 * the Combobox always lets a user type a value that isn't listed — they just put
 * the common choices one tap away (important on mobile).
 */

export const CITIES = [
  'Remote',
  'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Gurugram',
  'Noida', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Chandigarh', 'Indore', 'Kochi',
  'Coimbatore', 'Thiruvananthapuram', 'Bhopal', 'Nagpur', 'Lucknow', 'Surat',
  'Visakhapatnam', 'Bhubaneswar', 'Mysuru', 'Mangaluru', 'Vadodara', 'Nashik',
  'Guwahati', 'Dehradun', 'Patna', 'Raipur', 'Ranchi', 'Jodhpur', 'Amritsar',
] as const

export const COLLEGES = [
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur',
  'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad', 'IIT (BHU) Varanasi',
  'NIT Trichy', 'NIT Surathkal', 'NIT Warangal', 'NIT Rourkela', 'NIT Calicut',
  'IIIT Hyderabad', 'IIIT Bangalore', 'IIIT Allahabad', 'IIIT Delhi',
  'BITS Pilani', 'IISc Bangalore', 'Delhi Technological University',
  'Delhi University', 'VIT Vellore', 'Manipal Institute of Technology',
  'Anna University', 'Jadavpur University', 'SRM Institute of Science & Technology',
  'Amity University', 'Thapar Institute of Engineering & Technology',
  'PES University', 'RV College of Engineering', 'BMS College of Engineering',
  'College of Engineering Pune', 'NSUT Delhi', 'IGDTUW Delhi',
] as const

export const COURSES = [
  'B.Tech — Computer Science',
  'B.Tech — Information Technology',
  'B.Tech — Electronics & Communication',
  'B.Tech — Electrical Engineering',
  'B.Tech — Mechanical Engineering',
  'B.Tech — Civil Engineering',
  'B.E. — Computer Science',
  'BCA', 'MCA',
  'B.Sc — Computer Science', 'B.Sc — Information Technology', 'B.Sc — Data Science',
  'M.Tech — Computer Science',
  'B.Des', 'M.Des',
  'BBA', 'MBA', 'B.Com', 'M.Com',
  'B.A.', 'M.A.', 'B.Sc', 'M.Sc',
  'Diploma in Engineering', 'Ph.D.',
] as const

export const INDUSTRIES = [
  'SaaS', 'Fintech', 'E-commerce', 'EdTech', 'HealthTech', 'Artificial Intelligence',
  'Cybersecurity', 'Gaming', 'Consulting', 'Manufacturing', 'Marketing & Advertising',
  'Media & Entertainment', 'Logistics & Supply Chain', 'Real Estate',
  'Banking & Finance', 'Healthcare', 'Retail', 'Telecommunications', 'Automotive',
  'Energy', 'Agriculture', 'Travel & Hospitality', 'Non-profit', 'Government',
] as const

const CURRENT_YEAR = new Date().getFullYear()
export const GRADUATION_YEARS = Array.from(
  { length: 13 },
  (_, i) => String(CURRENT_YEAR + 6 - i),
)
