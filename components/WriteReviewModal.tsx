'use client';

import { useState, useTransition } from 'react';
import { FiX, FiStar, FiUpload, FiAlertCircle } from 'react-icons/fi';
import { useAnonymousGate } from '@/hooks/useAnonymousGate';
import AuthModal from '@/components/AuthModal';
import { Review } from '@/types';
import { createReview } from '@/app/actions';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  onReviewAdded: (review: Review) => void;
}

export default function WriteReviewModal({ isOpen, onClose, companyId, companyName, onReviewAdded }: WriteReviewModalProps) {
  const { hasSubmitted, isChecking, recordSubmission } = useAnonymousGate(companyId);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  const [rating, setRating] = useState(5);
  const [authorTitle, setAuthorTitle] = useState('Current Employee');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [comment, setComment] = useState('');
  const [salaryAmount, setSalaryAmount] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Read anonymous preference from localStorage
  const isAnonymous = typeof window !== 'undefined' && localStorage.getItem('seetruth_anonymous_pref') === 'true';

  if (!isOpen || isChecking) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (hasSubmitted) {
      setShowAuthModal(true);
      return;
    }

    const formData = new FormData();
    formData.append('is_anonymous', String(isAnonymous));
    formData.append('author_title', authorTitle);
    formData.append('rating', String(rating));
    formData.append('pros', pros);
    formData.append('cons', cons);
    formData.append('comment', comment);
    if (salaryAmount) formData.append('salary_amount', salaryAmount);
    if (imageUrl) formData.append('image_url', imageUrl);

    startTransition(async () => {
      const result = await createReview(formData, companyId);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success && result.data) {
        onReviewAdded(result.data);
        recordSubmission();
        
        // Reset form
        setPros(''); setCons(''); setComment(''); setSalaryAmount(''); setImageUrl(''); setRating(5);
        onClose();
      }
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Write a Review for {companyName}</h3>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {error && (
             <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
               <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
               <span>{error}</span>
             </div>
          )}

          {hasSubmitted && (
             <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2">
               <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
               <span>You have already submitted an anonymous review for this company. Please sign in to submit another.</span>
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Your Role</label>
              <select value={authorTitle} onChange={(e) => setAuthorTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                <option>Current Employee</option>
                <option>Former Employee</option>
                <option>Job Seeker</option>
                <option>Customer</option>
                <option>Interviewee</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Overall Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} className="text-2xl focus:outline-none transition-transform hover:scale-110">
                    <FiStar className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-600'}`} />
                  </button>
                ))}
                <span className="ml-2 text-sm font-bold text-zinc-700 dark:text-zinc-300">{rating}.0</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Monthly Salary (Optional)</label>
              <input type="number" value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)} placeholder="e.g. 50000" className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-zinc-400" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Pros</label>
              <textarea rows={3} value={pros} onChange={(e) => setPros(e.target.value)} placeholder="What is great about working or doing business here?" className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-zinc-400" required />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Cons</label>
              <textarea rows={3} value={cons} onChange={(e) => setCons(e.target.value)} placeholder="What could be improved?" className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-zinc-400" required />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Detailed Review</label>
              <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your detailed experience..." className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-zinc-400" required />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Image URL (Optional)</label>
              <div className="relative">
                <FiUpload className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-zinc-400" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
              <button type="submit" disabled={isPending} className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isPending ? 'Publishing...' : 'Publish Anonymously'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}