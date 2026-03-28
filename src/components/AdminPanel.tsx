import React, { useState, useEffect } from 'react';
import { Blog, ContentBlock } from '../types';
import { getBlogs, saveBlog, deleteBlog, generateSlug, supabase } from '../utils/blogStorage';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, LogOut, Save, X, Eye, Edit3, CheckCircle2, AlertCircle, Loader2, User, Lock, Link as LinkIcon, Globe, Settings, Image as ImageIcon } from 'lucide-react';
import Editor from './Editor';

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Partial<Blog>>({
    title: '',
    content: [],
    author: 'Texly',
    coverImage: '',
    metaDescription: '',
    keywords: '',
    status: 'draft'
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) fetchBlogs();
  }, [user]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await getBlogs();
      setBlogs(data);
    } catch (error) {
      showNotification('error', 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return showNotification('error', 'Supabase not configured');
    setActionLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showNotification('success', 'Welcome back, Texly');
    } catch (error: any) {
      showNotification('error', error.message || 'Login failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      showNotification('success', 'Logged out successfully');
    }
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Default title if empty
    const blogToSave = {
      ...currentBlog,
      title: currentBlog.title?.trim() || 'Untitled Story'
    };

    setActionLoading(true);
    try {
      await saveBlog(blogToSave);
      showNotification('success', currentBlog.id ? 'Story updated' : 'Story published');
      setIsEditing(false);
      fetchBlogs();
    } catch (error: any) {
      console.error('Save error:', error);
      showNotification('error', error.message || 'Failed to save story');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // window.confirm often fails in iframes, so we'll do a direct delete for now
    // or you can add a custom modal later.
    setActionLoading(true);
    try {
      await deleteBlog(id);
      showNotification('success', 'Story deleted');
      fetchBlogs();
    } catch (error: any) {
      console.error('Delete error:', error);
      showNotification('error', error.message || 'Failed to delete story');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB] gap-4">
        <Loader2 className="animate-spin text-orange-600" size={48} />
        <p className="text-gray-400 font-serif italic">Verifying credentials...</p>
      </div>
    );
  }

  if (!user) {
    // ... login form ...
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100"
        >
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gray-900 rounded-3xl flex items-center justify-center text-white font-serif text-4xl mx-auto mb-8 shadow-xl shadow-gray-200">
              T
            </div>
            <h1 className="text-4xl font-serif font-light mb-3">Texly Admin</h1>
            <p className="text-gray-400 text-sm tracking-[0.2em] uppercase font-medium">Secure Portal</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  placeholder="Admin Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-5 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-orange-600 transition-all active:scale-[0.98] shadow-lg shadow-gray-200 flex items-center justify-center gap-3"
            >
              {actionLoading ? <Loader2 className="animate-spin" /> : 'Sign In to Dashboard'}
            </button>
          </form>
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${
                  message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 md:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-light tracking-tight mb-2">Editor's Studio</h1>
          <div className="flex items-center gap-3 text-gray-400 font-light">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Logged in as <span className="font-medium text-gray-600">{user.email}</span>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={() => {
              setIsEditing(true);
              setCurrentBlog({ 
                title: '', 
                content: [], 
                author: 'Texly', 
                coverImage: '', 
                metaDescription: '', 
                keywords: '', 
                status: 'draft' 
              });
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-orange-600 text-white rounded-2xl font-semibold hover:bg-orange-700 transition-all shadow-xl shadow-orange-100"
          >
            <Plus size={22} /> New Story
          </button>
          <button
            onClick={handleLogout}
            className="p-4 bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 rounded-2xl transition-all shadow-sm"
            title="Logout"
          >
            <LogOut size={24} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`fixed top-12 right-12 z-[100] p-5 rounded-3xl shadow-2xl flex items-center gap-4 min-w-[320px] backdrop-blur-xl ${
              message.type === 'success' ? 'bg-gray-900/95 text-white' : 'bg-red-600/95 text-white'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-white/20 text-white'
            }`}>
              {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <span className="font-semibold tracking-wide">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {isEditing ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 md:p-12 rounded-[3rem] border border-gray-100 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <h2 className="text-3xl font-serif italic text-gray-800">
              {currentBlog.id ? 'Refine Story' : 'Compose New Story'}
            </h2>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                onClick={() => setShowPreview(!showPreview)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${showPreview ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              >
                <Eye size={18} /> {showPreview ? 'Edit Mode' : 'Live Preview'}
              </button>
              <button 
                onClick={() => setIsEditing(false)} 
                className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          
          <form 
            onSubmit={handleSave} 
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA' && !(e.target as HTMLElement).classList.contains('ql-editor')) {
                if ((e.target as HTMLElement).tagName === 'INPUT') {
                  e.preventDefault();
                }
              }
            }}
            className="space-y-12"
          >
            {!showPreview ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-10">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] font-bold text-gray-400 mb-4">Story Title</label>
                    <input
                      type="text"
                      value={currentBlog.title}
                      onChange={(e) => setCurrentBlog({ ...currentBlog, title: e.target.value })}
                      className="w-full px-0 py-4 bg-transparent border-b-2 border-gray-100 focus:border-orange-500 transition-all outline-none text-4xl font-serif placeholder:text-gray-200"
                      placeholder="The Art of Modern Living..."
                    />
                  </div>

                  <Editor 
                    content={currentBlog.content || []} 
                    onChange={(content) => setCurrentBlog({ ...currentBlog, content })} 
                  />
                </div>

                <div className="space-y-8">
                  <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 space-y-6">
                    <div>
                      <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-gray-400 mb-4">
                        <Globe size={14} /> Publication Status
                      </label>
                      <div className="flex p-1 bg-white rounded-2xl border border-gray-100">
                        <button 
                          type="button"
                          onClick={() => setCurrentBlog({ ...currentBlog, status: 'draft' })}
                          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${currentBlog.status === 'draft' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          Draft
                        </button>
                        <button 
                          type="button"
                          onClick={() => setCurrentBlog({ ...currentBlog, status: 'published' })}
                          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${currentBlog.status === 'published' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          Publish
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] font-bold text-gray-400 mb-4">Cover Image URL</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                          type="url"
                          value={currentBlog.coverImage}
                          onChange={(e) => setCurrentBlog({ ...currentBlog, coverImage: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl text-sm outline-none shadow-sm focus:ring-2 focus:ring-orange-500 transition-all"
                        />
                      </div>
                      {currentBlog.coverImage && (
                        <div className="mt-4 aspect-video rounded-2xl overflow-hidden border border-gray-100">
                          <img src={currentBlog.coverImage} alt="Cover" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 space-y-6">
                    <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-gray-400">
                      <Settings size={14} /> SEO & Metadata
                    </label>
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Slug</span>
                        <input 
                          type="text" 
                          value={currentBlog.slug || generateSlug(currentBlog.title || '')}
                          onChange={(e) => setCurrentBlog({ ...currentBlog, slug: e.target.value })}
                          className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs font-mono text-gray-600 outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Meta Description</span>
                        <textarea 
                          value={currentBlog.metaDescription}
                          onChange={(e) => setCurrentBlog({ ...currentBlog, metaDescription: e.target.value })}
                          placeholder="Brief summary for search engines..."
                          className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs text-gray-600 outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px] resize-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Keywords</span>
                        <input 
                          type="text" 
                          value={currentBlog.keywords}
                          onChange={(e) => setCurrentBlog({ ...currentBlog, keywords: e.target.value })}
                          placeholder="design, tech, lifestyle..."
                          className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs text-gray-600 outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-12 pb-20">
                <div className="space-y-6 text-center">
                  <h1 className="text-5xl md:text-6xl font-serif font-light leading-tight">{currentBlog.title || 'Untitled Story'}</h1>
                  <div className="flex items-center justify-center gap-4 text-gray-400 uppercase tracking-[0.2em] text-[10px] font-bold">
                    <span>By {currentBlog.author}</span>
                    <span>•</span>
                    <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
                {currentBlog.coverImage && (
                  <img src={currentBlog.coverImage} alt="Cover" className="w-full aspect-[16/9] object-cover rounded-[2.5rem] shadow-2xl" />
                )}
                <div className="space-y-8">
                  {currentBlog.content?.map((block) => (
                    <div key={block.id}>
                      {block.type === 'heading' && (
                        block.level === 2 ? <h2 className="text-3xl font-serif mt-12 mb-6">{block.text}</h2> : <h3 className="text-2xl font-serif mt-8 mb-4">{block.text}</h3>
                      )}
                      {block.type === 'paragraph' && <p className="text-xl text-gray-600 leading-relaxed font-light">{block.text}</p>}
                      {block.type === 'image' && (
                        <figure className="my-12 space-y-4">
                          <img src={block.url} alt={block.caption} className="w-full rounded-3xl shadow-lg" />
                          {block.caption && <figcaption className="text-center text-sm text-gray-400 italic">{block.caption}</figcaption>}
                        </figure>
                      )}
                      {block.type === 'interlink' && (
                        <a href={block.url} className="block p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:border-orange-200 transition-all group">
                          <span className="text-[10px] uppercase tracking-widest text-orange-600 font-bold mb-2 block">Read More</span>
                          <span className="text-xl font-serif group-hover:text-orange-600 transition-colors">{block.title} →</span>
                        </a>
                      )}
                      {block.type === 'rich-text' && <div className="prose prose-xl max-w-none prose-orange" dangerouslySetInnerHTML={{ __html: block.html || '' }} />}
                      {block.type === 'footer' && (
                        <div className="mt-20 pt-12 border-t border-gray-100 text-center space-y-6">
                          {block.footerImage && <img src={block.footerImage} alt="Footer" className="w-20 h-20 mx-auto rounded-full object-cover" />}
                          {block.footerText && <p className="text-gray-500 font-light italic">{block.footerText}</p>}
                          {block.footerLink && <a href={block.footerLink} className="inline-block text-orange-600 font-bold border-b-2 border-orange-600 pb-1">Learn More</a>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-end gap-6 pt-10 border-t border-gray-50">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-10 py-5 text-gray-500 hover:text-gray-900 font-semibold transition-colors order-2 md:order-1"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex items-center justify-center gap-3 px-14 py-5 bg-gray-900 text-white rounded-[1.5rem] font-bold hover:bg-orange-600 transition-all disabled:opacity-50 shadow-2xl shadow-gray-200 order-1 md:order-2"
              >
                {actionLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <><Save size={22} /> {currentBlog.status === 'published' ? 'Publish Story' : 'Save Draft'}</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="space-y-12">
          <div className="flex items-center justify-between px-6">
            <h2 className="text-2xl font-serif italic text-gray-400">Recent Publications</h2>
            <div className="text-sm text-gray-400 font-medium">{blogs.length} Stories Total</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full py-32 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-orange-600" size={48} />
                <p className="text-gray-400 font-serif italic">Gathering your archives...</p>
              </div>
            ) : blogs.length === 0 ? (
              <div className="col-span-full py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 text-center">
                <p className="text-gray-400 font-serif italic text-xl">The library is currently empty.</p>
                <button onClick={() => setIsEditing(true)} className="mt-6 text-orange-600 font-bold hover:underline">Write your first story →</button>
              </div>
            ) : (
              blogs.map((blog) => (
                <motion.div
                  layout
                  key={blog.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500"
                >
                  <div className="aspect-[16/10] overflow-hidden relative">
                    {blog.coverImage ? (
                      <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200">
                        <ImageIcon size={48} />
                      </div>
                    )}
                    <div className="absolute top-6 right-6">
                      <span className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg ${blog.status === 'published' ? 'bg-green-500 text-white' : 'bg-gray-900 text-white'}`}>
                        {blog.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 space-y-4">
                    <h3 className="text-2xl font-serif line-clamp-2 group-hover:text-orange-600 transition-colors">{blog.title}</h3>
                    <p className="text-gray-400 text-sm font-light line-clamp-3 leading-relaxed">{blog.excerpt}</p>
                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setCurrentBlog(blog);
                            setIsEditing(true);
                          }}
                          className="p-3 bg-gray-50 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(blog.id)}
                          className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <a 
                        href={`/blog/${blog.slug}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                      >
                        <Eye size={18} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
