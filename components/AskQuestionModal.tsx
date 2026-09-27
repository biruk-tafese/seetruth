'use client';

import { useState } from 'react';
import { FiX, FiBriefcase, FiMessageSquare } from 'react-icons/fi';
import AuthModal from '@/components/AuthModal';
import { Inquiry } from '@/types';

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAsk: (inquiry: Inquiry) => void;
}

export default function AskQuestionModal({ isOpen, onClose, onAsk }: AskQuestionModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [question, setQuestion] = useState('');
  const [authorTitle, setAuthorTitle] = useState('Job Seeker');
  const [showAuth, setShowAuth] = useState(false);
  
  // Check localStorage for anonymous question limit
  const hasAsked = typeof window !== 'undefined' && localStorage.getItem('seetruth_has_asked') === 'true';

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hasAsked) {
      setShowAuth(true);
      return;
    }

    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      company_name: companyName.trim() || 'General',
      question,
      author_title: authorTitle,
      replies_count: 0,
      created_at: new Date().toISOString(),
      replies: []
    };

    onAsk(newInquiry);
    localStorage.setItem('seetruth_has_asked', 'true');
    
    // Reset form
    setCompanyName('');
    setQuestion('');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
            <FiX className="w-5 h-5" />
          </button>
          
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Ask the Community</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Get answers from verified insiders.</p>
          </div>

          {hasAsked && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2">
              <span>You have already submitted an anonymous question. Please sign in to ask more.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Company (Optional)</label>
              <div className="relative">
                <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Safaricom Ethiopia"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Your Question</label>
              <div className="relative">
                <FiMessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What would you like to know?"
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-100 resize-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">I am a...</label>
              <select
                value={authorTitle}
                onChange={(e) => setAuthorTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-100"
              >
                <option>Job Seeker</option>
                <option>Current Employee</option>
                <option>Former Employee</option>
                <option>Customer</option>
              </select>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-500/20 ${
                hasAsked 
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {hasAsked ? 'Sign In Required for Multiple Questions' : 'Post Question Anonymously'}
            </button>
          </form>
        </div>
      </div>
      
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}