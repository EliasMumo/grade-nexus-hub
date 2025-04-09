
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAuditLogs, fetchCourses } from '@/services/supabaseService';
import { AuditLog, User } from '@/types';
import StatCard from './StatCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, UserPlus, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [coursesCount, setCoursesCount] = useState(0);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role')
          .eq('role', 'student');
          
        if (studentsError) throw studentsError;
        
        // Fetch teachers
        const { data: teachersData, error: teachersError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role')
          .eq('role', 'teacher');
          
        if (teachersError) throw teachersError;
        
        // Fetch courses
        const courses = await fetchCourses();
        
        // Fetch audit logs
        const logs = await fetchAuditLogs(10);
        
        // Transform students data to match User type
        const transformedStudents = studentsData.map(s => ({
          id: s.id,
          name: s.full_name,
          email: '', // We don't get emails from profiles table
          role: 'student' as const,
          avatar: s.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.full_name)}&background=22c55e&color=fff`,
        }));
        
        // Transform teachers data to match User type
        const transformedTeachers = teachersData.map(t => ({
          id: t.id,
          name: t.full_name,
          email: '', // We don't get emails from profiles table
          role: 'teacher' as const,
          avatar: t.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.full_name)}&background=8b5cf6&color=fff`,
        }));
        
        setStudents(transformedStudents);
        setTeachers(transformedTeachers);
        setCoursesCount(courses.length);
        setAuditLogs(logs);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

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

  // Generate system activity data (simulated)
  const generateActivityData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      
      // Generate realistic pattern with higher activity on weekdays
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const baseValue = isWeekend ? 20 : 65; // Weekend vs weekday base activity
      const randomFactor = Math.floor(Math.random() * 30); // Random variation
      
      data.push({
        date: date.toISOString().split('T')[0],
        logins: baseValue + randomFactor,
        grades: Math.floor((baseValue + randomFactor) * 0.7),
        reports: Math.floor((baseValue + randomFactor) * 0.3),
      });
    }
    
    return data;
  };

  const activityData = generateActivityData();
  
  // Calculate new users in last 7 days (simulated for now)
  const newUsersCount = 8;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administrator Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's an overview of the system.
        </p>
      </div>
      
      <div className="dashboard-stats-grid">
        <StatCard
          title="Total Students"
          value={students.length}
          icon={<Users className="h-4 w-4" />}
          description="Registered student accounts"
          trendValue={12.5}
          trendText="from last month"
        />
        
        <StatCard
          title="Faculty Members"
          value={teachers.length}
          icon={<Users className="h-4 w-4" />}
          description="Teachers and staff"
        />
        
        <StatCard
          title="Active Courses"
          value={coursesCount}
          icon={<BookOpen className="h-4 w-4" />}
          description="Currently running courses"
        />
        
        <StatCard
          title="New Users"
          value={newUsersCount}
          icon={<UserPlus className="h-4 w-4" />}
          description="Signed up in last 7 days"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>
              Daily usage statistics over the past 30 days
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={activityData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getMonth()+1}/${d.getDate()}`;
                  }}
                  stroke="#888"
                />
                <YAxis stroke="#888" />
                <Tooltip 
                  labelFormatter={(label) => {
                    const d = new Date(label);
                    return d.toLocaleDateString(undefined, { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="logins" 
                  stackId="1" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  name="Logins"
                />
                <Area 
                  type="monotone" 
                  dataKey="grades" 
                  stackId="1" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  name="Grade Entries"
                />
                <Area 
                  type="monotone" 
                  dataKey="reports" 
                  stackId="1" 
                  stroke="#22c55e" 
                  fill="#22c55e" 
                  name="Reports Generated"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Audit Logs</CardTitle>
            <CardDescription>
              Latest system activities and actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={log.userName} />
                    <AvatarFallback>{getInitials(log.userName)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">
                        {log.userName}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {log.userRole}
                        </Badge>
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">{log.action}:</span> {log.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <Button variant="outline" className="w-full" onClick={() => navigate('/reports')}>
                View All Audit Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Recent user accounts and activity</CardDescription>
            </div>
            <Button onClick={() => navigate('/users')}>Manage Users</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...students, ...teachers].slice(0, 4).map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email || 'No email available'}</p>
                    </div>
                  </div>
                  <Badge variant={user.role === 'student' ? 'secondary' : 'outline'}>
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => navigate('/users')}>
                Add New User
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/courses')}>
                Manage Courses
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/reports')}>
                Generate Reports
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/settings')}>
                System Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
