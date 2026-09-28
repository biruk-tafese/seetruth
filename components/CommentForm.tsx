'use client';

import { useState } from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import { addCommentToReview } from '@/app/actions'; // Make sure this matches your action name (e.g., submitComment)
import { Comment } from '@/types';

interface CommentFormProps {
  reviewId: string;
  onCommentAdded: (comment: Comment) => void;
}

export default function CommentForm({ reviewId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    // Check anonymous preference
    const isAnonymous = typeof window !== 'undefined' && localStorage.getItem('seetruth_anonymous_pref') === 'true';
    const authorTitle = isAnonymous ? 'Anonymous Insider' : 'Verified Insider';

    // Optimistic UI
    const tempComment: Comment = {
      id: `temp-${Date.now()}`,
      review_id: reviewId,
      author_title: authorTitle,
      content,
      upvotes: 0,
      downvotes: 0, // <-- ADDED THIS TO FIX THE TYPESCRIPT ERROR
      created_at: new Date().toISOString(),
    };
    onCommentAdded(tempComment);

    // Database insertion (Ensure this function name matches your app/actions.ts)
    const result = await addCommentToReview(reviewId, content, authorTitle);

    if (result.success && result.data) {
      setContent('');
    } else {
      alert(result.error || 'Failed to post comment.');
      // Note: In a production app, you'd also want to revert the optimistic UI update here
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a respectful comment..."
        className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        required
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
      >
        <FiMessageSquare className="w-4 h-4" />
        <span>{isSubmitting ? 'Posting...' : 'Reply'}</span>
      </button>
    </form>
  );
}