import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Blog, ContentBlock } from '../types';
import { getBlogBySlug } from '../utils/blogStorage';
import { motion } from 'motion/react';
import { Calendar, User, ChevronLeft, Loader2 } from 'lucide-react';

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) return;
      try {
        const data = await getBlogBySlug(slug);
        setBlog(data);
      } catch (error) {
        console.error('Failed to fetch blog:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[600px] gap-6">
        <Loader2 className="animate-spin text-orange-600" size={48} />
        <p className="text-gray-400 font-serif italic text-xl">Unfolding the story...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-32 px-6">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200">
          <ChevronLeft size={48} />
        </div>
        <h2 className="text-4xl font-serif italic text-gray-900 mb-4">Story not found.</h2>
        <p className="text-gray-500 mb-12 max-w-md mx-auto">The page you're looking for might have been moved or doesn't exist anymore.</p>
        <Link to="/" className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-gray-100">
          Return to Library
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-6 pb-32"
    >
      <div className="pt-12 mb-16">
        <Link 
          to="/" 
          className="inline-flex items-center gap-3 text-gray-400 hover:text-gray-900 transition-all font-medium group"
        >
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all">
            <ChevronLeft size={20} />
          </div>
          Back to Stories
        </Link>
      </div>

      <header className="mb-20 text-center space-y-8">
        <div className="flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold text-orange-600">
          <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
          <span>By {blog.author}</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-light text-gray-900 leading-[1.1] tracking-tight">
          {blog.title}
        </h1>
        <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full opacity-30" />
      </header>

      {blog.coverImage && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full aspect-[16/9] rounded-[3rem] overflow-hidden mb-20 shadow-2xl shadow-gray-200"
        >
          <img 
            src={blog.coverImage} 
            alt={blog.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </motion.div>
      )}

      <article className="max-w-3xl mx-auto space-y-12">
        {Array.isArray(blog.content) ? (
          blog.content.map((block: ContentBlock) => (
            <div key={block.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {block.type === 'heading' && (
                block.level === 2 ? (
                  <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mt-16 mb-8 leading-tight">
                    {block.text}
                  </h2>
                ) : (
                  <h3 className="text-2xl md:text-3xl font-serif font-medium text-gray-900 mt-12 mb-6 leading-tight">
                    {block.text}
                  </h3>
                )
              )}
              
              {block.type === 'paragraph' && (
                <p className="text-xl md:text-2xl text-gray-600 leading-[1.8] font-light mb-8">
                  {block.text}
                </p>
              )}
              
              {block.type === 'image' && (
                <figure className="my-16 space-y-6">
                  <div className="rounded-[2rem] overflow-hidden shadow-xl border border-gray-100">
                    <img 
                      src={block.url} 
                      alt={block.caption || ''} 
                      className="w-full h-auto object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                  {block.caption && (
                    <figcaption className="text-center text-sm text-gray-400 italic font-serif">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              )}
              
              {block.type === 'interlink' && (
                <a 
                  href={block.url} 
                  className="block p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:border-orange-200 hover:bg-white hover:shadow-xl transition-all group my-12"
                >
                  <span className="text-[10px] uppercase tracking-[0.2em] text-orange-600 font-bold mb-3 block">Recommended Reading</span>
                  <span className="text-2xl font-serif text-gray-900 group-hover:text-orange-600 transition-colors block leading-tight">
                    {block.title} <span className="inline-block group-hover:translate-x-2 transition-transform">→</span>
                  </span>
                </a>
              )}
              
              {block.type === 'rich-text' && (
                <div 
                  className="prose prose-xl md:prose-2xl prose-orange max-w-none font-light text-gray-700 leading-[1.8] mb-12"
                  dangerouslySetInnerHTML={{ __html: block.html || '' }}
                />
              )}
              
              {block.type === 'footer' && (
                <div className="mt-24 pt-16 border-t border-gray-100 text-center space-y-8">
                  {block.footerImage && (
                    <img 
                      src={block.footerImage} 
                      alt="Author" 
                      className="w-24 h-24 mx-auto rounded-full object-cover shadow-lg border-4 border-white" 
                    />
                  )}
                  <div className="space-y-4">
                    {block.footerText && (
                      <p className="text-gray-500 font-serif italic text-xl max-w-xl mx-auto leading-relaxed">
                        "{block.footerText}"
                      </p>
                    )}
                    {block.footerLink && (
                      <a 
                        href={block.footerLink} 
                        className="inline-flex items-center gap-2 text-orange-600 font-bold border-b-2 border-orange-600 pb-1 hover:text-orange-700 hover:border-orange-700 transition-all"
                      >
                        Learn More About This Story
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div 
            className="prose prose-xl prose-orange max-w-none font-light text-gray-700 leading-[1.8]"
            dangerouslySetInnerHTML={{ __html: String(blog.content) }}
          />
        )}
      </article>
      
      <footer className="mt-32 pt-16 border-t border-gray-100">
        <div className="bg-gray-900 p-12 md:p-20 rounded-[4rem] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
          </div>
          
          <div className="relative z-10 space-y-8">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white font-serif text-2xl mx-auto mb-8">
              T
            </div>
            <h3 className="font-serif text-4xl md:text-5xl text-white mb-6">Join the Texly Circle</h3>
            <p className="text-gray-400 font-light text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Subscribe to our newsletter for a curated selection of stories delivered directly to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mt-12">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
              <button className="px-10 py-5 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/20">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
