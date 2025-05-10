
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Suspense, lazy } from "react";

import LoaderPage from "./pages/Loader";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Scan = lazy(() => import("./pages/Scan"));
const Auth = lazy(() => import("./pages/Auth"));
const History = lazy(() => import("./pages/History"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Settings = lazy(() => import("./pages/Settings"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<LoaderPage />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/scan" element={<Scan />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/loader" element={<LoaderPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
