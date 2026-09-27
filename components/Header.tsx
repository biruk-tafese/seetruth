import Link from 'next/link';
import { FiShield, FiLogOut } from 'react-icons/fi';
import { createClient } from '@/lib/supabase/server';
import { ThemeToggle } from './ThemeProvider';
import { redirect } from 'next/navigation';

// Server Action to handle secure logout
async function handleSignOut() {
  'use server';
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get name from metadata (set during signup) or fallback to email username
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img 
            src="/seeTruth.png" 
            alt="SeeTruth Logo" 
            className="h-8 w-auto object-contain" 
          />
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            SeeTruth
          </span>
        </Link>
        
        {/* Navigation & Actions */}
        <nav className="flex items-center gap-3 sm:gap-5">
          <Link 
            href="/#inquiries" 
            className="hidden sm:block text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Inquiries
          </Link>
          
          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{fullName}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[150px]" title={email}>
                  {email}
                </span>
              </div>
              
              {/* Sign Out Button */}
              <form action={handleSignOut}>
                <button 
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </div>
          ) : (
            <Link 
              href="/auth" 
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}