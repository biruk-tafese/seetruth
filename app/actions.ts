'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCompany(formData: FormData) {
  const supabase = await createClient();
  
  // Require authentication to list a company (prevents spam)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'You must be signed in to list a company.' };
  }

  const name = formData.get('name') as string;
  const location = formData.get('location') as string;
  const website = formData.get('website') as string;
  const logo_url = formData.get('logo_url') as string;

  if (!name || !location) {
    return { error: 'Company name and location are required.' };
  }

  // Generate a clean URL slug
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const { data, error } = await supabase
    .from('companies')
    .insert({
      name,
      slug,
      location,
      website: website || null,
      logo_url: logo_url || null,
      category: 'General', // Default category
      verified: false,
      overall_rating: 0,
      culture_rating: 0,
      management_rating: 0,
      compensation_rating: 0,
      review_count: 0,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { error: 'A company with this name already exists.' };
    }
    return { error: error.message };
  }

  // Revalidate homepage to show the new company immediately
  revalidatePath('/');
  
  // Redirect to the newly created company profile
  redirect(`/company/${data.slug}`);
}


export async function createInquiry(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const company_name = formData.get('company_name') as string;
  const question = formData.get('question') as string;
  const author_title = formData.get('author_title') as string || 'Anonymous User';

  if (!question) return { error: 'Question is required.' };

  const { data, error } = await supabase
    .from('inquiries')
    .insert({
      company_name: company_name || 'General',
      question,
      author_title,
      user_id: user?.id || null,
      replies_count: 0,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  
  revalidatePath('/');
  return { success: true, data };
}

export async function addInquiryReply(inquiryId: string, content: string, authorTitle: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!content.trim()) return { error: 'Reply cannot be empty.' };

  // 1. Insert the reply
  const { data: reply, error: replyError } = await supabase
    .from('inquiry_replies')
    .insert({
      inquiry_id: inquiryId,
      content,
      author_title: authorTitle || (user?.user_metadata?.full_name || 'Anonymous'),
      user_id: user?.id || null,
    })
    .select()
    .single();

  if (replyError) return { error: replyError.message };

  // 2. Increment the replies_count on the parent inquiry
  await supabase
    .from('inquiries')
    .update({ replies_count: supabase.rpc('increment_replies_count', { row_id: inquiryId }) }) // Or just use a raw update if RPC isn't set up
    // Simpler fallback for replies_count:
    .eq('id', inquiryId)
    .select('replies_count')
    .single()
    .then(({ data }) => {
       if(data) supabase.from('inquiries').update({ replies_count: (data.replies_count || 0) + 1 }).eq('id', inquiryId);
    });

  revalidatePath('/');
  return { success: true, data: reply };
}