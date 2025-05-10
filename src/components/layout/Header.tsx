import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Scan, Info, Cog, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const { currentUser, signOut } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed w-full z-50 ${
        isScrolled 
          ? 'dark:bg-gray-900/90 bg-white/90 backdrop-blur-sm dark:border-gray-700 border-gray-200 border-b' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto mt-4 px-4 py-3 flex items-center justify-between">
        <Link to="/about" className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <Info size={22} />
        </Link>
        
        <nav className="flex items-center space-x-4">
          <button 
            onClick={toggleSearch}
            className="flex items-center focus:outline-none text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Search"
          >
            <Search size={22} />
          </button>

          {currentUser ? (
            <>
              <Link to="/history" className="flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <Scan size={22} className="mr-1" />
                <span>History</span>
              </Link>
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-400 hover:bg-gray-100/30 dark:hover:bg-gray-800/30"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/settings" className="flex items-center text-gray-500 hover:text-gray-400 dark:hover:text-gray-300">
              <Cog size={22} />
            </Link>
          )}
        </nav>

        {/* Search Modal */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/80 backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  toggleSearch();
                }
              }}
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="w-full max-w-2xl px-4"
              >
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search anything..."
                    autoFocus
                    className="w-full py-4 px-6 text-lg rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 shadow-xl text-gray-800 dark:text-gray-200"
                  />
                  <button
                    onClick={toggleSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                    aria-label="Close search"
                  >
                    <X size={24} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-4 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-lg"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Search results for: <span className="font-medium text-gray-800 dark:text-gray-200">{searchQuery}</span>
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
