import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, BookOpen } from "lucide-react";

export default function ExtracurricularSection() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchItems = async () => {
      try {
        const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        const API_BASE_URL = rawApiUrl.replace(/\/$/, "");
        const apiKey = import.meta.env.VITE_API_KEY || "smansa-secure-key-2026";

        const res = await axios.get(`${API_BASE_URL}/api/public/extracurriculars`, {
          headers: { "x-api-key": apiKey },
        });
        if (res.data && active) {
          const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data.data) ? res.data.data : []);
          setItems(data);
        }
      } catch (error) {
        console.error("Error fetching extracurriculars:", error);
      }
    };
    fetchItems();
    return () => {
      active = false;
    };
  }, []);

  if (!items.length) return null;

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

  return (
    <section id="ekstrakurikuler" className="py-24 bg-white border-t border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="w-12 h-1 bg-smansa-gold mx-auto mb-6"></div>
          <h2 className="text-4xl font-bold text-smansa-navy mb-4 tracking-tight">Kegiatan Ekstrakurikuler</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Wadah pengembangan minat, bakat, kepemimpinan, dan potensi diri siswa di luar jam akademik.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.slice(0, 9).map((item, i) => (
            <motion.div
              key={item.id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-[1.75rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.015)] hover:shadow-[0_20px_45px_rgba(37,99,235,0.08)] hover:border-blue-300 transition-all duration-500 hover:-translate-y-1.5 overflow-hidden flex flex-col group cursor-pointer"
            >
              <div className="aspect-16/10 w-full overflow-hidden bg-gray-100 relative">
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
                <div className="pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                  <span>Lihat Deskripsi Lengkap</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Button to view all extracurriculars */}
        <div className="mt-14 text-center">
          <a
            href="/ekstrakurikuler"
            className="inline-flex items-center gap-2.5 bg-smansa-navy hover:bg-blue-900 text-white font-bold text-base px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-blue-900/20 group"
          >
            <span>Lihat Seluruh Ekstrakurikuler ({items.length} Ekskul)</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Modal Detail Ekstrakurikuler */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-950/60 backdrop-blur-md" onClick={() => setSelectedItem(null)}>
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
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{selectedItem.name}</h3>
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
    </section>
  );
}
