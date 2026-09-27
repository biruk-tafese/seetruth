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