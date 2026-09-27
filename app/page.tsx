import { createClient } from '@/lib/supabase/server';
import { INITIAL_COMPANIES, INITIAL_INQUIRIES } from '@/data/seedCompanies';
import { Company, Inquiry } from '@/types';
import { 
  FiSearch, FiMapPin, FiStar, FiCheckCircle, FiMessageSquare, FiPlus, 
  FiShield, FiCoffee, FiExternalLink, FiGithub, FiMail 
} from 'react-icons/fi';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeProvider';

async function getCompanies(searchQuery?: string): Promise<Company[]> {
  const supabase = await createClient();
  let query = supabase.from('companies').select('*').order('overall_rating', { ascending: false });
  
  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
  }
  
  const { data, error } = await query.limit(20);
  
  if (error || !data || data.length === 0) {
    return INITIAL_COMPANIES;
  }
  return data;
}

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';
  const companies = await getCompanies(query);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      
      {/* --- RESPONSIVE HEADER --- */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img 
              src="/seeTruth.png" 
              alt="SeeTruth Logo" 
              className="h-8 w-auto object-contain" 
            />
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              SeeTruth
            </span>
          </Link>
          
          {/* Navigation & Actions */}
          <nav className="flex items-center gap-3 sm:gap-5">
            <Link 
              href="/#inquiries" 
              className="hidden sm:block text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Inquiries
            </Link>
            
            {/* Light/Dark Mode Toggle */}
            <ThemeToggle />
            
            <Link 
              href="/auth" 
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 sm:space-y-16 w-full">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto px-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Unfiltered Workplace & Business <span className="text-blue-600 dark:text-blue-400">Insights</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Discover honest salaries, culture breakdowns, and verified reviews from real employees and customers. No sugarcoating.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-3xl mx-auto px-2">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <form action="/" method="GET">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search companies, business centers, or locations..."
                className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-100 transition-all"
                autoComplete="off"
              />
            </form>
          </div>
          <select className="w-full sm:w-auto px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-100 transition-all cursor-pointer">
            <option value="All">All Sectors</option>
            <option value="Telecom & Tech">Telecom & Tech</option>
            <option value="Banking & Finance">Banking & Finance</option>
            <option value="Software & IT">Software & IT</option>
            <option value="Hospitality & Tourism">Hospitality & Tourism</option>
          </select>
        </div>

        {/* Companies Grid */}
        <div className="space-y-6 px-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Trending Enterprises & Businesses</h2>
            <span className="text-sm text-zinc-500">{companies.length} entities listed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                      <FiCheckCircle className="w-3.5 h-3.5" />
                      Verified
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
        </div>

        {/* Recent Inquiries Section */}
        <div id="inquiries" className="border-t border-zinc-200 dark:border-zinc-800 pt-10 sm:pt-12 px-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FiMessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Recent Open Inquiries
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Community questions awaiting insider answers</p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-500/20 w-full sm:w-auto">
              <FiPlus className="w-4 h-4" />
              Ask a Question
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INITIAL_INQUIRIES.map((inquiry) => (
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
            ))}
          </div>
        </div>
      </main>

      {/* --- SIMPLE & RESPONSIVE FOOTER --- */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            
            {/* Brand Column */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white">
                  <FiShield className="w-4 h-4" />
                </div>
                <span className="text-lg font-bold tracking-tight">SeeTruth</span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Absolute workplace & business transparency. Empowering professionals with unfiltered insights.
              </p>
            </div>

            {/* Support Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Support & Contribute</h4>
              <ul className="space-y-3">
                <li>
                  <a href="https://buymeacoffee.com/biruktafese" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <FiCoffee className="w-4 h-4 text-amber-500" />
                    <span>Buy Me a Coffee</span>
                  </a>
                </li>
                <li>
                  <a href="https://ye-buna.com/biruktafese" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <FiExternalLink className="w-4 h-4" />
                    <span>Ye-Buna Support</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Project Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Project & Contact</h4>
              <ul className="space-y-3">
                <li>
                  <a href="https://github.com/biruk-tafese/seetruth" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <FiGithub className="w-4 h-4" />
                    <span>Star on GitHub</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:cstafesebiruk23@gmail.com" className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <FiMail className="w-4 h-4 text-red-500" />
                    <span>Report a Bug</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Platform Links Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Platform</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link></li>
                <li><Link href="/#inquiries" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Inquiries</Link></li>
                <li><Link href="/auth" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sign In</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-500">
            <p>&copy; {new Date().getFullYear()} SeeTruth. All rights reserved.</p>
            <p>Built with transparency in mind.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}