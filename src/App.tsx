import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import BlogList from './components/BlogList';
import BlogDetail from './components/BlogDetail';
import AdminPanel from './components/AdminPanel';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={
            <div className="text-center py-32 px-6">
              <h1 className="text-8xl font-serif font-light mb-6 text-gray-200">404</h1>
              <p className="text-gray-500 italic font-serif text-2xl mb-12">The page you are looking for has vanished into thin air.</p>
              <Link to="/" className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-gray-100">
                Return to Library
              </Link>
            </div>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}
