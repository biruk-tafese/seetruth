import { createClient } from '@/lib/supabase/server';
import { Company } from '@/types';
import { FiSearch, FiMapPin, FiStar, FiCheckCircle, FiFilter, FiMessageSquare } from 'react-icons/fi';
import Link from 'next/link';
import InquiryBoard from '@/components/InquiryBoard';

// 1. Dynamically fetch unique categories from the database
async function getCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('companies').select('category');
  
  if (error || !data) return ['All'];
  
  // Extract unique categories, filter out nulls, and sort alphabetically
  const uniqueCategories = Array.from(
    new Set(data.map(item => item.category).filter(Boolean))
  ).sort() as string[];
  
  return ['All', ...uniqueCategories];
}

// 2. Fetch companies with optional search and category filters
async function getCompanies(searchQuery?: string, category?: string): Promise<Company[]> {
  const supabase = await createClient();
  let query = supabase.from('companies').select('*');
  
  if (category && category !== 'All') {
    query = query.eq('category', category);
  }
  
  query = query.order('overall_rating', { ascending: false });
  
  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
  }
  
  const { data, error } = await query.limit(50);
  if (error || !data) return [];
  return data;
}

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';
  const category = resolvedSearchParams.category || 'All';
  
  // Fetch categories and companies in parallel for maximum performance
  const [categories, companies] = await Promise.all([
    getCategories(),
    getCompanies(query, category)
  ]);

  // Helper to build clean, shareable filter URLs
  const getFilterHref = (cat: string) => {
    const params = new URLSearchParams();
    if (cat !== 'All') params.set('category', cat);
    if (query) params.set('q', query);
    return params.toString() ? `/?${params.toString()}` : '/';
  };

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
      
      {/* 1. Hero & Search Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto px-2 mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
          Unfiltered Workplace & Business <span className="text-blue-600 dark:text-blue-400">Insights</span>
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Discover honest salaries, culture breakdowns, and verified reviews from real employees and customers.
        </p>
        
        {/* Smart Search Bar */}
        <div className="relative max-w-2xl mx-auto mt-8">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <form action="/" method="GET" className="flex gap-2">
            <input 
              type="text" 
              name="q" 
              defaultValue={query} 
              placeholder="Search companies, locations, or keywords..." 
              className="flex-1 pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-100 transition-all shadow-sm" 
              autoComplete="off"
            />
            {/* Preserve category in search form */}
            {category !== 'All' && <input type="hidden" name="category" value={category} />}
            
            <button type="submit" className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm shadow-blue-500/20">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* 2. Mobile Category Filter (Horizontal Scroll) */}
      <div className="lg:hidden mb-8 overflow-x-auto pb-2 px-2 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={getFilterHref(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                category === cat 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Main Content Layout: Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-8 px-2">
        
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
                <FiFilter className="w-4 h-4" /> Filter by Category
              </h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={getFilterHref(cat)}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      category === cat 
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Companies Grid */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {category === 'All' ? 'Trending Enterprises' : category}
            </h2>
            <span className="text-sm text-zinc-500">{companies.length} entities found</span>
          </div>

          {companies.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50">
              <p className="text-zinc-500 dark:text-zinc-400 text-lg">No companies found matching your criteria.</p>
              <Link href="/" className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-2 inline-block hover:underline">
                Clear all filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {companies.map((company) => (
                <Link 
                  key={company.id} 
                  href={`/company/${company.slug}`} 
                  className="group block p-5 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/5 transition-all bg-white dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl group-hover:scale-105 transition-transform">
                      {company.name.charAt(0)}
                    </div>
                    {company.verified && (
                      <div className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900">
                        <FiCheckCircle className="w-3.5 h-3.5" /> Verified
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {company.name}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">{company.category}</p>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                    <FiMapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{company.location}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <FiStar className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{company.overall_rating}</span>
                      <span className="text-xs text-zinc-400">({company.review_count})</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      View Insights <span className="text-lg leading-none">→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Interactive Community Q&A Section */}
      <div className="mt-16 sm:mt-24 px-2">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
            <FiMessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Community Q&A</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Get answers directly from industry insiders</p>
          </div>
        </div>
        <InquiryBoard />
      </div>

    </main>
  );
}