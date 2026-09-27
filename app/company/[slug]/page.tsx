import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CompanyProfileClient from '@/components/CompanyProfileClient';

async function getCompanyData(slug: string) {
  const supabase = await createClient();

  // 1. Fetch Company strictly from DB
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single();

  // If not found in DB, trigger 404 immediately
  if (companyError || !company) {
    notFound();
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

  return (
    <CompanyProfileClient 
      company={data.company} 
      initialReviews={data.reviews} 
      initialInquiries={data.inquiries} 
    />
  );
}