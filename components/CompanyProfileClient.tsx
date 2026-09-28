'use client';

import { useState, useTransition } from 'react';
import {
  FiArrowLeft, FiCheckCircle, FiStar, FiMapPin, FiThumbsUp,
  FiThumbsDown, FiShare2, FiPlus, FiMessageSquare, FiShield, 
  FiAlertTriangle, FiSend, FiZap
} from 'react-icons/fi';
import { Company, Review, Comment } from '@/types';
import WriteReviewModal from '@/components/WriteReviewModal';
import { submitComment, submitVote, submitCommentVote } from '@/app/actions';

interface CompanyProfileClientProps {
  company: Company;
  initialReviews: Review[];
  initialInquiries: any[];
}

// Helper to get user's vote on a specific comment
const getUserCommentVote = (commentId: string) => {
  if (typeof window === 'undefined') return null;
  const votes = JSON.parse(localStorage.getItem('seetruth_comment_votes') || '{}');
  return votes[commentId] || null;
};

// 🧵 Recursive Reddit-Style Comment Thread Component
function CommentThread({ 
  comment, reviewId, depth = 0, onVoteComment, showReplyFor, setShowReplyFor, 
  replyText, setReplyText, onSubmitReply, isPendingComment 
}: any) {
  const [collapsed, setCollapsed] = useState(false);
  const userVote = getUserCommentVote(comment.id);

  return (
    <div className={`relative ${depth > 0 ? 'ml-4 sm:ml-6 pl-4 border-l-2 border-zinc-200 dark:border-zinc-800 hover:border-blue-400 transition-colors' : ''}`}>
      
      {/* Collapse/Expand Button for nested threads */}
      {depth > 0 && (
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300 hover:bg-blue-500 hover:text-white transition-colors z-10"
          title={collapsed ? 'Expand thread' : 'Collapse thread'}
        >
          {collapsed ? '+' : '−'}
        </button>
      )}

      <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-100 dark:border-zinc-700 mb-2">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{comment.author_title}</span>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-400">{new Date(comment.created_at).toLocaleDateString()}</span>
          </div>
          {depth === 0 && <span className="text-[10px] font-bold uppercase text-zinc-400">Top Level</span>}
        </div>
        
        <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed mb-2">{comment.content}</p>
        
        {/* Comment Actions (Like, Dislike, Reply) */}
        <div className="flex items-center gap-3 text-xs">
          <button 
            onClick={() => onVoteComment(comment.id, 'upvote')}
            disabled={userVote === 'upvote'}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${userVote === 'upvote' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
          >
            <FiThumbsUp className="w-3 h-3" /> {comment.upvotes}
          </button>
          <button 
            onClick={() => onVoteComment(comment.id, 'downvote')}
            disabled={userVote === 'downvote'}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${userVote === 'downvote' ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
          >
            <FiThumbsDown className="w-3 h-3" /> {comment.downvotes}
          </button>
          <button 
            onClick={() => setShowReplyFor(showReplyFor === comment.id ? null : comment.id)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-medium"
          >
            <FiMessageSquare className="w-3 h-3" /> Reply
          </button>
        </div>
      </div>

      {/* Nested Reply Input */}
      {showReplyFor === comment.id && (
        <form onSubmit={(e) => onSubmitReply(e, reviewId, comment.id)} className="ml-4 sm:ml-6 mb-3 flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Reply to ${comment.author_title}...`}
            className="flex-1 px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-100"
            required
          />
          <button type="submit" disabled={isPendingComment} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium disabled:opacity-50">
            {isPendingComment ? '...' : 'Post'}
          </button>
        </form>
      )}

      {/* Render Nested Replies Recursively */}
      {!collapsed && comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply: Comment) => (
            <CommentThread 
              key={reply.id} comment={reply} reviewId={reviewId} depth={depth + 1} 
              onVoteComment={onVoteComment} showReplyFor={showReplyFor} setShowReplyFor={setShowReplyFor}
              replyText={replyText} setReplyText={setReplyText} onSubmitReply={onSubmitReply} isPendingComment={isPendingComment}
            />
          ))}
        </div>
      )}
      
      {/* Collapsed State Indicator */}
      {collapsed && comment.replies && comment.replies.length > 0 && (
        <button onClick={() => setCollapsed(false)} className="text-xs text-blue-500 hover:underline ml-4 mb-2">
          Show {comment.replies.length} more {comment.replies.length === 1 ? 'reply' : 'replies'}
        </button>
      )}
    </div>
  );
}

