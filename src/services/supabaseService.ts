
import { supabase } from '@/integrations/supabase/client';
import { User, Course, Grade, GradeReport, ClassPerformance, AuditLog, UserRole } from '@/types';
import { Database } from '@/integrations/supabase/types';

type ProfilesRow = Database['public']['Tables']['profiles']['Row'];
type CoursesRow = Database['public']['Tables']['courses']['Row'];
type GradesRow = Database['public']['Tables']['grades']['Row'];
type EnrollmentsRow = Database['public']['Tables']['enrollments']['Row'];
type AuditLogsRow = Database['public']['Tables']['audit_logs']['Row'];

// Profiles
export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .filter('id', 'eq', userId)
    .single();
    
  if (error) throw error;
  return data as ProfilesRow;
};

export const updateUserProfile = async (userId: string, updates: Partial<ProfilesRow>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates as any) // Type cast as any to bypass strict type checking
    .filter('id', 'eq', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data as ProfilesRow;
};

// Courses
export const fetchCourses = async () => {
  // First, fetch all courses
  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select('*')
    .order('name', { ascending: true });
    
  if (coursesError) throw coursesError;
  
  // Cast the coursesData to the correct type
  const typedCoursesData = coursesData as CoursesRow[];
  
  // Then, for each course, fetch the teacher profile
  const coursesWithTeachers = await Promise.all(typedCoursesData.map(async (course) => {
    if (course.teacher_id) {
      const { data: teacherProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .filter('id', 'eq', course.teacher_id)
        .single();
        
      return {
        id: course.id,
        name: course.name,
        code: course.code,
        teacherId: course.teacher_id,
        teacherName: (teacherProfile as ProfilesRow)?.full_name || 'Unknown',
      };
    } else {
      return {
        id: course.id,
        name: course.name,
        code: course.code,
        teacherId: null,
        teacherName: 'Unassigned',
      };
    }
  }));
  
  return coursesWithTeachers;
};

export const fetchCoursesByTeacher = async (teacherId: string) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .filter('teacher_id', 'eq', teacherId)
    .order('name', { ascending: true });
    
  if (error) throw error;
  return data as CoursesRow[];
};

