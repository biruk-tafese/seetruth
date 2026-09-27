export interface Company {
  id: string;
  name: string;
  slug: string;
  category: string;
  location: string;
  logo_url?: string;
  website?: string;
  address?: string;
  verified: boolean;
  overall_rating: number;
  culture_rating: number;
  management_rating: number;
  compensation_rating: number;
  review_count: number;
  created_at: string;
}

export interface Review {
  id: string;
  company_id: string;
  user_id?: string;
  is_anonymous: boolean;
  author_title: string;
  rating: number;
  culture_score?: number;
  management_score?: number;
  compensation_score?: number;
  salary_amount?: number;
  pros: string;
  cons: string;
  comment: string;
  image_url?: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  review_id: string;
  user_id?: string;
  author_title: string;
  content: string;
  upvotes: number;
  created_at: string;
}

export interface Inquiry {
  id: string;
  company_name: string;
  question: string;
  author_title: string;
  replies_count: number;
  created_at: string;
  replies?: InquiryReply[];
}

export interface InquiryReply {
  id: string;
  inquiry_id: string;
  author_title: string;
  content: string;
  created_at: string;
}