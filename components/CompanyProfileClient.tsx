'use client';

import { useState, useTransition } from 'react';
import {
  FiArrowLeft, FiCheckCircle, FiStar, FiMapPin, FiThumbsUp,
  FiThumbsDown, FiShare2, FiPlus, FiMessageSquare, FiShield, 
  FiAlertTriangle, FiSend, FiZap // <-- Changed FiSparkles to FiZap
} from 'react-icons/fi';
import { Company, Review } from '@/types';
import WriteReviewModal from '@/components/WriteReviewModal';
import { submitComment, submitVote } from '@/app/actions';

interface CompanyProfileClientProps {
  company: Company;
  initialReviews: Review[];
  initialInquiries: any[];
}

export default function CompanyProfileClient({ company, initialReviews }: CompanyProfileClientProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [isPendingVote, startVoteTransition] = useTransition();
  const [isPendingComment, startCommentTransition] = useTransition();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVoteAction = (reviewId: string, type: 'upvote' | 'downvote') => {
    const votes = JSON.parse(localStorage.getItem('seetruth_votes') || '{}');
    if (votes[reviewId] === type) return; // Prevent endless clicking

    startVoteTransition(async () => {
      const result = await submitVote(reviewId, type);
      if (result.success) {
        setReviews(prev => prev.map(rev => 
          rev.id === reviewId ? { ...rev, upvotes: result.upvotes, downvotes: result.downvotes } : rev
        ));
        votes[reviewId] = type;
        localStorage.setItem('seetruth_votes', JSON.stringify(votes));
      } else if (result.error) {
        alert(result.error);
      }
    });
  };

  const getUserVote = (reviewId: string) => {
    if (typeof window === 'undefined') return null;
    const votes = JSON.parse(localStorage.getItem('seetruth_votes') || '{}');
    return votes[reviewId] || null;
  };

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>, reviewId: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const isAnonymous = typeof window !== 'undefined' && localStorage.getItem('seetruth_anonymous_pref') === 'true';
    
    formData.set('author_title', isAnonymous ? 'Anonymous Insider' : 'Verified Insider');

    startCommentTransition(async () => {
      const result = await submitComment(formData, reviewId);
      if (result.success && result.data) {
        setReviews(prev => prev.map(rev => 
          rev.id === reviewId ? { ...rev, comments: [...(rev.comments || []), result.data] } : rev
        ));
        e.currentTarget.reset();
      } else {
        alert(result.error || 'Failed to post comment.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pb-20">
      {/* Top Navigation */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <FiArrowLeft className="w-4 h-4" /> Back to Listings
          </button>
          <button onClick={handleShare} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <FiShare2 className="w-4 h-4" /> {copied ? 'Link Copied!' : 'Share Profile'}
          </button>
        </div>
      </div>

      {/* Company Header Banner */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 py-12 px-6 md:px-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-2xl flex-shrink-0">
              {company.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{company.name}</h1>
                {company.verified && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-900">
                    <FiCheckCircle className="w-3 h-3" /> Verified Entity
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{company.category}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1"><FiMapPin className="w-3.5 h-3.5" /> {company.location}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsWriteModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-all shadow-sm inline-flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" /> Write Review
          </button>
        </div>
      </header>

      {/* ✨ AI Summary Teaser (Smart & Nice) */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-5 flex items-start gap-4">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400 flex-shrink-0">
            <FiZap className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100">AI-Powered Company Summary</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
              We are currently analyzing employee reviews and comments to generate instant, unbiased insights about {company.name}'s culture, management, and compensation. Stay tuned!
            </p>
          </div>
        </div>
      </div>

      {/* Main Reviews Feed */}
      <main className="max-w-4xl mx-auto px-6 py-12 w-full flex-grow">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Verified Reviews</h2>
            <div className="flex items-center gap-1 text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900">
              <FiStar className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {company.overall_rating} Rating
            </div>
          </div>
          <span className="text-xs text-zinc-400">{reviews.length} reviews submitted</span>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800">
            <FiMessageSquare className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No reviews yet for {company.name}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((rev) => {
              const userVote = getUserVote(rev.id);
              
              return (
                <article key={rev.id} className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{rev.author_title}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                          {rev.is_anonymous ? 'Anonymous' : 'Verified Insider'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                          <FiStar className="w-3.5 h-3.5 fill-amber-400" /> {rev.rating}.0
                        </span>
                        <span>•</span>
                        <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                      <FiShield className="w-3 h-3" /> Verified Review
                    </div>
                  </div>

                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">{rev.comment}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mb-1">Pros</span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">{rev.pros}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/50">
                      <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block mb-1">Cons</span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">{rev.cons}</p>
                    </div>
                  </div>

                  {rev.image_url && (
                    <div className="mb-6 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-80 bg-black/5">
                      <img src={rev.image_url} alt="Review attachment" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Voting Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                    <span className="text-zinc-400">Was this review helpful?</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleVoteAction(rev.id, 'upvote')}
                        disabled={userVote === 'upvote' || isPendingVote}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all font-medium ${
                          userVote === 'upvote' 
                            ? 'bg-blue-600 border-blue-600 text-white cursor-default' 
                            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-blue-500'
                        }`}
                      >
                        <FiThumbsUp className="w-3.5 h-3.5" /> {rev.upvotes}
                      </button>
                      <button
                        onClick={() => handleVoteAction(rev.id, 'downvote')}
                        disabled={userVote === 'downvote' || isPendingVote}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all font-medium ${
                          userVote === 'downvote' 
                            ? 'bg-rose-600 border-rose-600 text-white cursor-default' 
                            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-rose-500'
                        }`}
                      >
                        <FiThumbsDown className="w-3.5 h-3.5" /> {rev.downvotes}
                      </button>
                    </div>
                  </div>

                  {/* Nested Comments Section */}
                  <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-4">
                      <FiMessageSquare className="w-4 h-4 text-zinc-500" />
                      <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Discussion & Replies</h4>
                    </div>
                    
                    <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2">
                      <FiAlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                        Comments are permanent and cannot be deleted. Please be respectful.
                      </p>
                    </div>

                    {rev.comments && rev.comments.length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {rev.comments.map((c) => (
                          <div key={c.id} className="bg-white dark:bg-zinc-800 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-1">
                            <div className="flex items-center justify-between text-xs text-zinc-400">
                              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{c.author_title}</span>
                              <span>{new Date(c.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-zinc-800 dark:text-zinc-200">{c.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 italic">No replies yet.</p>
                    )}

                    {/* Comment Input Form */}
                    <form onSubmit={(e) => handleCommentSubmit(e, rev.id)} className="flex gap-2">
                      <input
                        type="text"
                        name="content"
                        placeholder="Add a respectful comment..."
                        className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isPendingComment}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <FiSend className="w-4 h-4" />
                        <span>{isPendingComment ? 'Sending...' : 'Reply'}</span>
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        companyId={company.id}
        companyName={company.name}
        onReviewAdded={(newRev) => setReviews([newRev, ...reviews])}
      />
    </div>
  );
}