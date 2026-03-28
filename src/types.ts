export type BlockType = 'heading' | 'paragraph' | 'image' | 'interlink' | 'rich-text' | 'footer';

export interface ContentBlock {
  id: string;
  type: BlockType;
  text?: string;
  level?: 2 | 3;
  url?: string;
  caption?: string;
  title?: string;
  html?: string;
  footerText?: string;
  footerImage?: string;
  footerLink?: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: ContentBlock[];
  excerpt: string;
  author: string;
  coverImage?: string;
  metaDescription?: string;
  keywords?: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface SupabaseBlog {
  id: string;
  title: string;
  slug: string;
  content: any; // JSON
  excerpt: string;
  author: string;
  cover_image?: string;
  meta_description?: string;
  keywords?: string;
  status: string;
  created_at: string;
  updated_at: string;
}
