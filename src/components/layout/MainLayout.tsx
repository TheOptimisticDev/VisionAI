
import React from 'react';
import { Header } from './Header';
import { useAuth } from '@/context/AuthContext';
import { BottomNavigation } from './BottomNavigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { loading } = useAuth();

  // We'll let the LoaderPage component handle all loading states now
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto px-4 py-6 mt-12 mb-20 animate-fade-in">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
