'use client';

import { useState } from 'react';
import { FiX, FiStar, FiUpload, FiAlertCircle } from 'react-icons/fi';
import { useAnonymousGate } from '@/hooks/useAnonymousGate';
import AuthModal from '@/components/AuthModal';
import { Review } from '@/types';

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
  
  const [rating, setRating] = useState(5);
  const [authorTitle, setAuthorTitle] = useState('Current Employee');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [comment, setComment] = useState('');
  const [salaryAmount, setSalaryAmount] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || isChecking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enforce anonymous gate
    if (hasSubmitted) {
      setShowAuthModal(true);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newReview: Review = {
      id: `r-${Date.now()}`,
      company_id: companyId,
      is_anonymous: true,
      author_title: authorTitle,
      rating,
      pros,
      cons,
      comment,
      salary_amount: salaryAmount ? Number(salaryAmount) : undefined,
      image_url: imageUrl || undefined,
      upvotes: 0,
      downvotes: 0,
      created_at: new Date().toISOString(),
      comments: []
    };

    onReviewAdded(newReview);
    recordSubmission(); // Lock further anonymous submissions for this company
    
    // Reset form
    setPros('');
    setCons('');
    setComment('');
    setSalaryAmount('');
    setImageUrl('');
    setRating(5);
    setIsSubmitting(false);
    onClose();
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

          {hasSubmitted && (
             <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2">
               <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
               <span>You have already submitted an anonymous review for this company. Please sign in to submit another.</span>
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Your Role</label>
              <select
                value={authorTitle}
                onChange={(e) => setAuthorTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
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
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-2xl focus:outline-none transition-transform hover:scale-110"
                  >
                    <FiStar className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-600'}`} />
                  </button>
                ))}
                <span className="ml-2 text-sm font-bold text-zinc-700 dark:text-zinc-300">{rating}.0</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Monthly Salary (Optional)</label>
              <input
                type="number"
                value={salaryAmount}
                onChange={(e) => setSalaryAmount(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Pros</label>
              <textarea
                rows={3}
                value={pros}
                onChange={(e) => setPros(e.target.value)}
                placeholder="What is great about working or doing business here?"
                className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-zinc-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Cons</label>
              <textarea
                rows={3}
                value={cons}
                onChange={(e) => setCons(e.target.value)}
                placeholder="What could be improved?"
                className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-zinc-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Detailed Review</label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your detailed experience..."
                className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-zinc-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Image URL (Optional)</label>
              <div className="relative">
                <FiUpload className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-zinc-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Anonymously'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Auth Modal triggers if anonymous limit is reached */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}