import { useEffect, useState } from "react";
import axios from "axios";

export default function AnnouncementMarquee() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchMarquee = async () => {
      try {
        const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        const API_BASE_URL = rawApiUrl.replace(/\/$/, "");
        const apiKey = import.meta.env.VITE_API_KEY || "smansa-secure-key-2026";
        
        const res = await axios.get(`${API_BASE_URL}/api/public/announcements/marquee`, {
          headers: { "x-api-key": apiKey }
        });
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setItems(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching marquee data:", error);
      }
    };
    fetchMarquee();
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-md text-white overflow-hidden py-2.5 text-xs font-medium tracking-widest shadow-[0_-10px_30px_rgba(0,0,0,0.15)] z-[1060] border-t border-slate-700">
      <div className="flex whitespace-nowrap animate-marquee">
        <div className="flex gap-16 shrink-0 justify-around min-w-full">
          {items.map((item, idx) => {
            const formattedDate = new Date(item.event_date).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            });
            return (
              <span key={item.id || idx} className="mx-6 flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                <span className="text-blue-300 font-bold">[{formattedDate}]</span> 
                <span className="text-slate-200">{item.title}</span>
              </span>
            );
          })}
        </div>
        {/* Repeat the content for continuous loop */}
        <div className="flex gap-16 shrink-0 justify-around min-w-full" aria-hidden="true">
          {items.map((item, idx) => {
            const formattedDate = new Date(item.event_date).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            });
            return (
              <span key={`dup-${item.id || idx}`} className="mx-6 flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                <span className="text-blue-300 font-bold">[{formattedDate}]</span> 
                <span className="text-slate-200">{item.title}</span>
              </span>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
