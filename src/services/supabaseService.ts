
import { supabase } from '@/integrations/supabase/client';
import { User, Course, Grade, GradeReport, ClassPerformance, AuditLog } from '@/types';

// Profiles
export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Courses
export const fetchCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      teacher:teacher_id (
        id,
        profiles (full_name)
      )
    `)
    .order('name', { ascending: true });
    
  if (error) throw error;
  
  return data.map((course) => ({
    id: course.id,
    name: course.name,
    code: course.code,
    teacherId: course.teacher_id,
    teacherName: course.teacher?.profiles?.full_name || 'Unknown',
  }));
};

export const fetchCoursesByTeacher = async (teacherId: string) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('name', { ascending: true });
    
  if (error) throw error;
  return data;
};

export const fetchCoursesByStudent = async (studentId: string) => {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      course_id,
      courses (
        id,
        name,
        code,
        teacher_id,
        teacher:teacher_id (
          id,
          profiles (full_name)
        )
      )
    `)
    .eq('student_id', studentId);
    
  if (error) throw error;
  
  return data.map((enrollment) => ({
    id: enrollment.courses.id,
    name: enrollment.courses.name,
    code: enrollment.courses.code,
    teacherId: enrollment.courses.teacher_id,
    teacherName: enrollment.courses.teacher?.profiles?.full_name || 'Unknown',
  }));
};

// Enrollments
export const fetchEnrollments = async (courseId: string) => {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      id,
      student_id,
      student:student_id (
        id,
        profiles (full_name)
      )
    `)
    .eq('course_id', courseId);
    
  if (error) throw error;
  
  return data.map((enrollment) => ({
    id: enrollment.id,
    studentId: enrollment.student_id,
    studentName: enrollment.student?.profiles?.full_name || 'Unknown',
  }));
};

// Grades
export const fetchGradesByStudent = async (studentId: string) => {
  const { data, error } = await supabase
    .from('grades')
    .select(`
      *,
      course:course_id (
        id,
        name,
        code
      ),
      grader:graded_by (
        id,
        profiles (full_name)
      )
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  return data.map((grade) => ({
    id: grade.id,
    studentId: grade.student_id,
    studentName: '', // Will be filled by the calling component
    courseId: grade.course_id,
    courseName: grade.course?.name || 'Unknown',
    value: grade.value,
    comment: grade.comment,
    date: grade.graded_at,
  }));
};

export const fetchGradesByCourse = async (courseId: string) => {
  const { data, error } = await supabase
    .from('grades')
    .select(`
      *,
      student:student_id (
        id,
        profiles (full_name)
      )
    `)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  return data.map((grade) => ({
    id: grade.id,
    studentId: grade.student_id,
    studentName: grade.student?.profiles?.full_name || 'Unknown',
    courseId: grade.course_id,
    courseName: '', // Will be filled by the calling component
    value: grade.value,
    comment: grade.comment,
    date: grade.graded_at,
  }));
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
      .eq('id', studentId)
      .single();
      
    return {
      studentId,
      studentName: profile?.full_name || 'Unknown',
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
      .select(`
        *,
        teacher:teacher_id (
          id,
          profiles (full_name)
        )
      `)
      .eq('id', courseId)
      .single();
      
    if (!course) {
      return null;
    }
    
    // Get all grades for this course
    const grades = await fetchGradesByCourse(courseId);
    
    if (!grades.length) {
      return {
        courseId,
        courseName: course.name,
        teacherId: course.teacher_id,
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
      courseName: course.name,
      teacherId: course.teacher_id,
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
      .select(`
        *,
        user:user_id (
          id,
          profiles (full_name, role)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return data.map(log => ({
      id: log.id,
      userId: log.user_id,
      userName: log.user?.profiles?.full_name || 'System',
      userRole: (log.user?.profiles?.role as UserRole) || 'admin',
      action: log.action,
      details: log.details,
      timestamp: log.created_at,
    }));
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
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
      });
      
    if (error) throw error;
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};
