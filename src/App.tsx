
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import PlaceholderPage from "./pages/PlaceholderPage";

// Layouts
import DashboardLayout from "./components/layout/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes - Dashboard layout */}
            <Route path="/" element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Student routes */}
              <Route path="/courses" element={<PlaceholderPage />} />
              <Route path="/grades" element={<PlaceholderPage />} />
              <Route path="/reports" element={<PlaceholderPage />} />
              
              {/* Teacher routes */}
              <Route path="/classes" element={<PlaceholderPage />} />
              
              {/* Admin routes */}
              <Route path="/users" element={<PlaceholderPage />} />
              
              {/* Common routes */}
              <Route path="/settings" element={<PlaceholderPage />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