export default function CompanyProfileClient({ company, initialReviews }: CompanyProfileClientProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [isPendingVote, startVoteTransition] = useTransition();
  const [isPendingComment, startCommentTransition] = useTransition();
  
  // State for nested replies
  const [showReplyFor, setShowReplyFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVoteAction = (reviewId: string, type: 'upvote' | 'downvote') => {
    const votes = JSON.parse(localStorage.getItem('seetruth_votes') || '{}');
    if (votes[reviewId] === type) return;

    startVoteTransition(async () => {
      const result = await submitVote(reviewId, type);
      if (result.success) {
        setReviews(prev => prev.map(rev => rev.id === reviewId ? { ...rev, upvotes: result.upvotes, downvotes: result.downvotes } : rev));
        votes[reviewId] = type;
        localStorage.setItem('seetruth_votes', JSON.stringify(votes));
      }
    });
  };

  const getUserVote = (reviewId: string) => {
    if (typeof window === 'undefined') return null;
    const votes = JSON.parse(localStorage.getItem('seetruth_votes') || '{}');
    return votes[reviewId] || null;
  };

  // 🛠️ FIX: Save form reference synchronously to prevent null error in async transition
  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>, reviewId: string, parentId?: string) => {
    e.preventDefault();
    const form = e.currentTarget; // Save reference BEFORE async call
    const formData = new FormData(form);
    const isAnonymous = typeof window !== 'undefined' && localStorage.getItem('seetruth_anonymous_pref') === 'true';
    formData.set('author_title', isAnonymous ? 'Anonymous Insider' : 'Verified Insider');

    startCommentTransition(async () => {
      const result = await submitComment(formData, reviewId, parentId);
      if (result.success && result.data) {
        if (parentId) {
          // Insert reply into the nested tree
          setReviews(prev => prev.map(rev => {
            if (rev.id !== reviewId) return rev;
            const insertReply = (comments: Comment[]): Comment[] => comments.map(c => {
              if (c.id === parentId) return { ...c, replies: [...(c.replies || []), result.data] };
              if (c.replies?.length) return { ...c, replies: insertReply(c.replies) };
              return c;
            });
            return { ...rev, comments: insertReply(rev.comments || []) };
          }));
        } else {
          // Add top-level comment
          setReviews(prev => prev.map(rev => rev.id === reviewId ? { ...rev, comments: [...(rev.comments || []), result.data] } : rev));
        }
        form.reset(); // Use saved reference
        setShowReplyFor(null);
        setReplyText('');
      } else {
        alert(result.error || 'Failed to post comment.');
      }
    });
  };

  // Handle voting on individual comments
  const handleVoteComment = (commentId: string, type: 'upvote' | 'downvote') => {
    const votes = JSON.parse(localStorage.getItem('seetruth_comment_votes') || '{}');
    if (votes[commentId] === type) return;

    startVoteTransition(async () => {
      const result = await submitCommentVote(commentId, type);
      if (result.success) {
        setReviews(prev => prev.map(rev => {
          const updateComment = (comments: Comment[]): Comment[] => comments.map(c => {
            if (c.id === commentId) return { ...c, upvotes: result.upvotes, downvotes: result.downvotes };
            if (c.replies?.length) return { ...c, replies: updateComment(c.replies) };
            return c;
          });
          return { ...rev, comments: updateComment(rev.comments || []) };
        }));
        votes[commentId] = type;
        localStorage.setItem('seetruth_comment_votes', JSON.stringify(votes));
      }
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pb-20">
      {/* Top Navigation & Header (Kept same as before) */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <FiArrowLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={handleShare} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <FiShare2 className="w-4 h-4" /> {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>

      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 py-12 px-6 md:px-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-2xl flex-shrink-0">
              {company.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{company.name}</h1>
                {company.verified && <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-900"><FiCheckCircle className="w-3 h-3" /> Verified</span>}
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{company.category}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1"><FiMapPin className="w-3.5 h-3.5" /> {company.location}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsWriteModalOpen(true)} className="px-5 py-3 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-all shadow-sm inline-flex items-center gap-2">
            <FiPlus className="w-4 h-4" /> Write Review
          </button>
        </div>
      </header>

      {/* AI Summary Teaser */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-5 flex items-start gap-4">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400 flex-shrink-0"><FiZap className="w-5 h-5" /></div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100">AI-Powered Company Summary</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full">Coming Soon</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">We are currently analyzing employee reviews and comments to generate instant, unbiased insights about {company.name}'s culture. Stay tuned!</p>
          </div>
        </div>
      </div>

      {/* Main Reviews Feed */}
      <main className="max-w-4xl mx-auto px-6 py-12 w-full flex-grow">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Verified Reviews</h2>
            <div className="flex items-center gap-1 text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900">
              <FiStar className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {company.overall_rating}
            </div>
          </div>
          <span className="text-xs text-zinc-400">{reviews.length} reviews</span>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800">
            <FiMessageSquare className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No reviews yet for {company.name}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {reviews.map((rev) => {
              const userVote = getUserVote(rev.id);
              return (
                <article key={rev.id} className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6">
                  {/* Review Header & Content (Kept same as before) */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{rev.author_title}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">{rev.is_anonymous ? 'Anonymous' : 'Verified'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <span className="inline-flex items-center gap-1 text-amber-500 font-bold"><FiStar className="w-3.5 h-3.5 fill-amber-400" /> {rev.rating}.0</span>
                        <span>•</span><span>{new Date(rev.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"><FiShield className="w-3 h-3" /> Verified</div>
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

                  {/* Review Voting */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                    <span className="text-zinc-400">Was this review helpful?</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleVoteAction(rev.id, 'upvote')} disabled={userVote === 'upvote' || isPendingVote} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all font-medium ${userVote === 'upvote' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-blue-500'}`}>
                        <FiThumbsUp className="w-3.5 h-3.5" /> {rev.upvotes}
                      </button>
                      <button onClick={() => handleVoteAction(rev.id, 'downvote')} disabled={userVote === 'downvote' || isPendingVote} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all font-medium ${userVote === 'downvote' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-rose-500'}`}>
                        <FiThumbsDown className="w-3.5 h-3.5" /> {rev.downvotes}
                      </button>
                    </div>
                  </div>

                  {/* 🧵 Threaded Comments Section */}
                  <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-4">
                      <FiMessageSquare className="w-4 h-4 text-zinc-500" />
                      <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Discussion & Replies</h4>
                    </div>
                    
                    <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2">
                      <FiAlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">Comments are permanent and cannot be deleted. Please be respectful.</p>
                    </div>

                    {/* Render Top-Level Comments using the Recursive Component */}
                    {rev.comments && rev.comments.length > 0 ? (
                      <div className="space-y-4 mb-6">
                        {rev.comments.map((c) => (
                          <CommentThread 
                            key={c.id} comment={c} reviewId={rev.id} depth={0}
                            onVoteComment={handleVoteComment} showReplyFor={showReplyFor} setShowReplyFor={setShowReplyFor}
                            replyText={replyText} setReplyText={setReplyText} onSubmitReply={handleCommentSubmit} isPendingComment={isPendingComment}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 italic">No replies yet.</p>
                    )}

                    {/* Top-Level Comment Input */}
                    <form onSubmit={(e) => handleCommentSubmit(e, rev.id)} className="flex gap-2">
                      <input type="text" name="content" placeholder="Add a respectful comment..." className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                      <button type="submit" disabled={isPendingComment} className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                        <FiSend className="w-4 h-4" /><span>{isPendingComment ? 'Sending...' : 'Reply'}</span>
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <WriteReviewModal isOpen={isWriteModalOpen} onClose={() => setIsWriteModalOpen(false)} companyId={company.id} companyName={company.name} onReviewAdded={(newRev) => setReviews([newRev, ...reviews])} />
    </div>
  );
}