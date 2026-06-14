import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SkeletonLoader = () => (
  <div className="pt-24 pb-20 bg-gray-50 min-h-screen animate-pulse">
    {/* Header skeleton */}
    <div className="bg-gradient-to-br from-blue-900 to-blue-800 py-16 mb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-10 bg-white/20 rounded-xl w-2/3 mb-5"></div>
        <div className="h-1.5 bg-blue-500/50 rounded-full w-20"></div>
        <div className="flex items-center gap-3 mt-6">
          <div className="h-4 bg-white/20 rounded-lg w-24"></div>
          <div className="w-1 h-1 bg-white/30 rounded-full"></div>
          <div className="h-4 bg-white/20 rounded-lg w-32"></div>
        </div>
      </div>
    </div>

    {/* Content skeleton */}
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <div className="space-y-4">
          <div className="h-5 bg-gray-100 rounded-lg w-full"></div>
          <div className="h-5 bg-gray-100 rounded-lg w-5/6"></div>
          <div className="h-5 bg-gray-100 rounded-lg w-4/5"></div>
          <div className="h-5 bg-gray-100 rounded-lg w-full"></div>
          <div className="h-5 bg-gray-100 rounded-lg w-3/4"></div>
          <div className="h-40 bg-gray-100 rounded-xl w-full mt-6"></div>
          <div className="h-5 bg-gray-100 rounded-lg w-full"></div>
          <div className="h-5 bg-gray-100 rounded-lg w-5/6"></div>
          <div className="h-5 bg-gray-100 rounded-lg w-full"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function DynamicPage() {
  const { slug } = useParams();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPage = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${baseUrl}/api/public/pages/${slug}`, {
          headers: { 'x-api-key': 'smansa123' },
          signal: controller.signal
        });
        if (response.ok) {
          setPageData(await response.json());
        } else if (response.status === 404) {
          setError('Halaman tidak ditemukan');
        } else {
          setError('Terjadi kesalahan saat memuat halaman');
        }
      } catch (err) {
        if (err.name !== 'AbortError') setError('Gagal terhubung ke server');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
    return () => controller.abort();
  }, [slug]);

  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Oops!</h1>
          <p className="text-gray-500 mb-8 max-w-sm">{error}</p>
          <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-lg shadow-blue-500/30">
            ← Kembali ke Beranda
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="pt-24 pb-20 bg-gray-50 min-h-screen"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-16 mb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-6 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Kembali ke Beranda
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{pageData.title}</h1>
            <div className="w-20 h-1.5 bg-smansa-gold rounded-full"></div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-white rounded-2xl p-8 sm:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.04)] prose prose-blue max-w-none prose-img:rounded-xl prose-img:shadow-md prose-headings:text-blue-900"
          dangerouslySetInnerHTML={{ __html: pageData.content }}
        />
      </div>
    </motion.div>
  );
}
