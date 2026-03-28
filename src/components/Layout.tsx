import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X as CloseIcon, LayoutDashboard, BookOpen } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdminPage = location.pathname.startsWith('/admin');

  const navLinks = [
    { to: '/', label: 'Stories', icon: BookOpen },
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-[60] bg-[#FDFCFB]/80 backdrop-blur-xl border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-serif text-3xl group-hover:bg-orange-600 transition-all duration-500 group-hover:rotate-6 shadow-lg shadow-gray-200">
              T
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-serif font-medium tracking-tight leading-none">Texly</span>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-orange-600 mt-1">
                {isAdminPage ? 'Admin Studio' : 'Digital Journal'}
              </span>
            </div>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className={`text-xs uppercase tracking-[0.2em] font-bold transition-all relative group ${
                  location.pathname === link.to ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-2 left-0 h-0.5 bg-orange-500 transition-all ${
                  location.pathname === link.to ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-3 bg-gray-50 rounded-2xl text-gray-600 hover:text-gray-900 transition-all"
          >
            {isMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-24 left-0 w-full bg-white border-b border-gray-100 shadow-2xl animate-in slide-in-from-top duration-300 z-50">
            <div className="p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-4 p-5 rounded-2xl font-bold transition-all ${
                    location.pathname === link.to ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  <link.icon size={20} />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-6 py-16 md:py-24 ${isAdminPage ? 'min-h-[80vh]' : ''}`}>
        {children}
      </main>

      {/* Footer */}
      {!isAdminPage && (
        <footer className="bg-gray-900 text-white py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif font-light mb-6 leading-tight">
                  Stay updated with our latest stories.
                </h2>
                <p className="text-gray-400 font-light text-lg mb-8 max-w-md">
                  Join 10,000+ readers who receive our weekly insights on design, culture, and technology.
                </p>
                <form className="flex gap-4 max-w-md">
                  <input 
                    type="email" 
                    placeholder="email@example.com" 
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 transition-colors"
                  />
                  <button className="px-8 py-4 bg-orange-600 rounded-2xl font-medium hover:bg-orange-700 transition-all">
                    Join
                  </button>
                </form>
              </div>
              <div className="grid grid-cols-2 gap-8 md:justify-items-end">
                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-widest text-gray-500 font-medium">Platform</h4>
                  <ul className="space-y-2 text-gray-400 font-light">
                    <li><Link to="/" className="hover:text-white transition-colors">Stories</Link></li>
                    <li><Link to="/admin" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
                    <li><a href="#" className="hover:text-white transition-colors">Authors</a></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-widest text-gray-500 font-medium">Company</h4>
                  <ul className="space-y-2 text-gray-400 font-light">
                    <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-light">
              <p>© 2026 Texly Media. All rights reserved.</p>
              <div className="flex gap-8">
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
                <a href="#" className="hover:text-white transition-colors">Instagram</a>
                <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
