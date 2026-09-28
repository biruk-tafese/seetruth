'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCompany(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'You must be signed in to list a company.' };
  }

  const name = formData.get('name') as string;
  const location = formData.get('location') as string;
  const website = formData.get('website') as string;
  const logo_url = formData.get('logo_url') as string;
  const category = (formData.get('category') as string) || 'General'; // <-- Read from form

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
      category, // <-- Use the selected category
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

  revalidatePath('/');
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
      author_title: authorTitle || 'Anonymous User',
      user_id: user?.id || null,
    })
    .select()
    .single();

  if (replyError) {
    console.error('Supabase reply insert error:', replyError);
    return { error: replyError.message };
  }

  // 2. Safely increment the replies_count on the parent inquiry
  const { data: currentInquiry } = await supabase
    .from('inquiries')
    .select('replies_count')
    .eq('id', inquiryId)
    .single();
    
  const newCount = (currentInquiry?.replies_count || 0) + 1;
  
  const { error: updateError } = await supabase
    .from('inquiries')
    .update({ replies_count: newCount })
    .eq('id', inquiryId);

  if (updateError) {
    console.error('Supabase inquiry update error:', updateError);
  }

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


// Update existing submitComment to accept parentId
export async function submitComment(formData: FormData, reviewId: string, parentId?: string) {
  const supabase = await createClient();
  
  // 1. Explicitly check for user session on the server
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { error: 'You must be signed in to comment.' };
  }

  const content = formData.get('content') as string;
  // Use the user's actual name from Supabase metadata if available, otherwise fallback
  const author_title = (formData.get('author_title') as string) || (user.user_metadata?.full_name || 'Verified Insider');

  if (!content?.trim()) return { error: 'Comment cannot be empty.' };

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      review_id: reviewId,
      parent_id: parentId || null,
      user_id: user.id, // Link comment to the logged-in user
      author_title,
      content,
      upvotes: 0,
      downvotes: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase comment error:', error);
    return { error: error.message };
  }

  revalidatePath(`/company/[slug]`, 'page');
  return { success: true, data: comment };
}

// Add this new action for liking/disliking comments
export async function submitCommentVote(commentId: string, type: 'upvote' | 'downvote') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be signed in to vote.' };

  const { data: comment, error } = await supabase
    .from('comments')
    .select('upvotes, downvotes')
    .eq('id', commentId)
    .single(); 

  if (error || !comment) return { error: 'Comment not found.' };

  let newUpvotes = comment.upvotes || 0;
  let newDownvotes = comment.downvotes || 0;

  if (type === 'upvote') newUpvotes += 1;
  if (type === 'downvote') newDownvotes += 1;

  const { error: updateError } = await supabase
    .from('comments')
    .update({ upvotes: newUpvotes, downvotes: newDownvotes })
    .eq('id', commentId);

  if (updateError) return { error: updateError.message };

  revalidatePath(`/company/[slug]`, 'page');
  return { success: true, upvotes: newUpvotes, downvotes: newDownvotes };
}

export async function submitVote(reviewId: string, type: 'upvote' | 'downvote') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Enforce authentication for voting (optional but recommended)
  if (!user) {
    return { error: 'You must be signed in to vote.' };
  }

  // 1. Fetch current vote counts
  const { data: review, error: fetchError } = await supabase
    .from('reviews')
    .select('upvotes, downvotes')
    .eq('id', reviewId)
    .single(); 

  if (fetchError || !review) {
    return { error: 'Review not found.' };
  }

  // 2. Calculate new counts safely
  let newUpvotes = review.upvotes || 0;
  let newDownvotes = review.downvotes || 0;

  if (type === 'upvote') {
    newUpvotes += 1;
  } else if (type === 'downvote') {
    newDownvotes += 1;
  }

  // 3. Update the database
  const { error: updateError } = await supabase
    .from('reviews')
    .update({ 
      upvotes: newUpvotes, 
      downvotes: newDownvotes 
    })
    .eq('id', reviewId);

  if (updateError) {
    return { error: updateError.message };
  }

  // 4. Revalidate the company page so the new counts reflect everywhere
  revalidatePath(`/company/[slug]`, 'page');

  return { 
    success: true, 
    upvotes: newUpvotes, 
    downvotes: newDownvotes 
  };
}

