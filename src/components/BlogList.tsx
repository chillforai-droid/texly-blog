import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Blog } from '../types';
import { getBlogs } from '../utils/blogStorage';
import { motion } from 'motion/react';
import { Calendar, User, ArrowRight, ImageIcon, Loader2, LayoutDashboard } from 'lucide-react';

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // Only fetch published blogs for the public feed
        const data = await getBlogs('published');
        setBlogs(data);
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
        <Loader2 className="animate-spin text-orange-600" size={40} />
        <p className="text-gray-400 font-serif italic">Curating stories for you...</p>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-serif italic text-gray-900 mb-4">The library is quiet.</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-10">We're currently preparing new stories. Please check back soon for fresh insights from Texly.</p>
        <Link 
          to="/admin" 
          className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-gray-200"
        >
          <LayoutDashboard size={20} />
          Go to Admin Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto px-6">
      {blogs.map((blog, index) => (
        <motion.article
          key={blog.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index % 2 * 0.1, duration: 0.8 }}
          className="group flex flex-col bg-white rounded-[3rem] overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-[0_32px_64px_-12px_rgba(255,99,33,0.1)] transition-all duration-700"
        >
          <Link to={`/blog/${blog.slug}`} className="aspect-[16/10] overflow-hidden bg-gray-50 relative block">
            {blog.coverImage ? (
              <img 
                src={blog.coverImage} 
                alt={blog.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                <ImageIcon size={64} strokeWidth={1} />
              </div>
            )}
            <div className="absolute top-8 left-8">
              <div className="px-5 py-2.5 bg-white/90 backdrop-blur-xl rounded-2xl text-[10px] uppercase tracking-[0.3em] font-bold text-gray-900 shadow-xl shadow-black/5">
                {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </Link>
          
          <div className="p-10 md:p-12 flex-1 flex flex-col">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-orange-600 mb-6 font-bold">
              <span className="w-8 h-[1px] bg-orange-200" />
              {blog.author}
            </div>
            
            <Link to={`/blog/${blog.slug}`}>
              <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 group-hover:text-orange-600 transition-colors mb-6 leading-[1.2] tracking-tight">
                {blog.title}
              </h2>
            </Link>
            
            <p className="text-gray-500 font-light leading-relaxed mb-10 line-clamp-3 flex-1 text-lg">
              {blog.excerpt}
            </p>
            
            <Link 
              to={`/blog/${blog.slug}`}
              className="inline-flex items-center gap-3 text-gray-900 font-bold text-sm group/btn"
            >
              <span className="border-b-2 border-orange-500 pb-1 group-hover/btn:border-gray-900 transition-all">Read Full Story</span>
              <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform text-orange-600" />
            </Link>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
