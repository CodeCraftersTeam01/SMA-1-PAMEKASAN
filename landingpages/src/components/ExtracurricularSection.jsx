import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function ExtracurricularSection() {
  const [items, setItems] = useState([]);

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
    if (/^https?:\/\//.test(img)) return img;
    const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const API_BASE_URL = rawApiUrl.replace(/\/$/, "");
    return `${API_BASE_URL}/storage/${img}`;
  };

  return (
    <section id="ekstrakurikuler" className="py-24 bg-white border-t border-gray-200">
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
          {items.map((item, i) => (
            <motion.div
              key={item.id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white rounded-[1.75rem] border border-slate-200/50 shadow-[0_4px_25px_rgba(0,0,0,0.015)] hover:shadow-[0_20px_45px_rgba(37,99,235,0.06)] hover:border-blue-200/80 transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:scale-[1.01] overflow-hidden flex flex-col group"
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100">
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
              <div className="p-7 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-smansa-navy mb-3 tracking-tight group-hover:text-blue-600 transition-colors">{item.name}</h3>
                {item.description && (
                  <p className="text-slate-600 leading-relaxed text-sm line-clamp-3">{item.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
