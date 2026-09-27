'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ThemeToggle } from './ThemeProvider';
import ListCompanyModal from './ListCompanyModal';
import { 
  FiShield, FiLogOut, FiMenu, FiX, FiChevronDown, FiEye, FiEyeOff, FiPlusCircle 
} from 'react-icons/fi';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false); // New state for modal
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        setIsMobileMenuOpen(false);
        setIsProfileDropdownOpen(false);
        router.refresh();
      }
    });

    const savedPref = localStorage.getItem('seetruth_anonymous_pref');
    if (savedPref === 'true') setIsAnonymous(true);

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const toggleAnonymous = () => {
    const newVal = !isAnonymous;
    setIsAnonymous(newVal);
    localStorage.setItem('seetruth_anonymous_pref', String(newVal));
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return 'U';
  };

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img src="/seeTruth.png" alt="SeeTruth Logo" className="h-8 w-auto object-contain" />
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            SeeTruth
          </span>
        </Link>
        
        {/* Desktop Navigation & Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/#inquiries" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Inquiries
          </Link>
          
          {/* List Company Button (Desktop) */}
          <button 
            onClick={() => setIsListModalOpen(true)}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1.5"
          >
            <FiPlusCircle className="w-4 h-4" />
            List Company
          </button>
          
          <ThemeToggle />

          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {getInitials(fullName, email)}
                </div>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 max-w-[100px] truncate">
                  {fullName}
                </span>
                <FiChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-20 overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                          {getInitials(fullName, email)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{fullName}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate" title={email}>{email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isAnonymous ? <FiEyeOff className="w-4 h-4 text-blue-500" /> : <FiEye className="w-4 h-4 text-zinc-400" />}
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Post Anonymously</span>
                        </div>
                        <button 
                          onClick={toggleAnonymous}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${isAnonymous ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnonymous ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                        {isAnonymous ? 'Your name will be hidden on reviews.' : 'Your name will be visible.'}
                      </p>
                    </div>

                    <div className="p-2">
                      <button 
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link 
              href="/auth" 
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Actions (Theme + Burger) */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-lg z-40">
          <div className="px-4 py-6 space-y-6">
            
            {/* Mobile User Profile */}
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {getInitials(fullName, email)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">{fullName}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{email}</p>
                  </div>
                </div>

                {/* Mobile Anonymous Toggle */}
                <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    {isAnonymous ? <FiEyeOff className="w-5 h-5 text-blue-500" /> : <FiEye className="w-5 h-5 text-zinc-400" />}
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Post Anonymously</span>
                  </div>
                  <button 
                    onClick={toggleAnonymous}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAnonymous ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnonymous ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl transition-colors"
                >
                  <FiLogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link 
                href="/auth" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Nav Links */}
            <nav className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsListModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-base font-medium text-blue-600 dark:text-blue-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-colors text-left"
              >
                <FiPlusCircle className="w-5 h-5" />
                List a Company
              </button>
              <Link 
                href="/#inquiries" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-colors"
              >
                Open Inquiries
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Render the List Company Modal */}
      <ListCompanyModal 
        isOpen={isListModalOpen} 
        onClose={() => setIsListModalOpen(false)} 
      />
    </header>
  );
}