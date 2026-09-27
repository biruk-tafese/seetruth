'use client';

import { useState } from 'react';
import { useAnonymousGate } from '@/hooks/useAnonymousGate';
import { FiCheckCircle } from 'react-icons/fi';
import AuthModal from '@/components/AuthModal'; // <-- FIXED: Default import without curly braces

interface ReviewSubmissionProps {
  companyId: string;
  isAuthenticated: boolean;
}

export function ReviewSubmission({ companyId, isAuthenticated }: ReviewSubmissionProps) {
  const { hasSubmitted, isChecking, recordSubmission } = useAnonymousGate(companyId);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated && hasSubmitted) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!isAuthenticated) {
      recordSubmission();
    }
    
    setIsExpanded(false);
    setPros('');
    setCons('');
    setIsSubmitting(false);
    alert('Review submitted successfully!');
  };

  if (isChecking) return <div className="animate-pulse h-24 bg-muted rounded-lg" />;

  return (
    <>
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
        >
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">Write a Review</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {isExpanded ? 'Cancel' : 'Share your experience'}
          </span>
        </button>

        {isExpanded && (
          <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">Overall Rating: {rating}/5</label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={rating} 
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-emerald-600 dark:text-emerald-400">Pros</label>
                <textarea 
                  value={pros}
                  onChange={(e) => setPros(e.target.value)}
                  className="w-full p-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-zinc-100"
                  rows={3}
                  placeholder="What did you like?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-rose-600 dark:text-rose-400">Cons</label>
                <textarea 
                  value={cons}
                  onChange={(e) => setCons(e.target.value)}
                  className="w-full p-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-zinc-100"
                  rows={3}
                  placeholder="What could be improved?"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <FiCheckCircle className="w-3 h-3" />
                {!isAuthenticated ? 'Submitting anonymously' : 'Submitting as authenticated user'}
              </span>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-500/20"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Auth Modal managed locally */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}