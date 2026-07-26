import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const stripHtml = (html) => {
  if (!html) return '';
  const text = html.replace(/<[^>]*>/g, '');
  return text.length > 155 ? text.substring(0, 155) + '...' : text;
};

const SkeletonLoader = () => (
  <div className="pt-24 pb-20 bg-gray-50 min-h-screen animate-pulse">
    <div className="bg-white py-10 mb-12 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-4 bg-gray-200 rounded-lg w-24 mb-6"></div>
        <div className="h-10 bg-gray-200 rounded-xl w-3/4 mb-5"></div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:w-2/3">
          <div className="h-64 sm:h-96 bg-gray-200 rounded-2xl w-full mb-8"></div>
          <div className="space-y-4">
            <div className="h-5 bg-gray-200 rounded-lg w-full"></div>
            <div className="h-5 bg-gray-200 rounded-lg w-5/6"></div>
            <div className="h-5 bg-gray-200 rounded-lg w-4/5"></div>
          </div>
        </div>
        <div className="lg:w-1/3 space-y-6">
          <div className="h-8 bg-gray-200 rounded-lg w-1/2 mb-6"></div>
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function NewsDetail() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [recentNews, setRecentNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        
        // Fetch specific news and recent news in parallel
        const [newsRes, recentRes] = await Promise.all([
          fetch(`${baseUrl}/api/public/news/${id}`, { headers: { 'x-api-key': import.meta.env.VITE_API_KEY || 'smansa123' }, signal: controller.signal }),
          fetch(`${baseUrl}/api/public/news`, { headers: { 'x-api-key': import.meta.env.VITE_API_KEY || 'smansa123' }, signal: controller.signal })
        ]);

        if (newsRes.ok) {
          const res = await newsRes.json();
          if (res.success && res.data) setNews(res.data);
          else setError('Berita tidak ditemukan');
        } else if (newsRes.status === 404) {
          setError('Berita tidak ditemukan');
        } else {
          setError('Terjadi kesalahan saat memuat berita');
        }

        if (recentRes.ok) {
          const rRes = await recentRes.json();
          // Filter out the current news from recent list
          if (rRes.success && rRes.data) {
             setRecentNews(rRes.data.filter(n => n.id !== parseInt(id)).slice(0, 5));
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') setError('Gagal terhubung ke server');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    // Scroll to top when ID changes
    window.scrollTo(0, 0);
    return () => controller.abort();
  }, [id]);

  if (loading || !news) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Oops!</h1>
        <p className="text-gray-500 mb-8">{error}</p>
        <Link to="/#berita" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">← Kembali</Link>
      </div>
    );
  }

  const STORAGE_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api/public', '') + '/storage';
  const imgUrl = news.image_url 
    ? (news.image_url.startsWith('http://') || news.image_url.startsWith('https://') 
        ? news.image_url 
        : `${STORAGE_BASE}/${news.image_url}`) 
    : "https://images.unsplash.com/photo-1546410531-b4c69811dc31?q=80&w=1200&auto=format&fit=crop";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <SEO 
        title={news.title}
        description={stripHtml(news.content)}
        keywords={`berita SMAN 1 Pamekasan, SMANSA Pamekasan, ${news.category || 'Berita'}, ${news.title}`}
        image={imgUrl}
      />
      <div className="bg-white py-10 mb-8 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Link to="/#berita" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-semibold mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Indeks Berita
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">{news.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{news.category || 'Berita Sekolah'}</span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {news.published_at ? news.published_at.split(' ')[0] : 'Baru saja'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Article Section */}
          <div className="lg:w-2/3">
            <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden mb-8 shadow-md relative group">
              <img src={imgUrl} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100 prose prose-lg prose-blue max-w-none text-gray-700 prose-img:rounded-xl prose-headings:text-gray-900" dangerouslySetInnerHTML={{ __html: news.content }} />
          </div>

          {/* Sidebar Section */}
          <div className="lg:w-1/3">
            <div className="sticky top-32">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-900">Berita Terkini</h3>
                </div>
                
                <div className="space-y-6">
                  {recentNews.map((item, idx) => {
                    const itemImg = item.image_url 
                      ? (item.image_url.startsWith('http://') || item.image_url.startsWith('https://') 
                          ? item.image_url 
                          : `${STORAGE_BASE}/${item.image_url}`) 
                      : "https://images.unsplash.com/photo-1546410531-b4c69811dc31?q=80&w=300&auto=format&fit=crop";
                    return (
                      <Link to={`/berita/${item.id}`} key={idx} className="group flex gap-4 items-start">
                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 relative shadow-sm">
                          <img src={itemImg} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{item.category || 'Berita'}</span>
                          <h4 className="text-sm font-bold text-gray-800 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mt-1 mb-2">
                            {item.title}
                          </h4>
                          <span className="text-xs text-gray-400 font-medium">
                            {item.published_at ? item.published_at.split(' ')[0] : 'Baru saja'}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                  {recentNews.length === 0 && (
                     <p className="text-gray-500 text-sm italic">Belum ada berita lainnya.</p>
                  )}
                </div>
              </div>

              {/* Promo / Banner in Sidebar */}
              <div className="mt-8 bg-gradient-to-br from-smansa-navy to-blue-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                <h4 className="text-xl font-bold mb-2 relative z-10">Penerimaan Siswa Baru</h4>
                <p className="text-blue-100 text-sm mb-4 relative z-10">Daftarkan diri Anda sekarang dan jadilah bagian dari generasi cerdas SMAN 1 Pamekasan.</p>
                <a href={`${import.meta.env.VITE_FRONTEND_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5173' : window.location.origin)}/dashboard`} className="inline-block bg-smansa-gold text-smansa-navy font-bold text-sm px-5 py-2.5 rounded-full hover:bg-yellow-400 transition-colors relative z-10">Daftar Sekarang</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
