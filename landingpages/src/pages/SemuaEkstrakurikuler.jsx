import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, X, BookOpen, Sparkles, Award } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function SemuaEkstrakurikuler() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchItems = async () => {
      try {
        const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        const API_BASE_URL = rawApiUrl.replace(/\/$/, "");
        const apiKey = import.meta.env.VITE_API_KEY || "smansa-secure-key-2026";

        const res = await axios.get(`${API_BASE_URL}/api/public/extracurriculars`, {
          headers: { "x-api-key": apiKey },
        });
        if (res.data) {
          const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data.data) ? res.data.data : []);
          setItems(data);
        }
      } catch (error) {
        console.error("Error fetching extracurriculars:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, []);

  const imageUrl = (img) => {
    if (!img) return "https://placehold.co/600x400?text=Ekstrakurikuler";
    const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const API_BASE_URL = rawApiUrl.replace(/\/$/, "");

    if (/^https?:\/\//.test(img)) {
      if (img.includes('/storage/')) {
        const pathAfterStorage = img.split('/storage/')[1];
        return `${API_BASE_URL}/storage/${pathAfterStorage}`;
      }
      return img;
    }

    const cleanPath = img.replace(/^\/+/, '').replace(/^storage\//, '');
    return `${API_BASE_URL}/storage/${cleanPath}`;
  };

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pt-24 pb-20">
      <SEO
        title="Daftar Lengkap Ekstrakurikuler - SMAN 1 Pamekasan"
        description="Jelajahi seluruh kegiatan ekstrakurikuler SMAN 1 Pamekasan. Wadah pengembangan minat, bakat, kepemimpinan, dan prestasi siswa."
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Top Header & Breadcrumb */}
        <div className="mb-10">
          <Link
            to="/#ekstrakurikuler"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-all duration-300 mb-6 border border-blue-100 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100 mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Direktori Ekskul SMANSA
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-smansa-navy tracking-tight mb-3">
                Seluruh Ekstrakurikuler
              </h1>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                Temukan wadah terbaik untuk mengembangkan minat, bakat, kepemimpinan, dan prestasi di SMAN 1 Pamekasan.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3 bg-slate-100/80 px-5 py-3 rounded-2xl border border-slate-200">
              <Award className="w-6 h-6 text-smansa-gold" />
              <div>
                <span className="block text-2xl font-black text-smansa-navy leading-none">{items.length}</span>
                <span className="text-xs font-semibold text-slate-500">Total Ekstrakurikuler</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Filter Bar */}
        <div className="mb-12">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ekstrakurikuler (contoh: Basket, Pramuka, Robotik)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-4 rounded-2xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main Items Grid */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-500">Memuat seluruh data ekstrakurikuler...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto my-12 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">Tidak Ditemukan</h3>
            <p className="text-slate-500 text-sm mb-6">
              Tidak ada ekstrakurikuler yang cocok dengan kata kunci "{searchQuery}".
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs transition-all"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, i) => (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                onClick={() => setSelectedItem(item)}
                className="bg-white rounded-[1.75rem] border border-slate-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.015)] hover:shadow-[0_20px_45px_rgba(37,99,235,0.09)] hover:border-blue-300 transition-all duration-500 hover:-translate-y-1.5 overflow-hidden flex flex-col group cursor-pointer"
              >
                <div className="aspect-16/10 w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={imageUrl(item.image_path)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/600x400?text=Ekstrakurikuler";
                    }}
                  />
                </div>
                <div className="p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-smansa-navy mb-3 tracking-tight group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-slate-600 leading-relaxed text-sm line-clamp-3 mb-4">{item.description}</p>
                    )}
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                    <span>Lihat Deskripsi Lengkap</span>
                    <span className="w-7 h-7 rounded-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all">
                      →
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Detail Ekstrakurikuler */}
      <AnimatePresence>
        {selectedItem && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-950/60 backdrop-blur-md"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Image */}
              <div className="relative aspect-16/9 w-full bg-slate-900 overflow-hidden shrink-0">
                <img
                  src={imageUrl(selectedItem.image_path)}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/600x400?text=Ekstrakurikuler";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-6 md:p-8">
                  <span className="text-xs font-bold tracking-wider text-blue-300 uppercase mb-1">
                    Ekstrakurikuler SMAN 1 Pamekasan
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    {selectedItem.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 bg-slate-900/60 hover:bg-slate-900 text-white w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md"
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content Body */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" /> Deskripsi Lengkap Ekstrakurikuler
                </h4>
                <div className="text-slate-700 leading-relaxed text-base whitespace-pre-line bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  {selectedItem.description || "Belum ada deskripsi detail untuk ekstrakurikuler ini."}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-6 py-2.5 bg-smansa-navy hover:bg-blue-900 text-white font-bold rounded-full text-sm shadow-md transition-all"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
