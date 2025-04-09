
import { Course, Grade, User, ClassPerformance, AuditLog, GradeReport } from '@/types';

// Mock Students
export const mockStudents: User[] = [
  {
    id: '3',
    name: 'Student User',
    email: 'student@example.com',
    role: 'student',
    avatar: 'https://ui-avatars.com/api/?name=Student+User&background=22c55e&color=fff',
  },
  {
    id: '4',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'student',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=22c55e&color=fff',
  },
  {
    id: '5',
    name: 'Maria Garcia',
    email: 'maria@example.com',
    role: 'student',
    avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=22c55e&color=fff',
  },
  {
    id: '6',
    name: 'James Wilson',
    email: 'james@example.com',
    role: 'student',
    avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=22c55e&color=fff',
  },
  {
    id: '7',
    name: 'Emily Chen',
    email: 'emily@example.com',
    role: 'student',
    avatar: 'https://ui-avatars.com/api/?name=Emily+Chen&background=22c55e&color=fff',
  },
];

// Mock Teachers
export const mockTeachers: User[] = [
  {
    id: '2',
    name: 'Teacher User',
    email: 'teacher@example.com',
    role: 'teacher',
    avatar: 'https://ui-avatars.com/api/?name=Teacher+User&background=8b5cf6&color=fff',
  },
  {
    id: '8',
    name: 'Dr. Robert Smith',
    email: 'robert@example.com',
    role: 'teacher',
    avatar: 'https://ui-avatars.com/api/?name=Robert+Smith&background=8b5cf6&color=fff',
  },
  {
    id: '9',
    name: 'Prof. Lisa Wong',
    email: 'lisa@example.com',
    role: 'teacher',
    avatar: 'https://ui-avatars.com/api/?name=Lisa+Wong&background=8b5cf6&color=fff',
  },
];

// Mock Admins
export const mockAdmins: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff',
  },
];

// Mock Courses
export const mockCourses: Course[] = [
  {
    id: 'c1',
    name: 'Mathematics 101',
    code: 'MATH101',
    teacherId: '2',
    teacherName: 'Teacher User',
  },
  {
    id: 'c2',
    name: 'Physics 101',
    code: 'PHYS101',
    teacherId: '2',
    teacherName: 'Teacher User',
  },
  {
    id: 'c3',
    name: 'Computer Science Fundamentals',
    code: 'CS101',
    teacherId: '8',
    teacherName: 'Dr. Robert Smith',
  },
  {
    id: 'c4',
    name: 'Biology Basics',
    code: 'BIO101',
    teacherId: '9',
    teacherName: 'Prof. Lisa Wong',
  },
  {
    id: 'c5',
    name: 'History of Art',
    code: 'ART101',
    teacherId: '9',
    teacherName: 'Prof. Lisa Wong',
  },
  {
    id: 'c6',
    name: 'Advanced Mathematics',
    code: 'MATH201',
    teacherId: '2',
    teacherName: 'Teacher User',
  },
];

// Generate random grades
const generateRandomGrades = (): Grade[] => {
  const grades: Grade[] = [];
  
  mockStudents.forEach(student => {
    mockCourses.forEach(course => {
      // Generate 1-3 grades per course per student
      const gradeCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < gradeCount; i++) {
        const value = Math.floor(Math.random() * 40) + 61; // 61-100 range
        const now = new Date();
        const randomDaysAgo = Math.floor(Math.random() * 60); // Up to 60 days ago
        const gradeDate = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);
        
        grades.push({
          id: `g${grades.length + 1}`,
          studentId: student.id,
          studentName: student.name,
          courseId: course.id,
          courseName: course.name,
          value,
          comment: value >= 90 ? 'Excellent work!' : value >= 80 ? 'Good job.' : value >= 70 ? 'Satisfactory.' : 'Needs improvement.',
          date: gradeDate.toISOString().split('T')[0],
        });
      }
    });
  });
  
  return grades;
};

// Mock Grades
export const mockGrades = generateRandomGrades();

// Generate class performance data
export const generateClassPerformance = (): ClassPerformance[] => {
  return mockCourses.map(course => {
    const courseGrades = mockGrades.filter(grade => grade.courseId === course.id);
    const values = courseGrades.map(grade => grade.value);
    const average = values.length ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    
    // Count students in this course
    const studentIds = new Set(courseGrades.map(grade => grade.studentId));
    
    // Calculate grade distribution
    const gradeDistribution = {
      A: 0, // 90-100
      B: 0, // 80-89
      C: 0, // 70-79
      D: 0, // 60-69
      F: 0, // 0-59
    };
    
    values.forEach(value => {
      if (value >= 90) gradeDistribution.A++;
      else if (value >= 80) gradeDistribution.B++;
      else if (value >= 70) gradeDistribution.C++;
      else if (value >= 60) gradeDistribution.D++;
      else gradeDistribution.F++;
    });
    
    return {
      courseId: course.id,
      courseName: course.name,
      teacherId: course.teacherId,
      averageGrade: parseFloat(average.toFixed(1)),
      highestGrade: values.length ? Math.max(...values) : 0,
      lowestGrade: values.length ? Math.min(...values) : 0,
      studentCount: studentIds.size,
      gradeDistribution,
    };
  });
};

