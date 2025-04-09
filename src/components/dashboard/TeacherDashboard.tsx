
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockDataService } from '@/services/mockData';
import { Course, ClassPerformance } from '@/types';
import StatCard from './StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, Award, Pencil } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [performanceData, setPerformanceData] = useState<ClassPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      
      setTimeout(() => {
        // Get courses taught by this teacher
        const teacherCourses = mockDataService.getTeacherCourses(user.id);
        setCourses(teacherCourses);
        
        // Get performance data for these courses
        const allPerformanceData = mockDataService.getClassPerformance();
        const filteredPerformance = allPerformanceData.filter(
          (perf) => teacherCourses.some((course) => course.id === perf.courseId)
        );
        setPerformanceData(filteredPerformance);
        
        setLoading(false);
      }, 800);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate total students across all classes
  const totalStudents = performanceData.reduce((sum, course) => sum + course.studentCount, 0);
  
  // Calculate average grade across all classes
  const weightedAverage = performanceData.length
    ? performanceData.reduce((sum, course) => sum + (course.averageGrade * course.studentCount), 0) / totalStudents
    : 0;

  // Calculate how many grades were entered in the last 7 days (mock data)
  const recentGradesCount = Math.floor(Math.random() * 25) + 10; // 10-35 range

  // Get performance distribution data for charts
  const getDistributionData = (courseId: string) => {
    const course = performanceData.find((perf) => perf.courseId === courseId);
    if (!course) return [];
    
    return [
      { name: 'A', value: course.gradeDistribution.A },
      { name: 'B', value: course.gradeDistribution.B },
      { name: 'C', value: course.gradeDistribution.C },
      { name: 'D', value: course.gradeDistribution.D },
      { name: 'F', value: course.gradeDistribution.F },
    ];
  };

  const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#f97316', '#ef4444'];

  const selectedCourse = courses.length > 0 ? courses[0].id : '';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's an overview of your classes.
        </p>
      </div>
      
      <div className="dashboard-stats-grid">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={<Users className="h-4 w-4" />}
          description="Students across all classes"
        />
        
        <StatCard
          title="Classes"
          value={courses.length}
          icon={<BookOpen className="h-4 w-4" />}
          description="Total courses you're teaching"
        />
        
        <StatCard
          title="Average Performance"
          value={`${weightedAverage.toFixed(1)}%`}
          icon={<Award className="h-4 w-4" />}
          description="Across all your classes"
          trendValue={3.2}
          trendText="from last term"
        />
        
        <StatCard
          title="Recent Grades"
          value={recentGradesCount}
          icon={<Pencil className="h-4 w-4" />}
          description="Grades entered in the last 7 days"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Class Performance</CardTitle>
            <CardDescription>
              Average grades across your classes
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceData.map(perf => ({
                    name: perf.courseName,
                    average: perf.averageGrade,
                    highest: perf.highestGrade,
                    lowest: perf.lowestGrade,
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    tick={{ fontSize: 12 }}
                    height={70}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`]} />
                  <Bar dataKey="average" fill="#3b82f6" name="Average" />
                  <Bar dataKey="highest" fill="#22c55e" name="Highest" />
                  <Bar dataKey="lowest" fill="#ef4444" name="Lowest" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No performance data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>
              Grade breakdown by class
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length > 0 ? (
              <Tabs defaultValue={selectedCourse}>
                <TabsList className="w-full mb-4">
                  {courses.slice(0, 3).map((course) => (
                    <TabsTrigger key={course.id} value={course.id} className="flex-1">
                      {course.code}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {courses.map((course) => (
                  <TabsContent key={course.id} value={course.id} className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getDistributionData(course.id)}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => 
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {getDistributionData(course.id).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No courses available</p>
              </div>
            )}
            
            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={() => navigate('/classes')}>
                View All Classes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Student Activity</CardTitle>
            <CardDescription>Latest submissions and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { student: 'Alex Johnson', course: 'Mathematics 101', activity: 'Submitted final project', time: '2 hours ago' },
                { student: 'Maria Garcia', course: 'Physics 101', activity: 'Requested grade review', time: '1 day ago' },
                { student: 'James Wilson', course: 'Mathematics 101', activity: 'Viewed feedback', time: '2 days ago' },
                { student: 'Emily Chen', course: 'Physics 101', activity: 'Submitted assignment', time: '3 days ago' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.student}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.activity} in {activity.course}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <Button variant="outline" className="w-full" onClick={() => navigate('/grades')}>
                Enter New Grades
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => navigate('/grades')}>
                Grade Assignments
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/reports')}>
                Generate Class Report
              </Button>
              <Button variant="outline" className="w-full">
                Schedule a Class
              </Button>
              <Button variant="outline" className="w-full">
                Message Students
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
