
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardController = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold">Invalid User Role</h2>
          <p className="text-muted-foreground">Unable to determine dashboard type.</p>
        </div>
      );
  }
};

export default DashboardController;
