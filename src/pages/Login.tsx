
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { GraduationCap } from 'lucide-react';

const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4 md:px-0">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-full">
              <GraduationCap size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Grade Nexus</h1>
          <p className="text-gray-600 mt-1">Sign in to access your account</p>
        </div>
        
        <LoginForm />
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            For demo purposes, use these credentials:
          </p>
          <div className="mt-2 space-y-1 text-xs text-gray-600">
            <p>Admin: admin@example.com / admin123</p>
            <p>Teacher: teacher@example.com / teacher123</p>
            <p>Student: student@example.com / student123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
