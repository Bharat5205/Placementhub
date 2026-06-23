// ─── Realistic Mock Data for Demo Mode ────────────────────────────────────────

export const mockStudentUser = {
  id: 'mock-student-001',
  name: 'Rahul Kumar',
  email: 'rahul@college.edu',
  role: 'student',
  roll_number: '22CSE042',
  branch: 'CSE',
  cgpa: 8.75,
  created_at: '2024-08-01T10:00:00Z',
};

export const mockCoordinatorUser = {
  id: 'mock-coord-001',
  name: 'Dr. Priya Sharma',
  email: 'coordinator@crms.edu',
  role: 'coordinator',
  roll_number: null,
  branch: null,
  cgpa: null,
  created_at: '2024-07-01T10:00:00Z',
};

export const mockCompanies = [
  { id: 'c1', name: 'Google', logo_url: 'google.svg', role_offered: 'Software Engineer', package_lpa: 25.0, eligibility_cgpa: 8.0, visit_date: '2026-08-15T00:00:00Z', application_deadline: '2026-07-31T00:00:00Z', description: 'Google LLC is a global technology leader known for its search engine, cloud services, and hardware products. Join the team that builds products used by billions.', hiring_process: 'Online Assessment → 2 Technical Interviews → HR Round', is_active: true },
  { id: 'c2', name: 'Microsoft', logo_url: 'microsoft.svg', role_offered: 'SDE-1', package_lpa: 20.0, eligibility_cgpa: 7.5, visit_date: '2026-09-01T00:00:00Z', application_deadline: '2026-08-15T00:00:00Z', description: 'Microsoft Corporation is an American multinational tech company. Makers of Windows, Azure, and Office 365.', hiring_process: 'Coding Test → 3 Technical Rounds → Bar Raiser', is_active: true },
  { id: 'c3', name: 'Amazon', logo_url: 'amazon.svg', role_offered: 'SDE-1', package_lpa: 18.5, eligibility_cgpa: 7.0, visit_date: '2026-09-15T00:00:00Z', application_deadline: '2026-09-01T00:00:00Z', description: 'Amazon is a global e-commerce and cloud computing giant. AWS is the worlds leading cloud platform.', hiring_process: 'OA → 2 Technical → Bar Raiser → HR', is_active: true },
  { id: 'c10', name: 'D. E. Shaw', logo_url: 'deshaw.svg', role_offered: 'Software Development Engineer', package_lpa: 35.0, eligibility_cgpa: 8.5, visit_date: '2026-08-20T00:00:00Z', application_deadline: '2026-08-05T00:00:00Z', description: 'D. E. Shaw & Co. is a global investment and technology development firm.', hiring_process: 'Aptitude & Coding Test → 3 Technical Interviews → HR Round', is_active: true },
  { id: 'c11', name: 'Cisco', logo_url: 'cisco.svg', role_offered: 'Software Engineer', package_lpa: 18.0, eligibility_cgpa: 7.5, visit_date: '2026-08-25T00:00:00Z', application_deadline: '2026-08-10T00:00:00Z', description: 'Cisco Systems, Inc. is a multinational digital communications technology conglomerate corporation.', hiring_process: 'Aptitude & Coding OA → Technical Interview 1 → Technical Interview 2 → HR Round', is_active: true },
  { id: 'c4', name: 'Wipro', logo_url: 'wipro.svg', role_offered: 'Project Engineer', package_lpa: 3.5, eligibility_cgpa: 6.0, visit_date: '2026-07-10T00:00:00Z', application_deadline: '2026-07-01T00:00:00Z', description: 'Wipro Limited is an Indian multinational IT company providing services across 50+ countries.', hiring_process: 'Written Test → Technical → HR', is_active: true },
  { id: 'c5', name: 'Infosys', logo_url: 'infosys.svg', role_offered: 'Systems Engineer', package_lpa: 3.6, eligibility_cgpa: 6.0, visit_date: '2026-07-20T00:00:00Z', application_deadline: '2026-07-10T00:00:00Z', description: 'Infosys is a global leader in technology services and consulting.', hiring_process: 'InfyTQ Test → HR', is_active: true },
  { id: 'c6', name: 'TCS', logo_url: 'tcs.svg', role_offered: 'Assistant System Engineer', package_lpa: 3.36, eligibility_cgpa: 6.0, visit_date: '2026-07-25T00:00:00Z', application_deadline: '2026-07-15T00:00:00Z', description: 'Tata Consultancy Services is India\'s largest IT company.', hiring_process: 'TCS NQT → Technical → HR', is_active: true },
  { id: 'c7', name: 'Razorpay', logo_url: 'razorpay.svg', role_offered: 'Backend Engineer', package_lpa: 12.0, eligibility_cgpa: 7.5, visit_date: '2026-10-05T00:00:00Z', application_deadline: '2026-09-20T00:00:00Z', description: 'Razorpay is India\'s leading payment gateway and financial technology company.', hiring_process: 'Coding Round → 2 Technical Interviews → Culture Fit', is_active: true },
  { id: 'c8', name: 'Swiggy', logo_url: 'swiggy.svg', role_offered: 'Software Engineer', package_lpa: 14.0, eligibility_cgpa: 7.0, visit_date: '2026-10-12T00:00:00Z', application_deadline: '2026-09-28T00:00:00Z', description: 'Swiggy is India\'s largest food and grocery delivery platform.', hiring_process: 'OA → 3 Technical Rounds → HR', is_active: true },
  { id: 'c9', name: 'Zomato', logo_url: 'zomato.svg', role_offered: 'Full Stack Developer', package_lpa: 13.0, eligibility_cgpa: 7.0, visit_date: '2026-10-18T00:00:00Z', application_deadline: '2026-10-05T00:00:00Z', description: 'Zomato is a global restaurant discovery and food delivery service.', hiring_process: 'Coding Challenge → Technical → HR', is_active: true },
];

