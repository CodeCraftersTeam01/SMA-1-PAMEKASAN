import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function DynamicPage() {
  const { slug } = useParams();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/public/pages/${slug}`, {
          headers: {
            'x-api-key': 'smansa-pamekasan-key-2026'
          }
        });
        if (response.ok) {
          setPageData(await response.json());
        } else if (response.status === 404) {
          setError('Halaman tidak ditemukan');
        } else {
          setError('Terjadi kesalahan saat memuat halaman');
        }
      } catch (err) {
        setError('Gagal terhubung ke server');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Oops!</h1>
        <p className="text-gray-600 mb-8">{error}</p>
        <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-lg shadow-blue-500/30">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      {/* Header Halaman */}
      <div className="bg-blue-900 text-white py-16 mb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-up">{pageData.title}</h1>
          <div className="w-20 h-1.5 bg-blue-500 rounded-full animate-fade-up delay-100"></div>
        </div>
      </div>

      {/* Konten Halaman */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div 
          className="bg-white rounded-2xl p-8 sm:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.04)] prose prose-blue max-w-none prose-img:rounded-xl prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: pageData.content }}
        />
      </div>
    </div>
  );
}
