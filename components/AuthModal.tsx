'use client';

import { useState } from 'react';
import { FiX, FiMail, FiLock, FiCheck } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulated Supabase auth call integration point
    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 1000);
  };

  const handleGoogleLogin = () => {
    // Supabase OAuth Google integration point
    alert('Redirecting to Google Authentication...');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-8 relative shadow-xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
          <FiX className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold tracking-tight">{isSignUp ? 'Join SeeTruth' : 'Welcome Back'}</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Unlock full access, unlimited submissions, and saved bookmarks</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
        >
          <FcGoogle className="w-5 h-5" /> Continue with Google
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
          <span className="px-3 text-xs uppercase tracking-wider text-zinc-400">or email</span>
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-zinc-500 dark:text-zinc-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-blue-600 dark:text-blue-400 font-medium hover:underline ml-1">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}