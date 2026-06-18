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
    <div className="w-full bg-yellow-400 text-slate-900 border-y-4 border-slate-900 overflow-hidden py-3 font-bold text-sm tracking-wide shadow-sm relative z-50">
      <div className="flex whitespace-nowrap animate-marquee">
        <div className="flex gap-12 shrink-0 justify-around min-w-full">
          {items.map((item, idx) => {
            const formattedDate = new Date(item.event_date).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric"
            });
            return (
              <span key={item.id || idx} className="mx-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block"></span>
                <span>[{formattedDate}] - {item.title}</span>
              </span>
            );
          })}
        </div>
        {/* Repeat the content for continuous loop */}
        <div className="flex gap-12 shrink-0 justify-around min-w-full" aria-hidden="true">
          {items.map((item, idx) => {
            const formattedDate = new Date(item.event_date).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric"
            });
            return (
              <span key={`dup-${item.id || idx}`} className="mx-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block"></span>
                <span>[{formattedDate}] - {item.title}</span>
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
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
}
