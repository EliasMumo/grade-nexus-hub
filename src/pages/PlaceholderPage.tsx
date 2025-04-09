
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';

const PlaceholderPage = () => {
  const { pathname } = useLocation();
  const pageName = pathname.split('/').pop() || '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight capitalize">
          {pageName} Page
        </h1>
        <p className="text-muted-foreground">
          This is a placeholder for the {pageName} functionality.
        </p>
      </div>
      
      <div className="rounded-lg border p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
        <p className="text-muted-foreground mb-4">
          This page is under development and will be available in a future update.
        </p>
        <div className="w-full max-w-md mx-auto h-8 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-3/4 rounded-full"></div>
        </div>
        <p className="text-sm mt-2">75% complete</p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
