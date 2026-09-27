'use client';

import { useState } from 'react';
import { INITIAL_INQUIRIES } from '@/data/seedCompanies';
import { Inquiry } from '@/types';
import { FiMessageSquare, FiPlus } from 'react-icons/fi';

export default function InquiryBoard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);
  const [newInquiryQuestion, setNewInquiryQuestion] = useState('');
  const [newInquiryCompany, setNewInquiryCompany] = useState('General');

  const handlePostInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInquiryQuestion.trim()) return;

    const newInq: Inquiry = {
      id: `inq-${Date.now()}`,
      company_name: newInquiryCompany,
      question: newInquiryQuestion,
      author_title: 'Job Seeker',
      replies_count: 0,
      created_at: new Date().toISOString(),
      replies: []
    };

    setInquiries([newInq, ...inquiries]);
    setNewInquiryQuestion('');
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Open Inquiry Board</h2>
          <p className="text-blue-200 text-sm mt-1">
            Have a question about a company? Ask the community directly. Insiders will answer.
          </p>
        </div>
        <form onSubmit={handlePostInquiry} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            value={newInquiryCompany}
            onChange={(e) => setNewInquiryCompany(e.target.value)}
            placeholder="Company Name"
            className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            value={newInquiryQuestion}
            onChange={(e) => setNewInquiryQuestion(e.target.value)}
            placeholder="e.g. Can anybody tell me anything about..."
            className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 sm:w-80"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 font-medium text-sm transition-colors flex items-center justify-center space-x-1.5 shadow-md"
          >
            <FiPlus className="w-4 h-4" />
            <span>Ask Truth</span>
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
        {inquiries.map(inq => (
          <div key={inq.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {inq.company_name}
              </span>
              <span className="text-xs text-blue-300">By {inq.author_title}</span>
            </div>
            <p className="font-medium text-zinc-100">{inq.question}</p>
            <div className="flex items-center justify-between pt-2 text-xs text-blue-200">
              <div className="flex items-center space-x-1">
                <FiMessageSquare className="w-4 h-4" />
                <span>{inq.replies?.length || 0} Insider Replies</span>
              </div>
              <span>{new Date(inq.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}