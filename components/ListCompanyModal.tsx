'use client';

import { useState, useTransition, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { FiX, FiMapPin, FiGlobe, FiImage, FiBriefcase, FiAlertCircle, FiPlusCircle, FiCheckCircle } from 'react-icons/fi';
import { createCompany, searchCompanies } from '@/app/actions';

interface ListCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ListCompanyModal({ isOpen, onClose }: ListCompanyModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Smart autocomplete states
  const [nameInput, setNameInput] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced search for existing companies
  useEffect(() => {
    if (nameInput.length < 2 || selectedCompany) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await searchCompanies(nameInput);
      setSuggestions(results);
    }, 300); // 300ms debounce for smooth UX

    return () => clearTimeout(timer);
  }, [nameInput, selectedCompany]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedCompany) return; // Prevent duplicate creation
    
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set('name', nameInput); // Ensure we use the current typed/selected value
    
    startTransition(async () => {
      const result = await createCompany(formData);
      if (result?.error) {
        setError(result.error);
      }
      // If successful, createCompany handles the redirect automatically
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
          <FiX className="w-5 h-5" />
        </button>
        
        <div className="mb-6">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FiPlusCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            List a New Company
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Add a company to SeeTruth so the community can start reviewing it.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
            <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Company Name *</label>
            <div className="relative">
              <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                name="name"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setSelectedCompany(null); // Reset selection if user keeps typing
                }}
                placeholder="e.g. Safaricom Ethiopia" 
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-100" 
                required 
              />
              
              {/* Autocomplete Dropdown */}
              {suggestions.length > 0 && !selectedCompany && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {suggestions.map((company) => (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => {
                        setSelectedCompany(company);
                        setNameInput(company.name);
                        setSuggestions([]);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center justify-between group transition-colors"
                    >
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{company.name}</span>
                      <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-md">{company.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Smart Warning if company already exists */}
            {selectedCompany && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
                <FiCheckCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-800 dark:text-amber-300">
                  <p className="font-semibold mb-1">This company is already listed in our database.</p>
                  <p className="mb-2">Please search for it instead of creating a duplicate entry.</p>
                  <Link 
                    href={`/company/${selectedCompany.slug}`} 
                    onClick={onClose} 
                    className="inline-flex items-center gap-1 font-bold text-amber-900 dark:text-amber-200 hover:underline"
                  >
                    View {selectedCompany.name}'s profile →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Location *</label>
            <div className="relative">
              <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input type="text" name="location" placeholder="e.g. Addis Ababa, Bole" className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-100" required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Website Link (Optional)</label>
            <div className="relative">
              <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input type="url" name="website" placeholder="https://www.company.com" className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-100" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Logo Image URL (Optional)</label>
            <div className="relative">
              <FiImage className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input type="url" name="logo_url" placeholder="https://images.unsplash.com/..." className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-100" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
            <button 
              type="submit" 
              disabled={isPending || !!selectedCompany} 
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending ? 'Creating...' : 'Create Company'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}