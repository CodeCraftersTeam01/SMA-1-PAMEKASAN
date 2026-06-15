import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SkeletonLoader = () => (
  <div className="pt-24 pb-20 bg-gray-50 min-h-screen animate-pulse">
    <div className="bg-gradient-to-br from-blue-900 to-blue-800 py-16 mb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-10 bg-white/20 rounded-xl w-2/3 mb-5"></div>
        <div className="h-1.5 bg-blue-500/50 rounded-full w-20"></div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm">
            <div className="space-y-4">
              <div className="h-5 bg-gray-100 rounded-lg w-full"></div>
              <div className="h-5 bg-gray-100 rounded-lg w-5/6"></div>
              <div className="h-5 bg-gray-100 rounded-lg w-4/5"></div>
              <div className="h-40 bg-gray-100 rounded-xl w-full mt-6"></div>
            </div>
          </div>
        </div>
        <div className="lg:w-1/3">
          <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
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
          headers: { 'x-api-key': import.meta.env.VITE_API_KEY || 'smansa123' },
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
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPage();
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
    return () => controller.abort();
  }, [slug]);

  if (loading || !pageData) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Oops!</h1>
        <p className="text-gray-500 mb-8 max-w-sm">{error}</p>
        <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">← Kembali ke Beranda</Link>
      </div>
    );
  }

  const quickLinks = [
    { title: 'Informasi PPDB', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', url: '/p/ppdb' },
    { title: 'E-Rapor Siswa', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', url: '#' },
    { title: 'Portal Admin', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z', url: '/dashboard' },
    { title: 'Hubungi Kami', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', url: '#kontak' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="pt-24 pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-smansa-navy via-blue-900 to-indigo-900 text-white py-16 mb-12 relative overflow-hidden shadow-lg border-b-4 border-smansa-gold">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link to="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-6 transition-colors font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Kembali ke Beranda
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight leading-tight">{pageData.title}</h1>
            <div className="w-24 h-1.5 bg-smansa-gold rounded-full"></div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Content */}
          <div className="lg:w-2/3">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 prose prose-lg prose-blue max-w-none prose-img:rounded-2xl prose-img:shadow-md prose-headings:text-smansa-navy prose-a:text-blue-600 hover:prose-a:text-blue-800 text-gray-700" dangerouslySetInnerHTML={{ __html: pageData.content }} />
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-32 space-y-8">
              
              {/* Quick Links Menu */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-1.5 h-6 bg-smansa-gold rounded-full"></div>
                  <h3 className="text-xl font-bold text-smansa-navy">Aksi Cepat</h3>
                </div>
                <div className="space-y-3">
                  {quickLinks.map((link, idx) => (
                    <Link key={idx} to={link.url} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50 group transition-colors border border-transparent hover:border-blue-100">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} /></svg>
                      </div>
                      <span className="font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">{link.title}</span>
                      <svg className="w-4 h-4 ml-auto text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Info Widget */}
              <div className="bg-gradient-to-br from-smansa-navy to-blue-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <h4 className="text-2xl font-bold mb-3 relative z-10 text-smansa-gold">Butuh Bantuan?</h4>
                <p className="text-blue-100 text-sm mb-6 relative z-10 leading-relaxed">Jika Anda memiliki pertanyaan terkait sistem akademik atau pendaftaran, tim layanan kami siap membantu Anda.</p>
                <div className="relative z-10 bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
                  <p className="text-xs text-blue-200 mb-1">Email Resmi</p>
                  <p className="font-semibold text-white">info@sman1pamekasan.sch.id</p>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </motion.div>
  );
}
