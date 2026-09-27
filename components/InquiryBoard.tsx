'use client';

import { useState } from 'react';
import { INITIAL_INQUIRIES } from '@/data/seedCompanies';
import { Inquiry } from '@/types';
import { FiMessageSquare, FiPlus } from 'react-icons/fi';
import AskQuestionModal from '@/components/AskQuestionModal';

export default function InquiryBoard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAsk = (newInquiry: Inquiry) => {
    setInquiries([newInquiry, ...inquiries]);
  };

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
              <div key={inquiry.id} className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-blue-300 dark:hover:border-blue-700 transition-all bg-white dark:bg-zinc-900 group">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{inquiry.company_name}</span>
                      <span className="text-xs text-zinc-400">• {new Date(inquiry.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100 leading-snug">{inquiry.question}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Asked by {inquiry.author_title}</p>
                  </div>
                  <button className="flex-shrink-0 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors self-start sm:self-center">
                    View & Reply ({inquiry.replies_count})
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AskQuestionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAsk={handleAsk} 
      />
    </>
  );
}