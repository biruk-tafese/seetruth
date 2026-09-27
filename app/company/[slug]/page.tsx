import { createClient } from '@/lib/supabase/server';
import { INITIAL_COMPANIES, INITIAL_REVIEWS, INITIAL_INQUIRIES } from '@/data/seedCompanies';
import { Company, Review, Inquiry } from '@/types';
import CompanyProfileClient from '@/components/CompanyProfileClient';
import { notFound } from 'next/navigation';

async function getCompanyData(slug: string) {
  const supabase = await createClient();

  // 1. Fetch Company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single();

  // Fallback to seed data if not in DB yet
  if (companyError || !company) {
    const seedCompany = INITIAL_COMPANIES.find(c => c.slug === slug);
    if (!seedCompany) return null;
    return {
      company: seedCompany,
      reviews: INITIAL_REVIEWS.filter(r => r.company_id === seedCompany.id),
      inquiries: INITIAL_INQUIRIES.filter(i => i.company_name === seedCompany.name)
    };
  }

  // 2. Fetch Reviews (with nested comments)
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, comments(*)')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false });

  // 3. Fetch Inquiries (with nested replies)
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*, inquiry_replies(*)')
    .eq('company_name', company.name)
    .order('created_at', { ascending: false });

  return {
    company,
    reviews: reviews || [],
    inquiries: inquiries || []
  };
}

export default async function CompanyProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const data = await getCompanyData(resolvedParams.slug);

  if (!data) {
    notFound();
  }

  return (
    <CompanyProfileClient 
      company={data.company} 
      initialReviews={data.reviews} 
      initialInquiries={data.inquiries} 
    />
  );
}