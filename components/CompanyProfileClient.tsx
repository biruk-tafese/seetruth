'use client';

import { useState } from 'react';
import {
  FiArrowLeft, FiCheckCircle, FiStar, FiMapPin, FiThumbsUp,
  FiThumbsDown, FiShare2, FiPlus, FiMessageSquare, FiShield
} from 'react-icons/fi';
import { Company, Review, Inquiry } from '@/types';
import WriteReviewModal from '@/components/WriteReviewModal';

interface CompanyProfileClientProps {
  company: Company;
  initialReviews: Review[];
  initialInquiries: Inquiry[];
}

export default function CompanyProfileClient({ company, initialReviews, initialInquiries }: CompanyProfileClientProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVote = (reviewId: string, type: 'up' | 'down') => {
    setReviews(prev => prev.map(rev => {
      if (rev.id === reviewId) {
        return {
          ...rev,
          upvotes: type === 'up' ? rev.upvotes + 1 : rev.upvotes,
          downvotes: type === 'down' ? rev.downvotes + 1 : rev.downvotes,
        };
      }
      return rev;
    }));
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
            <p className="text-xs text-zinc-400 mt-1">Be the first insider or customer to share your unfiltered perspective.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((rev) => (
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

                <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                  <span className="text-zinc-400">Was this review helpful?</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleVote(rev.id, 'up')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-blue-500 transition-all font-medium text-zinc-700 dark:text-zinc-300">
                      <FiThumbsUp className="w-3.5 h-3.5 text-blue-500" /> {rev.upvotes}
                    </button>
                    <button onClick={() => handleVote(rev.id, 'down')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-rose-500 transition-all font-medium text-zinc-700 dark:text-zinc-300">
                      <FiThumbsDown className="w-3.5 h-3.5 text-rose-500" /> {rev.downvotes}
                    </button>
                  </div>
                </div>
              </article>
            ))}
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