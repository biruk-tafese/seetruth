'use client';
import { useState } from 'react';
import { useAnonymousGate } from '@/hooks/useAnonymousGate';
import { FiCheckCircle } from 'react-icons/fi';
import { AuthModal } from './AuthModal';

export function ReviewSubmission({ companyId, isAuthenticated }: { companyId: string; isAuthenticated: boolean }) {
  const { hasSubmitted, isChecking, recordSubmission } = useAnonymousGate(companyId);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated && hasSubmitted) { setIsAuthModalOpen(true); return; }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API
    if (!isAuthenticated) recordSubmission();
    setIsExpanded(false); setPros(''); setCons(''); setIsSubmitting(false);
    alert('Review submitted successfully!');
  };

  if (isChecking) return <div className="animate-pulse h-24 bg-muted rounded-lg" />;

  return (
    <>
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <button onClick={() => setIsExpanded(!isExpanded)} className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left">
          <span className="font-semibold text-foreground">Write a Review</span>
          <span className="text-sm text-muted-foreground">{isExpanded ? 'Cancel' : 'Share your experience'}</span>
        </button>
        {isExpanded && (
          <form onSubmit={handleSubmit} className="p-4 border-t border-border space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Overall Rating: {rating}/5</label>
              <input type="range" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full accent-primary" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1 text-green-600 dark:text-green-400">Pros</label><textarea value={pros} onChange={(e) => setPros(e.target.value)} className="w-full p-3 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" rows={3} placeholder="What did you like?" required /></div>
              <div><label className="block text-sm font-medium mb-1 text-red-600 dark:text-red-400">Cons</label><textarea value={cons} onChange={(e) => setCons(e.target.value)} className="w-full p-3 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" rows={3} placeholder="What could be improved?" required /></div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><FiCheckCircle className="w-3 h-3" />{!isAuthenticated ? 'Submitting anonymously' : 'Submitting as authenticated user'}</span>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">{isSubmitting ? 'Submitting...' : 'Submit Review'}</button>
            </div>
          </form>
        )}
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} targetCompanyId={companyId} />
    </>
  );
}