export const fetchCoursesByStudent = async (studentId: string) => {
  // First, get all enrollments for this student
  const { data: enrollmentsData, error: enrollmentsError } = await supabase
    .from('enrollments')
    .select('course_id')
    .filter('student_id', 'eq', studentId);
    
  if (enrollmentsError) throw enrollmentsError;
  
  // Cast to the correct type
  const typedEnrollmentsData = enrollmentsData as EnrollmentsRow[];
  
  if (!typedEnrollmentsData.length) {
    return [];
  }
  
  // Extract course IDs
  const courseIds = typedEnrollmentsData.map(enrollment => enrollment.course_id);
  
  // Fetch courses
  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select('*')
    .in('id', courseIds)
    .order('name', { ascending: true });
    
  if (coursesError) throw coursesError;
  
  // Cast the coursesData to the correct type
  const typedCoursesData = coursesData as CoursesRow[];
  
  // Get teacher names for each course
  const coursesWithTeachers = await Promise.all(typedCoursesData.map(async (course) => {
    if (course.teacher_id) {
      const { data: teacherProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .filter('id', 'eq', course.teacher_id)
        .single();
        
      return {
        id: course.id,
        name: course.name,
        code: course.code,
        teacherId: course.teacher_id,
        teacherName: (teacherProfile as ProfilesRow)?.full_name || 'Unknown',
      };
    } else {
      return {
        id: course.id,
        name: course.name,
        code: course.code,
        teacherId: null,
        teacherName: 'Unassigned',
      };
    }
  }));
  
  return coursesWithTeachers;
};

// Enrollments
export const fetchEnrollments = async (courseId: string) => {
  const { data: enrollmentsData, error: enrollmentsError } = await supabase
    .from('enrollments')
    .select('id, student_id')
    .filter('course_id', 'eq', courseId);
    
  if (enrollmentsError) throw enrollmentsError;
  
  // Cast to the correct type
  const typedEnrollmentsData = enrollmentsData as EnrollmentsRow[];
  
  // Fetch student names
  const enrollmentsWithStudents = await Promise.all(typedEnrollmentsData.map(async (enrollment) => {
    const { data: studentProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .filter('id', 'eq', enrollment.student_id)
      .single();
      
    return {
      id: enrollment.id,
      studentId: enrollment.student_id,
      studentName: (studentProfile as ProfilesRow)?.full_name || 'Unknown',
    };
  }));
  
  return enrollmentsWithStudents;
};

// Grades
export const fetchGradesByStudent = async (studentId: string) => {
  const { data: gradesData, error: gradesError } = await supabase
    .from('grades')
    .select('*')
    .filter('student_id', 'eq', studentId)
    .order('created_at', { ascending: false });
    
  if (gradesError) throw gradesError;
  
  // Cast to the correct type
  const typedGradesData = gradesData as GradesRow[];
  
  // Fetch course names and grader names
  const gradesWithDetails = await Promise.all(typedGradesData.map(async (grade) => {
    // Get course details
    const { data: course } = await supabase
      .from('courses')
      .select('name')
      .filter('id', 'eq', grade.course_id)
      .single();
      
    return {
      id: grade.id,
      studentId: grade.student_id,
      studentName: '', // Will be filled by the calling component
      courseId: grade.course_id,
      courseName: (course as CoursesRow)?.name || 'Unknown',
      value: grade.value,
      comment: grade.comment,
      date: grade.graded_at,
    };
  }));
  
  return gradesWithDetails;
};

export const fetchGradesByCourse = async (courseId: string) => {
  const { data: gradesData, error: gradesError } = await supabase
    .from('grades')
    .select('*')
    .filter('course_id', 'eq', courseId)
    .order('created_at', { ascending: false });
    
  if (gradesError) throw gradesError;
  
  // Cast to the correct type
  const typedGradesData = gradesData as GradesRow[];
  
  // Fetch student names
  const gradesWithStudents = await Promise.all(typedGradesData.map(async (grade) => {
    const { data: studentProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .filter('id', 'eq', grade.student_id)
      .single();
      
    return {
      id: grade.id,
      studentId: grade.student_id,
      studentName: (studentProfile as ProfilesRow)?.full_name || 'Unknown',
      courseId: grade.course_id,
      courseName: '', // Will be filled by the calling component
      value: grade.value,
      comment: grade.comment,
      date: grade.graded_at,
    };
  }));
  
  return gradesWithStudents;
};

// Student reports
export const fetchStudentReport = async (studentId: string): Promise<GradeReport | null> => {
  try {
    // Get all courses the student is enrolled in
    const courses = await fetchCoursesByStudent(studentId);
    
    if (!courses.length) {
      return null;
    }
    
    // Get all grades for the student
    const allGrades = await fetchGradesByStudent(studentId);
    
    // Group grades by course
    const courseGrades = courses.map(course => {
      const grades = allGrades.filter(grade => grade.courseId === course.id);
      
      // Calculate average grade for this course
      const average = grades.length > 0
        ? Number((grades.reduce((sum, grade) => sum + Number(grade.value), 0) / grades.length).toFixed(1))
        : 0;
        
      return {
        courseId: course.id,
        courseName: course.name,
        grades,
        average,
      };
    });
    
    // Calculate overall average
    const overallAverage = courseGrades.length > 0
      ? Number((courseGrades.reduce((sum, course) => sum + course.average, 0) / courseGrades.length).toFixed(1))
      : 0;
    
    // Get user profile to get the student name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .filter('id', 'eq', studentId)
      .single();
      
    return {
      studentId,
      studentName: (profile as ProfilesRow)?.full_name || 'Unknown',
      courses: courseGrades,
      overallAverage,
    };
  } catch (error) {
    console.error('Error fetching student report:', error);
    return null;
  }
};

// Teacher dashboard data
export const fetchClassPerformance = async (courseId: string): Promise<ClassPerformance | null> => {
  try {
    // Get course details
    const { data: course } = await supabase
      .from('courses')
      .select('*')
      .filter('id', 'eq', courseId)
      .single();
      
    if (!course) {
      return null;
    }
    
    // Cast to correct type
    const typedCourse = course as CoursesRow;
    
    // Get all grades for this course
    const grades = await fetchGradesByCourse(courseId);
    
    if (!grades.length) {
      return {
        courseId,
        courseName: typedCourse.name,
        teacherId: typedCourse.teacher_id || '',
        averageGrade: 0,
        highestGrade: 0,
        lowestGrade: 0,
        studentCount: 0,
        gradeDistribution: {
          A: 0,
          B: 0,
          C: 0,
          D: 0,
          F: 0,
        },
      };
    }
    
    // Calculate statistics
    const gradeValues = grades.map(g => Number(g.value));
    const averageGrade = Number((gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length).toFixed(1));
    const highestGrade = Math.max(...gradeValues);
    const lowestGrade = Math.min(...gradeValues);
    
    // Count unique students
    const studentCount = new Set(grades.map(g => g.studentId)).size;
    
    // Calculate grade distribution
    const gradeDistribution = {
      A: grades.filter(g => g.value >= 90).length,
      B: grades.filter(g => g.value >= 80 && g.value < 90).length,
      C: grades.filter(g => g.value >= 70 && g.value < 80).length,
      D: grades.filter(g => g.value >= 60 && g.value < 70).length,
      F: grades.filter(g => g.value < 60).length,
    };
    
    return {
      courseId,
      courseName: typedCourse.name,
      teacherId: typedCourse.teacher_id || '',
      averageGrade,
      highestGrade,
      lowestGrade,
      studentCount,
      gradeDistribution,
    };
  } catch (error) {
    console.error('Error fetching class performance:', error);
    return null;
  }
};

// Audit logs
export const fetchAuditLogs = async (limit = 10): Promise<AuditLog[]> => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    // Cast to correct type
    const typedLogsData = data as AuditLogsRow[];
    
    // Fetch user profiles for each log
    const logsWithUserDetails = await Promise.all(typedLogsData.map(async (log) => {
      if (log.user_id) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .filter('id', 'eq', log.user_id)
          .single();
          
        return {
          id: log.id,
          userId: log.user_id,
          userName: (userProfile as ProfilesRow)?.full_name || 'System',
          userRole: (userProfile as ProfilesRow)?.role as UserRole || 'admin',
          action: log.action,
          details: typeof log.details === 'string' ? log.details : JSON.stringify(log.details),
          timestamp: log.created_at,
        };
      } else {
        return {
          id: log.id,
          userId: '',
          userName: 'System',
          userRole: 'admin' as UserRole,
          action: log.action,
          details: typeof log.details === 'string' ? log.details : JSON.stringify(log.details),
          timestamp: log.created_at,
        };
      }
    }));
    
    return logsWithUserDetails;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
};

// Helper function to create an audit log
export const createAuditLog = async (
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: any
) => {
  try {
    const insertData = {
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    };
    
    const { error } = await supabase
      .from('audit_logs')
      .insert(insertData as any); // Type cast as any to bypass strict type checking
      
    if (error) throw error;
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};
