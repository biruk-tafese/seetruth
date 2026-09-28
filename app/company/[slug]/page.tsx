import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CompanyProfileClient from '@/components/CompanyProfileClient';
import { Comment } from '@/types';

async function getCompanyData(slug: string) {
  const supabase = await createClient();

  const { data: company, error: companyError } = await supabase
    .from('companies').select('*').eq('slug', slug).single();

  if (companyError || !company) notFound();

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, comments(*)')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false });

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*, inquiry_replies(*)')
    .ilike('company_name', `%${company.name}%`)
    .order('created_at', { ascending: false });

  // 🌳 Build Comment Tree (Nest replies under their parents)
  const processedReviews = (reviews || []).map((rev: any) => {
    const comments = rev.comments || [];
    comments.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    const map = new Map<string, any>();
    const roots: any[] = [];
    
    comments.forEach((c: any) => { c.replies = []; map.set(c.id, c); });
    comments.forEach((c: any) => {
      if (c.parent_id && map.has(c.parent_id)) {
        map.get(c.parent_id)!.replies.push(c);
      } else {
        roots.push(c);
      }
    });
    
    return { ...rev, comments: roots };
  });

  return { company, reviews: processedReviews, inquiries: inquiries || [] };
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