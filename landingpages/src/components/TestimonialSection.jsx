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
    <div className="relative w-full overflow-hidden py-10 flex flex-col group">
      {/* Container that animates */}
      <div className="flex w-max animate-[marquee-left_40s_linear_infinite] group-hover:[animation-play-state:paused] items-stretch">
        
        {/* First set of cards */}
        <div className="flex gap-8 px-4 shrink-0">
          {items.map((item, i) => (
            <div
              key={item.id || i}
              className="w-80 sm:w-96 bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-all duration-300 flex flex-col shrink-0"
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
                  <h3 className="text-lg font-bold text-smansa-navy leading-tight line-clamp-1">{item.name}</h3>
                  <p className="text-sm text-smansa-gold font-semibold uppercase tracking-wider mt-1">
                    {item.role} {item.graduation_year ? `'${item.graduation_year.toString().slice(-2)}` : ''}
                  </p>
                  {item.current_occupation && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.current_occupation}</p>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-gray-600 leading-relaxed italic line-clamp-4">"{item.message}"</p>
              </div>
              <div className="mt-6 flex text-smansa-gold shrink-0">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Duplicate set for infinite scrolling */}
        <div className="flex gap-8 px-4 shrink-0" aria-hidden="true">
          {items.map((item, i) => (
            <div
              key={`dup-${item.id || i}`}
              className="w-80 sm:w-96 bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-all duration-300 flex flex-col shrink-0"
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
                  <h3 className="text-lg font-bold text-smansa-navy leading-tight line-clamp-1">{item.name}</h3>
                  <p className="text-sm text-smansa-gold font-semibold uppercase tracking-wider mt-1">
                    {item.role} {item.graduation_year ? `'${item.graduation_year.toString().slice(-2)}` : ''}
                  </p>
                  {item.current_occupation && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.current_occupation}</p>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-gray-600 leading-relaxed italic line-clamp-4">"{item.message}"</p>
              </div>
              <div className="mt-6 flex text-smansa-gold shrink-0">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
        
      </div>

      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      
      {/* Gradient borders for smooth fade effect */}
      <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10"></div>
      <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10"></div>
    </div>
  );
}
