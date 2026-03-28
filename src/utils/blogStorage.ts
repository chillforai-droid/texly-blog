import { createClient } from '@supabase/supabase-js';
import { Blog, SupabaseBlog, ContentBlock } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Robust initialization
export const supabase = (() => {
  try {
    if (supabaseUrl && supabaseAnonKey) {
      return createClient(supabaseUrl, supabaseAnonKey);
    }
  } catch (err) {
    console.error('Supabase initialization failed:', err);
  }
  return null;
})();

const LOCAL_STORAGE_KEY = 'texly_blogs_fallback';

// Helpers
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

const getUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Proper UUID v4 fallback for Postgres compatibility
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getExcerpt = (content: ContentBlock[], length: number = 150): string => {
  if (!content || !Array.isArray(content)) return '';
  // Try to find the first paragraph or rich-text block
  const firstParagraph = content.find(block => block.type === 'paragraph')?.text || '';
  const firstRichText = content.find(block => block.type === 'rich-text')?.html?.replace(/<[^>]*>?/gm, '') || '';
  const text = firstParagraph || firstRichText || '';
  return text.length > length ? text.substring(0, length).trim() + '...' : text.trim();
};

// Mapping functions
const mapToReact = (blog: SupabaseBlog): Blog => ({
  id: blog.id,
  title: blog.title,
  slug: blog.slug,
  content: Array.isArray(blog.content) ? blog.content : [],
  excerpt: blog.excerpt,
  author: blog.author || 'Texly',
  coverImage: blog.cover_image,
  metaDescription: blog.meta_description,
  keywords: blog.keywords,
  status: (blog.status as 'draft' | 'published') || 'published',
  createdAt: blog.created_at,
  updatedAt: blog.updated_at,
});

const mapToSupabase = (blog: Partial<Blog>): Partial<SupabaseBlog> => {
  return {
    id: blog.id,
    title: blog.title || 'Untitled',
    slug: blog.slug || generateSlug(blog.title || 'Untitled'),
    content: blog.content || [],
    excerpt: blog.excerpt || '',
    author: blog.author || 'Texly',
    cover_image: blog.coverImage || '',
    meta_description: blog.metaDescription || '',
    keywords: blog.keywords || '',
    status: blog.status || 'draft',
    created_at: blog.createdAt,
    updated_at: blog.updatedAt,
  } as any;
};

export const uploadImage = async (file: File): Promise<string | null> => {
  if (!supabase) return null;
  
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `blog-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blogs')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('blogs')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// LocalStorage Fallback Logic
const getLocalBlogs = (): Blog[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLocalBlogs = (blogs: Blog[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(blogs));
};

// Async Storage Functions
export const getBlogs = async (status?: 'draft' | 'published'): Promise<Blog[]> => {
  if (supabase) {
    try {
      let query = supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return (data as SupabaseBlog[]).map(mapToReact);
    } catch (err) {
      console.error('Supabase fetch failed, falling back to localStorage:', err);
    }
  }
  
  let localBlogs = getLocalBlogs();
  if (status) {
    localBlogs = localBlogs.filter(b => b.status === status);
  }
  return localBlogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getBlogBySlug = async (slug: string): Promise<Blog | null> => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return mapToReact(data as SupabaseBlog);
    } catch (err) {
      console.error('Supabase fetch failed, falling back to localStorage:', err);
    }
  }
  return getLocalBlogs().find(b => b.slug === slug) || null;
};

export const saveBlog = async (blog: Partial<Blog>): Promise<Blog> => {
  const now = new Date().toISOString();
  const newBlog: Blog = {
    id: blog.id || getUUID(),
    title: blog.title || 'Untitled',
    slug: blog.slug || generateSlug(blog.title || 'Untitled'),
    content: blog.content || [],
    excerpt: blog.excerpt || getExcerpt(blog.content || []),
    author: blog.author || 'Texly',
    coverImage: blog.coverImage,
    metaDescription: blog.metaDescription,
    keywords: blog.keywords,
    status: blog.status || 'published',
    createdAt: blog.createdAt || now,
    updatedAt: now,
  };

  if (supabase) {
    try {
      const sbData = mapToSupabase(newBlog);
      const { data, error } = await supabase
        .from('blogs')
        .upsert(sbData)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase upsert error:', error.message, error.details, error.hint);
        throw error; // Throwing so AdminPanel can catch and show error
      }
      return mapToReact(data as SupabaseBlog);
    } catch (err: any) {
      console.error('Supabase save failed:', err);
      // Only fallback to localStorage if it's a network error, 
      // not a permission or schema error
      if (err.message?.includes('fetch') || err.message?.includes('network')) {
        const localBlogs = getLocalBlogs();
        const index = localBlogs.findIndex(b => b.id === newBlog.id);
        if (index > -1) {
          localBlogs[index] = newBlog;
        } else {
          localBlogs.push(newBlog);
        }
        saveLocalBlogs(localBlogs);
        return newBlog;
      }
      throw err; // Re-throw database/auth errors
    }
  }
};

export const deleteBlog = async (id: string): Promise<void> => {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Supabase delete error:', error.message, error.details, error.hint);
        throw error;
      }
      return;
    } catch (err: any) {
      console.error('Supabase delete failed:', err);
      // Only fallback to localStorage if it's a network error
      if (err.message?.includes('fetch') || err.message?.includes('network')) {
        const localBlogs = getLocalBlogs().filter(b => b.id !== id);
        saveLocalBlogs(localBlogs);
        return;
      }
      throw err;
    }
  }

  const localBlogs = getLocalBlogs().filter(b => b.id !== id);
  saveLocalBlogs(localBlogs);
};
