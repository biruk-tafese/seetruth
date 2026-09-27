'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { INITIAL_INQUIRIES } from '@/data/seedCompanies';
import { Inquiry, InquiryReply } from '@/types';
import { FiMessageSquare, FiPlus, FiChevronDown, FiChevronUp, FiSend, FiUser } from 'react-icons/fi';
import AskQuestionModal from '@/components/AskQuestionModal';
import { addInquiryReply } from '@/app/actions';

export default function InquiryBoard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // UI State
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const supabase = createClient();

  // Fetch inquiries from database on mount
  useEffect(() => {
    const fetchInquiries = async () => {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*, inquiry_replies(*)')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setInquiries(data);
      } else {
        setInquiries(INITIAL_INQUIRIES); // Fallback
      }
      setIsLoading(false);
    };
    fetchInquiries();
  }, []);

  const handleAskSuccess = (newInquiry: Inquiry) => {
    setInquiries([newInquiry, ...inquiries]);
    setIsModalOpen(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setReplyingTo(null); // Close reply form when collapsing
  };

  const handleReplySubmit = async (e: React.FormEvent, inquiryId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);

    // Optimistic UI update
    const tempReply: InquiryReply = {
      id: `temp-${Date.now()}`,
      inquiry_id: inquiryId,
      author_title: 'You (Pending)',
      content: replyText,
      created_at: new Date().toISOString(),
    };

    setInquiries(prev => prev.map(inq => 
      inq.id === inquiryId 
        ? { ...inq, replies: [...(inq.replies || []), tempReply], replies_count: inq.replies_count + 1 }
        : inq
    ));

    // Call Server Action
    const result = await addInquiryReply(inquiryId, replyText, 'Verified User');
    
    if (result.success && result.data) {
      // Replace temp reply with real DB data
      setInquiries(prev => prev.map(inq => 
        inq.id === inquiryId 
          ? { ...inq, replies: inq.replies?.map(r => r.id === tempReply.id ? result.data : r) }
          : inq
      ));
      setReplyText('');
      setReplyingTo(null);
    } else {
      // Revert on error
      setInquiries(prev => prev.map(inq => 
        inq.id === inquiryId 
          ? { ...inq, replies: inq.replies?.filter(r => r.id !== tempReply.id), replies_count: inq.replies_count - 1 }
          : inq
      ));
      alert(result.error || 'Failed to post reply.');
    }

    setIsSubmittingReply(false);
  };

  if (isLoading) {
    return (
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-10 sm:pt-12 px-2">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
            <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="inquiries" className="border-t border-zinc-200 dark:border-zinc-800 pt-10 sm:pt-12 px-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FiMessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Recent Open Inquiries
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Community questions awaiting insider answers</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-500/20 w-full sm:w-auto"
          >
            <FiPlus className="w-4 h-4" />
            Ask a Question
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inquiries.length === 0 ? (
            <div className="col-span-full text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50">
              <p className="text-zinc-500 dark:text-zinc-400">No questions asked yet. Be the first!</p>
            </div>
          ) : (
            inquiries.map((inquiry) => (
              <div key={inquiry.id} className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden transition-all hover:border-blue-300 dark:hover:border-blue-700">
                {/* Inquiry Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{inquiry.company_name}</span>
                        <span className="text-xs text-zinc-400">• {new Date(inquiry.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-medium text-zinc-900 dark:text-zinc-100 leading-snug">{inquiry.question}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Asked by {inquiry.author_title}</p>
                    </div>
                  </div>

                  {/* Expand/Collapse Button */}
                  <button 
                    onClick={() => toggleExpand(inquiry.id)}
                    className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  >
                    {expandedId === inquiry.id ? (
                      <>Hide Replies <FiChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>View & Reply ({inquiry.replies_count}) <FiChevronDown className="w-4 h-4" /></>
                    )}
                  </button>
                </div>

                {/* Expanded Replies Section */}
                {expandedId === inquiry.id && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 p-5 space-y-4">
                    
                    {/* List of Replies */}
                    {inquiry.replies && inquiry.replies.length > 0 ? (
                      <div className="space-y-3">
                        {inquiry.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                              <FiUser className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{reply.author_title}</span>
                                <span className="text-[10px] text-zinc-400">{new Date(reply.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 py-4">No replies yet. Be the first insider to answer!</p>
                    )}

                    {/* Reply Input Form */}
                    {replyingTo === inquiry.id ? (
                      <form onSubmit={(e) => handleReplySubmit(e, inquiry.id)} className="space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Share your insider knowledge..."
                          rows={2}
                          className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-100 resize-none"
                          required
                        />
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setReplyingTo(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            disabled={isSubmittingReply}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <FiSend className="w-3 h-3" /> {isSubmittingReply ? 'Posting...' : 'Post Reply'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button 
                        onClick={() => setReplyingTo(inquiry.id)}
                        className="w-full py-2 text-xs font-medium text-blue-600 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                      >
                        + Write a reply as an insider
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <AskQuestionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleAskSuccess} 
      />
    </>
  );
}