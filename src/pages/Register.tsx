
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '@/components/auth/RegisterForm';
import { GraduationCap } from 'lucide-react';

const Register = () => {
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
          <p className="text-gray-600 mt-1">Create a new account</p>
        </div>
        
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
