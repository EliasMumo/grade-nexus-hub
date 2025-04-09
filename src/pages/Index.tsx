
import React from 'react';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 px-4 md:px-0">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-primary text-primary-foreground p-4 rounded-full">
            <GraduationCap size={40} />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          Grade Nexus
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl">
          A comprehensive grade management system for students, teachers, and administrators
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button 
            size="lg" 
            className="text-lg px-8" 
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg px-8" 
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="space-y-3 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-primary">For Students</h2>
            <p className="text-gray-600">Access your grades, view progress reports, and download your results</p>
          </div>
          
          <div className="space-y-3 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-primary">For Teachers</h2>
            <p className="text-gray-600">Manage student grades, track class performance, and generate reports</p>
          </div>
          
          <div className="space-y-3 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-primary">For Administrators</h2>
            <p className="text-gray-600">Oversee the entire system, manage users, and access comprehensive analytics</p>
          </div>
        </div>
        
        <div className="mt-16 text-gray-500">
          <p>© 2025 Grade Nexus. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
