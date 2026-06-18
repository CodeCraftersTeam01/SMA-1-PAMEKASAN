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
              className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col"
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100">
                <img
                  src={imageUrl(item.image_path)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/600x400?text=Ekstrakurikuler";
                  }}
                />
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-smansa-navy mb-3 tracking-tight">{item.name}</h3>
                {item.description && (
                  <p className="text-gray-600 leading-relaxed text-sm line-clamp-3">{item.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
