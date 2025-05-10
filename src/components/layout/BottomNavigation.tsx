
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Scan, User, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export function BottomNavigation() {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 rounded-2xl right-0 bg-white border-t shadow-lg z-50 dark:bg-gray-900 dark:border-gray-800">
      <div className="container mb-2 mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          <Link 
            to="/" 
            className={cn(
              "flex flex-col items-center transition-all duration-200 transform hover:scale-105",
              isActive('/') ? "text-gray-500" : "text-muted-foreground"
            )}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          
          {currentUser && (
            <Link 
              to="/history" 
              className={cn(
                "flex flex-col items-center transition-all duration-200 transform hover:scale-105",
                isActive('/history') ? "text-gray-500" : "text-muted-foreground"
              )}
            >
              <History className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">History</span>
            </Link>
          )}
          
          <Link 
            to="/scan" 
            className={cn(
              "flex flex-col items-center -mt-10 transition-all duration-300 transform hover:scale-110",
              isActive('/scan') ? "text-gray-500" : "text-muted-foreground"
            )}
          >
            <div className={cn(
              "bg-brand-600 rounded-full p-4 shadow-lg border-4",
              "border-white dark:border-gray-900"
            )}>
              <Scan className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs mt-1 font-medium">Scan</span>
          </Link>
          
          <Link 
            to={currentUser ? "/subscription" : "/auth"} 
            className={cn(
              "flex flex-col items-center transition-all duration-200 transform hover:scale-105",
              (isActive('/subscription') || isActive('/auth')) ? "text-gray-500" : "text-muted-foreground"
            )}
          >
            <User className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{currentUser ? "Account" : "Sign In"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
