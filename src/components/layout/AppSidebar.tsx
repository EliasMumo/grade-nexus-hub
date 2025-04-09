
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart, 
  BookOpen, 
  FileText, 
  GraduationCap, 
  Home, 
  Settings, 
  Users, 
  Download,
  LogOut
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const studentMenuItems = [
    {
      icon: Home,
      title: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: BookOpen,
      title: 'My Courses',
      path: '/courses',
    },
    {
      icon: FileText,
      title: 'Grades',
      path: '/grades',
    },
    {
      icon: Download,
      title: 'Reports',
      path: '/reports',
    },
    {
      icon: Settings,
      title: 'Settings',
      path: '/settings',
    },
  ];
  
  const teacherMenuItems = [
    {
      icon: Home,
      title: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: BookOpen,
      title: 'My Classes',
      path: '/classes',
    },
    {
      icon: GraduationCap,
      title: 'Student Grades',
      path: '/grades',
    },
    {
      icon: BarChart,
      title: 'Reports',
      path: '/reports',
    },
    {
      icon: Settings,
      title: 'Settings',
      path: '/settings',
    },
  ];
  
  const adminMenuItems = [
    {
      icon: Home,
      title: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: Users,
      title: 'Users',
      path: '/users',
    },
    {
      icon: BookOpen,
      title: 'Courses',
      path: '/courses',
    },
    {
      icon: FileText,
      title: 'Grade Management',
      path: '/grades',
    },
    {
      icon: BarChart,
      title: 'Reports',
      path: '/reports',
    },
    {
      icon: Settings,
      title: 'Settings',
      path: '/settings',
    },
  ];
  
  const getMenuItems = () => {
    switch (user?.role) {
      case 'student':
        return studentMenuItems;
      case 'teacher':
        return teacherMenuItems;
      case 'admin':
        return adminMenuItems;
      default:
        return [];
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <Sidebar>
      <SidebarHeader className="text-xl font-bold">
        <GraduationCap className="mr-2 h-6 w-6" />
        Grade Nexus
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {getMenuItems().map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                className={cn(
                  location.pathname === item.path && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
                onClick={() => navigate(item.path)}
              >
                <button>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
