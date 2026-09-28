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

  const { data: reply, error: replyError } = await supabase
    .from('inquiry_replies')
    .insert({
      inquiry_id: inquiryId,
      content,
      author_title: authorTitle, // <-- Saves the dynamic title
      user_id: user?.id || null,
    })
    .select()
    .single();

  if (replyError) return { error: replyError.message };

  const { data: currentInquiry } = await supabase
    .from('inquiries')
    .select('replies_count')
    .eq('id', inquiryId)
    .single();
    
  const newCount = (currentInquiry?.replies_count || 0) + 1;
  await supabase.from('inquiries').update({ replies_count: newCount }).eq('id', inquiryId);

  revalidatePath('/');
  return { success: true, data: reply };
}


// Add these to your existing app/actions.ts file

export async function createReview(formData: FormData, companyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isAnonymous = formData.get('is_anonymous') === 'true';
  const authorTitle = formData.get('author_title') as string || 'Anonymous User';
  const rating = Number(formData.get('rating'));
  const pros = formData.get('pros') as string;
  const cons = formData.get('cons') as string;
  const comment = formData.get('comment') as string;
  const salaryAmount = formData.get('salary_amount') ? Number(formData.get('salary_amount')) : null;
  const imageUrl = formData.get('image_url') as string || null;

  if (!comment?.trim() || !rating) return { error: 'Rating and comment are required.' };

  // 1. Insert the review
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .insert({
      company_id: companyId,
      user_id: user?.id || null,
      is_anonymous: isAnonymous,
      author_title: isAnonymous ? 'Anonymous Insider' : authorTitle,
      rating,
      pros,
      cons,
      comment,
      salary_amount: salaryAmount,
      image_url: imageUrl,
      upvotes: 0,
      downvotes: 0,
    })
    .select()
    .single();

  if (reviewError) return { error: reviewError.message };

  // 2. Increment the company's review_count
  const { data: companyData } = await supabase
    .from('companies')
    .select('review_count')
    .eq('id', companyId)
    .single();

  if (companyData) {
    await supabase
      .from('companies')
      .update({ review_count: (companyData.review_count || 0) + 1 })
      .eq('id', companyId);
  }

  revalidatePath(`/company/${companyId}`); // Revalidate the company page
  return { success: true, data: review };
}

export async function addCommentToReview(reviewId: string, content: string, authorTitle: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!content.trim()) return { error: 'Comment cannot be empty.' };

  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      review_id: reviewId,
      user_id: user?.id || null,
      author_title: authorTitle,
      content,
      upvotes: 0,
    })
    .select()
    .single();

  if (commentError) return { error: commentError.message };

  revalidatePath('/');
  return { success: true, data: comment };
}

// Add this to your existing app/actions.ts file

export async function searchCompanies(query: string) {
  if (!query || query.length < 2) return [];
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, slug, category')
    .ilike('name', `%${query}%`)
    .limit(5);
  
  if (error) return [];
  return data || [];
}