export const mockNotifications = [
  { id: 'n1', title: '🚨 Google Drive Announced!', message: 'Google will be visiting campus on August 15th for SWE roles. Package: 25 LPA. Minimum CGPA: 8.0. Register before July 31st.', priority: 'high', created_at: '2026-06-15T09:00:00Z', is_read: false },
  { id: 'n2', title: 'Resume Submission Deadline', message: 'Please submit your updated resumes to the placement cell by June 30th for the upcoming placement season. Ensure your LinkedIn profile is updated.', priority: 'medium', created_at: '2026-06-13T11:00:00Z', is_read: false },
  { id: 'n3', title: 'Pre-Placement Talk - Microsoft', message: 'Microsoft will conduct a pre-placement talk on September 1st at 10 AM in the main auditorium (Block A). Attendance is mandatory for registered students.', priority: 'medium', created_at: '2026-06-12T14:00:00Z', is_read: true },
  { id: 'n4', title: 'Mock Interview Sessions', message: 'Register for mock interview sessions being conducted by the placement cell every Saturday. Limited seats available.', priority: 'low', created_at: '2026-06-10T08:00:00Z', is_read: true },
  { id: 'n5', title: '📋 Aptitude Test - TCS NQT', message: 'TCS NQT preparation workshop scheduled for July 5th. Practice resources shared on the placement portal.', priority: 'medium', created_at: '2026-06-09T10:00:00Z', is_read: true },
];

export const mockExperiences = [
  { id: 'e1', student_name: 'Ananya Reddy', roll_number: '21CSE018', branch: 'CSE', company_name: 'Google', batch_year: '2025', title: 'Google SDE-1 Interview Experience', role_offered: 'Software Engineer', difficulty_level: 'Hard', resources_links: 'https://leetcode.com/discuss/interview-experience, https://www.geeksforgeeks.org/google-interview-experience/', interview_rounds: 'Online Assessment → Technical Round 1 → Technical Round 2 → Googleyness & Leadership', experience: 'The process started with a 90-minute online assessment covering DSA, aptitude, and logical reasoning. Then came 2 technical rounds focused on system design and problem solving. The interviewers were very friendly and asked me to think aloud. Topics covered included dynamic programming, graphs, and API design. Make sure to practice LeetCode medium/hard problems.', preparation_tips: 'Focus on LeetCode, especially graphs and DP. Practice system design for SDE-2 level. Read about Google\'s engineering culture.', status: 'approved', created_at: '2026-05-10T09:00:00Z' },
  { id: 'e2', student_name: 'Karthik Nair', roll_number: '21CSE027', branch: 'CSE', company_name: 'Microsoft', batch_year: '2025', title: 'Microsoft SDE-1 Interview Experience', role_offered: 'SDE-1', difficulty_level: 'Medium', resources_links: 'https://www.geeksforgeeks.org/microsoft-interview-experience/', interview_rounds: 'Coding Test → Technical Round 1 → Technical Round 2 → Technical Round 3 → HR', experience: 'Microsoft\'s process was thorough but fair. The coding test had 3 problems to be solved in 90 minutes. Technical rounds focused heavily on OOP concepts, OS, DBMS, and problem solving. One round was a system design round where I had to design a URL shortener. HR was very chill - they asked about my interests and why Microsoft.', preparation_tips: 'STAR method for HR questions. Study OS, DBMS thoroughly. Practice system design on YouTube. Behavior questions are very important at Microsoft.', status: 'approved', created_at: '2026-04-22T11:00:00Z' },
  { id: 'e3', student_name: 'Pooja Menon', roll_number: '21ECE034', branch: 'ECE', company_name: 'Amazon', batch_year: '2025', title: 'Amazon SDE-1 Interview Experience', role_offered: 'SDE-1', difficulty_level: 'Hard', resources_links: 'https://www.geeksforgeeks.org/amazon-interview-experience/', interview_rounds: 'Online Assessment → Technical 1 → Technical 2 → Bar Raiser → HR', experience: 'Amazon was an intense experience. The OA had 2 coding problems + work simulation questions. Technical rounds revolved around Amazon\'s 16 Leadership Principles — every answer needs to be backed by a story. Bar Raiser round was the toughest. They test your thinking process more than the final answer.', preparation_tips: 'Study all 16 Amazon Leadership Principles deeply. Prepare STAR stories for each. Practice behavioral questions as much as technical ones.', status: 'approved', created_at: '2026-04-15T13:00:00Z' },
];

