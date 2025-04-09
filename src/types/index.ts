
export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  teacherName: string;
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  value: number;
  comment?: string;
  date: string;
}

export interface GradeReport {
  studentId: string;
  studentName: string;
  courses: {
    courseId: string;
    courseName: string;
    grades: Grade[];
    average: number;
  }[];
  overallAverage: number;
}

export interface ClassPerformance {
  courseId: string;
  courseName: string;
  teacherId: string;
  averageGrade: number;
  highestGrade: number;
  lowestGrade: number;
  studentCount: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}