// Generate audit logs
export const generateAuditLogs = (): AuditLog[] => {
  const actions = [
    'Login',
    'Logout',
    'Add Grade',
    'Edit Grade',
    'View Report',
    'Add User',
    'Edit User',
    'Download Report',
  ];
  
  const logs: AuditLog[] = [];
  const allUsers = [...mockAdmins, ...mockTeachers, ...mockStudents];
  
  // Generate 50 random logs
  for (let i = 0; i < 50; i++) {
    const user = allUsers[Math.floor(Math.random() * allUsers.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const now = new Date();
    const randomDaysAgo = Math.floor(Math.random() * 30); // Up to 30 days ago
    const randomMinutesAgo = Math.floor(Math.random() * 1440); // Up to 24 hours ago in minutes
    const logDate = new Date(now.getTime() - (randomDaysAgo * 24 * 60 * 60 * 1000) - (randomMinutesAgo * 60 * 1000));
    
    let details = '';
    switch (action) {
      case 'Login':
        details = `User logged in from IP 192.168.1.${Math.floor(Math.random() * 255)}`;
        break;
      case 'Logout':
        details = 'User logged out';
        break;
      case 'Add Grade':
        details = `Added grade for ${mockStudents[Math.floor(Math.random() * mockStudents.length)].name} in ${mockCourses[Math.floor(Math.random() * mockCourses.length)].name}`;
        break;
      case 'Edit Grade':
        details = `Modified grade for ${mockStudents[Math.floor(Math.random() * mockStudents.length)].name} in ${mockCourses[Math.floor(Math.random() * mockCourses.length)].name}`;
        break;
      case 'View Report':
        details = `Viewed performance report for ${user.role === 'student' ? 'self' : mockCourses[Math.floor(Math.random() * mockCourses.length)].name}`;
        break;
      case 'Add User':
        details = `Added new user with role: ${['student', 'teacher', 'admin'][Math.floor(Math.random() * 3)]}`;
        break;
      case 'Edit User':
        details = `Updated user profile for ${allUsers[Math.floor(Math.random() * allUsers.length)].name}`;
        break;
      case 'Download Report':
        details = `Downloaded ${['PDF', 'CSV'][Math.floor(Math.random() * 2)]} report for ${mockCourses[Math.floor(Math.random() * mockCourses.length)].name}`;
        break;
    }
    
    logs.push({
      id: `log${i}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      details,
      timestamp: logDate.toISOString(),
    });
  }
  
  // Sort logs by timestamp (newest first)
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return logs;
};

// Generate grade reports for students
export const generateGradeReports = (): Record<string, GradeReport> => {
  const reports: Record<string, GradeReport> = {};
  
  mockStudents.forEach(student => {
    const studentGrades = mockGrades.filter(grade => grade.studentId === student.id);
    
    // Group grades by course
    const courseMap = new Map<string, { id: string, name: string, grades: Grade[] }>();
    
    studentGrades.forEach(grade => {
      if (!courseMap.has(grade.courseId)) {
        courseMap.set(grade.courseId, {
          id: grade.courseId,
          name: grade.courseName,
          grades: [],
        });
      }
      courseMap.get(grade.courseId)?.grades.push(grade);
    });
    
    // Calculate averages for each course
    const courses = Array.from(courseMap.values()).map(course => {
      const values = course.grades.map(grade => grade.value);
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      return {
        courseId: course.id,
        courseName: course.name,
        grades: course.grades,
        average: parseFloat(average.toFixed(1)),
      };
    });
    
    // Calculate overall average
    const allGrades = courses.flatMap(course => course.grades.map(grade => grade.value));
    const overallAverage = allGrades.length 
      ? parseFloat((allGrades.reduce((sum, val) => sum + val, 0) / allGrades.length).toFixed(1))
      : 0;
    
    reports[student.id] = {
      studentId: student.id,
      studentName: student.name,
      courses,
      overallAverage,
    };
  });
  
  return reports;
};

// Mock data service
export const mockDataService = {
  getAllUsers: () => [...mockAdmins, ...mockTeachers, ...mockStudents],
  getStudents: () => [...mockStudents],
  getTeachers: () => [...mockTeachers],
  getAdmins: () => [...mockAdmins],
  getCourses: () => [...mockCourses],
  getGrades: () => [...mockGrades],
  getAuditLogs: () => generateAuditLogs(),
  getClassPerformance: () => generateClassPerformance(),
  getGradeReports: () => generateGradeReports(),
  
  // Methods to get filtered data
  getStudentGrades: (studentId: string) => {
    return mockGrades.filter(grade => grade.studentId === studentId);
  },
  
  getCourseGrades: (courseId: string) => {
    return mockGrades.filter(grade => grade.courseId === courseId);
  },
  
  getTeacherCourses: (teacherId: string) => {
    return mockCourses.filter(course => course.teacherId === teacherId);
  },
  
  // Add a grade
  addGrade: (grade: Omit<Grade, 'id'>) => {
    const newGrade: Grade = {
      ...grade,
      id: `g${mockGrades.length + 1}`,
    };
    mockGrades.push(newGrade);
    return newGrade;
  },
  
  // Update a grade
  updateGrade: (gradeId: string, updates: Partial<Grade>) => {
    const index = mockGrades.findIndex(g => g.id === gradeId);
    if (index !== -1) {
      mockGrades[index] = { ...mockGrades[index], ...updates };
      return mockGrades[index];
    }
    return null;
  },
  
  getStudentReport: (studentId: string) => {
    const reports = generateGradeReports();
    return reports[studentId] || null;
  },
};