export const mockStudents = [
  { id: 's1', name: 'Rahul Kumar', email: 'rahul@college.edu', roll_number: '22CSE042', branch: 'CSE', cgpa: 8.75 },
  { id: 's2', name: 'Ananya Reddy', email: 'ananya@college.edu', roll_number: '21CSE018', branch: 'CSE', cgpa: 9.1 },
  { id: 's3', name: 'Karthik Nair', email: 'karthik@college.edu', roll_number: '21CSE027', branch: 'CSE', cgpa: 8.3 },
  { id: 's4', name: 'Pooja Menon', email: 'pooja@college.edu', roll_number: '21ECE034', branch: 'ECE', cgpa: 7.8 },
  { id: 's5', name: 'Arjun Singh', email: 'arjun@college.edu', roll_number: '22ME011', branch: 'ME', cgpa: 7.2 },
  { id: 's6', name: 'Divya Krishnan', email: 'divya@college.edu', roll_number: '22CSE055', branch: 'CSE', cgpa: 8.9 },
  { id: 's7', name: 'Rohan Gupta', email: 'rohan@college.edu', roll_number: '21IT019', branch: 'IT', cgpa: 8.0 },
  { id: 's8', name: 'Sneha Iyer', email: 'sneha@college.edu', roll_number: '22CSE067', branch: 'CSE', cgpa: 9.3 },
  { id: 's9', name: 'Vikram Patel', email: 'vikram@college.edu', roll_number: '21EEE022', branch: 'EEE', cgpa: 6.8 },
  { id: 's10', name: 'Meera Nambiar', email: 'meera@college.edu', roll_number: '22AIDS008', branch: 'AIDS', cgpa: 8.5 },
];

export const mockStudentDashboard = {
  stats: { totalCompanies: 9, upcomingCompanies: 7, eligibleCompanies: 7 },
  placementStats: {
    minPackage: 3.36,
    maxPackage: 25.0,
    avgPackage: 11.69,
    totalDrives: 9,
    distribution: [
      { range: '< 5 LPA', count: 3 },
      { range: '5-10 LPA', count: 0 },
      { range: '10-20 LPA', count: 3 },
      { range: '> 20 LPA', count: 2 }
    ]
  },
  upcomingDrives: mockCompanies.slice(0, 5),
  closingSoon: mockCompanies.slice(3, 6),
  eligibleCompaniesList: mockCompanies.filter(c => c.eligibility_cgpa <= 8.5).slice(0, 4),
  recentNotifications: mockNotifications.slice(0, 4),
  recentExperiences: mockExperiences.slice(0, 3)
};

export const mockCoordinatorDashboard = {
  stats: { totalStudents: 10, totalCompanies: 9, upcomingDrives: 7, totalExperiences: 3 },
  packageDistribution: [
    { range: '< 5 LPA', count: '3' },
    { range: '5-10 LPA', count: '0' },
    { range: '10-20 LPA', count: '3' },
    { range: '> 20 LPA', count: '2' },
  ],
  recentNotifications: mockNotifications.slice(0, 4),
};

export const mockPagination = (data, page = 1, limit = 10) => ({
  success: true,
  data,
  pagination: {
    total: data.length,
    page,
    limit,
    totalPages: Math.ceil(data.length / limit),
    hasNext: false,
    hasPrev: false,
  },
});
