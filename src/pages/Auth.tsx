import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Scan } from 'lucide-react';
import { motion } from 'framer-motion';

const Auth = () => {
  const [showSignIn, setShowSignIn] = useState(true);
  const { currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const toggleForm = () => {
    setShowSignIn(!showSignIn);
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md mx-auto space-y-8"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back!
            </h1>
            <p className="text-muted-foreground">
              AI-powered item identifier and visual discovery tool.
            </p>
          </div>

          <div className="space-y-6">
            {showSignIn ? (
              <SignInForm onToggleForm={toggleForm} />
            ) : (
              <SignUpForm onToggleForm={toggleForm} />
            )}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Auth;
