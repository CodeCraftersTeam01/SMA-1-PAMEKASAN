import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function TestimonialSection() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;
    const fetchItems = async () => {
      try {
        const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        const API_BASE_URL = rawApiUrl.replace(/\/$/, "");
        const res = await axios.get(`${API_BASE_URL}/api/public/testimonials`, {
          headers: { "x-api-key": import.meta.env.VITE_API_KEY },
        });
        if (res.data && active) {
          const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data.data) ? res.data.data : []);
          setItems(data);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        if (active) setItems([]); // Failsafe empty state
      }
    };
    fetchItems();
    return () => {
      active = false;
    };
  }, []);

  if (!items.length) return null;

  const imageUrl = (item) => {
    if (item.avatar_url) {
      if (/^https?:\/\//.test(item.avatar_url)) return item.avatar_url;
      const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const API_BASE_URL = rawApiUrl.replace(/\/$/, "");
      return `${API_BASE_URL}${item.avatar_url}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=eff6ff`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.slice(0, 5).map((item, i) => (
        <motion.div
          key={item.id || i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-all duration-300 flex flex-col"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-blue-50 shrink-0 border border-gray-100">
              <img
                src={imageUrl(item)}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=eff6ff`;
                }}
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-smansa-navy leading-tight">{item.name}</h3>
              <p className="text-sm text-smansa-gold font-semibold uppercase tracking-wider mt-1">
                {item.role} {item.graduation_year ? `'${item.graduation_year.toString().slice(-2)}` : ''}
              </p>
              {item.current_occupation && (
                <p className="text-xs text-gray-500 mt-0.5">{item.current_occupation}</p>
              )}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-gray-600 leading-relaxed italic">"{item.message}"</p>
          </div>
          <div className="mt-6 flex text-smansa-gold">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
