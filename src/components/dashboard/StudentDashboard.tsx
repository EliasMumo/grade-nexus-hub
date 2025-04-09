
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchStudentReport } from '@/services/supabaseService';
import { GradeReport } from '@/types';
import StatCard from './StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Award, BookOpen, GraduationCap, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gradeReport, setGradeReport] = useState<GradeReport | null>(null);
  const [recentGrades, setRecentGrades] = useState<any[]>([]);
  const [loadingReport, setLoadingReport] = useState(true);

  useEffect(() => {
    if (user) {
      setLoadingReport(true);
      
      fetchStudentReport(user.id)
        .then(report => {
          setGradeReport(report);
          
          if (report) {
            // Transform grade data for chart
            const grades = report.courses.flatMap(course => 
              course.grades.map(grade => ({
                date: grade.date,
                value: grade.value,
                courseName: course.courseName
              }))
            );
            
            // Sort by date
            grades.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            // Only get the recent 10 grades
            setRecentGrades(grades.slice(-10));
          }
        })
        .catch(error => {
          console.error('Error fetching student report:', error);
        })
        .finally(() => {
          setLoadingReport(false);
        });
    }
  }, [user]);

  if (loadingReport) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!gradeReport) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-2">No Grade Data Available</h2>
        <p className="text-muted-foreground mb-4">It seems we don't have any grade data for you yet.</p>
      </div>
    );
  }

  // Calculate how many courses are above class average
  const courseCount = gradeReport.courses.length;
  const highPerformingCount = Math.floor(courseCount * 0.7); // Simulated data for now
  
  // Calculate recent performance - positive or negative trend (simulated for now)
  const recentTrend = Math.floor(Math.random() * 11) - 5; // -5 to +5

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's an overview of your academic performance.
        </p>
      </div>
      
      <div className="dashboard-stats-grid">
        <StatCard
          title="Overall Average"
          value={`${gradeReport.overallAverage}%`}
          icon={<Award className="h-4 w-4" />}
          description="Your average across all courses"
          trendValue={recentTrend}
          trendText="from last term"
        />
        
        <StatCard
          title="Courses"
          value={courseCount}
          icon={<BookOpen className="h-4 w-4" />}
          description="Total number of enrolled courses"
        />
        
        <StatCard
          title="High Performance"
          value={`${highPerformingCount}/${courseCount}`}
          icon={<GraduationCap className="h-4 w-4" />}
          description="Courses above average"
        />
        
        <StatCard
          title="Next Exam"
          value="5 days"
          icon={<CalendarDays className="h-4 w-4" />}
          description="Advanced Mathematics on May 15"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Grade Performance</CardTitle>
            <CardDescription>
              Your grade progression over the past submissions
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {recentGrades.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={recentGrades}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return `${d.getMonth()+1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value, name, props) => [`${value}%`, props.payload.courseName]}
                    labelFormatter={(label) => {
                      const d = new Date(label);
                      return d.toLocaleDateString();
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No recent grade data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
            <CardDescription>Your current grades by course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gradeReport.courses.map((course) => (
                <div key={course.courseId} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{course.courseName}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.grades.length} {course.grades.length === 1 ? 'grade' : 'grades'} recorded
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span 
                      className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-medium ${
                        course.average >= 90 ? 'bg-green-100 text-green-800' :
                        course.average >= 80 ? 'bg-blue-100 text-blue-800' :
                        course.average >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {course.average}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <Button variant="outline" className="w-full" onClick={() => navigate('/grades')}>
                View All Grades
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
            <CardDescription>Your next submission deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { course: 'Mathematics 101', title: 'Final Project', dueDate: '2025-05-15', daysLeft: 5 },
                { course: 'Physics 101', title: 'Lab Report', dueDate: '2025-05-18', daysLeft: 8 },
                { course: 'Computer Science', title: 'Coding Assignment', dueDate: '2025-05-20', daysLeft: 10 },
              ].map((assignment, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{assignment.title}</p>
                    <p className="text-sm text-muted-foreground">{assignment.course}</p>
                  </div>
                  <span 
                    className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-medium ${
                      assignment.daysLeft <= 3 ? 'bg-red-100 text-red-800' :
                      assignment.daysLeft <= 7 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}
                  >
                    {assignment.daysLeft} days left
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Access your reports and transcripts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full" onClick={() => navigate('/reports')}>
                Download Report Card
              </Button>
              <Button variant="outline" className="w-full">
                View Academic Transcript
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
