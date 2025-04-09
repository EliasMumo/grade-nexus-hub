
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

const AuthCallback = () => {
  const [message, setMessage] = useState('Processing authentication...');
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        // Get the auth code from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        // Check if we have a confirmation token
        if (queryParams.get('type') === 'email_confirmation') {
          setMessage('Verifying your email...');
          const { error } = await supabase.auth.refreshSession();
          
          if (error) {
            console.error('Error confirming email:', error);
            setMessage('There was a problem verifying your email. Please try again.');
            toast.error('Email verification failed');
            setTimeout(() => navigate('/login'), 3000);
          } else {
            setMessage('Email verified successfully! Redirecting...');
            toast.success('Email verified successfully!');
            setTimeout(() => navigate('/dashboard'), 1500);
          }
        } 
        // Handle password recovery
        else if (queryParams.get('type') === 'recovery') {
          setMessage('Processing password reset...');
          setTimeout(() => navigate('/reset-password'), 1500);
        }
        // Handle standard sign-in/up redirects
        else if (hashParams.get('access_token')) {
          setMessage('Authentication successful! Redirecting...');
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          // No recognizable auth parameters, redirect to login
          setMessage('No authentication data found. Redirecting to login...');
          setTimeout(() => navigate('/login'), 1500);
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        setMessage('There was a problem processing your authentication. Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleAuthRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <div className="animate-spin mb-4 mx-auto h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <h1 className="text-xl font-medium text-gray-900">{message}</h1>
      </div>
    </div>
  );
};

export default AuthCallback;
