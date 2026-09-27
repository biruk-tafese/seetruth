import { Company, Review, Inquiry } from '@/types';

export const INITIAL_COMPANIES: Company[] = [
  { id: 'c-1', name: 'Safaricom Ethiopia', slug: 'safaricom-ethiopia', category: 'Telecom & Tech', location: 'Addis Ababa, Bole', logo_url: 'https://placehold.co/120x120/0f172a/38bdf8?text=SE', website: 'https://safaricom.et', address: 'VamDas Building, Bole Road', verified: true, overall_rating: 4.2, culture_rating: 4.4, management_rating: 3.9, compensation_rating: 4.5, review_count: 38, created_at: new Date().toISOString() },
  { id: 'c-2', name: 'Dashen Bank S.C.', slug: 'dashen-bank', category: 'Banking & Finance', location: 'Addis Ababa, Kirkos', logo_url: 'https://placehold.co/120x120/0f172a/38bdf8?text=DB', website: 'https://dashenbanksc.com', address: 'Dashen Bank Tower, Sudani St', verified: true, overall_rating: 3.8, culture_rating: 3.7, management_rating: 3.5, compensation_rating: 4.1, review_count: 52, created_at: new Date().toISOString() },
  { id: 'c-3', name: 'Gebeya Inc.', slug: 'gebeya', category: 'Tech & Software', location: 'Addis Ababa, CMC', logo_url: 'https://placehold.co/120x120/0f172a/38bdf8?text=GB', website: 'https://gebeya.com', address: 'CMC Road, Summit', verified: false, overall_rating: 4.5, culture_rating: 4.7, management_rating: 4.3, compensation_rating: 4.4, review_count: 24, created_at: new Date().toISOString() },
  { id: 'c-4', name: 'Ethiopian Airlines', slug: 'ethiopian-airlines', category: 'Aviation & Logistics', location: 'Addis Ababa, Bole Airport', logo_url: 'https://placehold.co/120x120/0f172a/38bdf8?text=EA', website: 'https://ethiopianairlines.com', address: 'Bole International Airport', verified: true, overall_rating: 4.0, culture_rating: 3.9, management_rating: 3.8, compensation_rating: 4.2, review_count: 110, created_at: new Date().toISOString() },
  { id: 'c-5', name: 'AppName Business Center', slug: 'appname-business-center', category: 'Coworking & Services', location: 'Addis Ababa, Kazanchis', logo_url: 'https://placehold.co/120x120/0f172a/38bdf8?text=AB', website: 'https://appnamecenter.et', address: 'Kazanchis Near ECA', verified: true, overall_rating: 4.6, culture_rating: 4.8, management_rating: 4.5, compensation_rating: 4.5, review_count: 19, created_at: new Date().toISOString() }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r-1', company_id: 'c-1', is_anonymous: true, author_title: 'Current Senior Software Engineer', rating: 5, culture_score: 5, management_score: 4, compensation_score: 5, salary_amount: 85000,
    pros: 'Excellent healthcare benefits, fast-paced agile environment, robust tech stack.',
    cons: 'High expectations and occasional late-night deployments required.',
    comment: 'Working here has been an incredible journey. Leadership listens to engineering feedback and growth opportunities are truly exceptional.',
    image_url: 'https://placehold.co/600x400/1e293b/38bdf8?text=Modern+Office+Workspace', upvotes: 14, downvotes: 1, created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    comments: [{ id: 'cm-1', review_id: 'r-1', author_title: 'Former DevOps Engineer', content: 'Can confirm the tech stack is top notch. How is the hybrid work policy currently?', upvotes: 3, created_at: new Date(Date.now() - 86400000).toISOString() }]
  }
];

export const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-1', company_name: 'Safaricom Ethiopia', question: 'Can anybody share details about their standard interview stages for technical roles?', author_title: 'Job Seeker', replies_count: 2, created_at: new Date().toISOString(),
    replies: [{ id: 'inqr-1', inquiry_id: 'inq-1', author_title: 'Current Engineering Lead', content: 'Usually 3 stages: HR screening, technical deep-dive assignment with live coding, and a final culture-fit interview with the director.', created_at: new Date().toISOString() }]
  }
];