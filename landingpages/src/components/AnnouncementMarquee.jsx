import { useEffect, useState } from "react";
import axios from "axios";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function AnnouncementMarquee({ isScrolled = false }) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

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
    <div className={`transition-all duration-700 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 overflow-hidden py-3 px-6 rounded-2xl lg:rounded-full tracking-wide ${
      isScrolled 
        ? 'fixed bottom-6 bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl text-smansa-navy font-bold'
        : 'absolute bottom-[5.5rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl text-white font-medium'
    }`}>
      <div className="flex whitespace-nowrap animate-marquee items-center text-[13px] md:text-sm">
        <div className="flex gap-16 shrink-0 justify-around min-w-full">
          {items.map((item, idx) => {
            const dateObj = new Date(item.event_date);
            const formattedDate = isNaN(dateObj) ? '' : dateObj.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short"
            });
            return (
              <button 
                key={item.id || idx} 
                onClick={() => setSelectedItem(item)}
                className="mx-4 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors duration-700 shrink-0 ${isScrolled ? 'bg-blue-100 text-blue-600' : 'bg-white/20 text-white'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </span>
                <span className={`font-extrabold tracking-widest uppercase text-[11px] shrink-0 transition-colors duration-700 ${isScrolled ? 'text-blue-600' : 'text-blue-200'}`}>INFO PENTING</span>
                
                <span className="opacity-95 font-bold ml-1">{item.title}</span>
                
                {item.content && (
                  <span className="opacity-75 font-normal ml-1">
                    - {item.content.replace(/<[^>]+>/g, '').substring(0, 50)}...
                  </span>
                )}

                {formattedDate && <span className="opacity-70 ml-1 shrink-0">({formattedDate})</span>}
              </button>
            );
          })}
        </div>
        {/* Repeat the content for continuous loop */}
        <div className="flex gap-16 shrink-0 justify-around min-w-full" aria-hidden="true">
          {items.map((item, idx) => {
            const dateObj = new Date(item.event_date);
            const formattedDate = isNaN(dateObj) ? '' : dateObj.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short"
            });
            return (
              <button 
                key={`dup-${item.id || idx}`} 
                onClick={() => setSelectedItem(item)}
                className="mx-4 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors duration-700 shrink-0 ${isScrolled ? 'bg-blue-100 text-blue-600' : 'bg-white/20 text-white'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </span>
                <span className={`font-extrabold tracking-widest uppercase text-[11px] shrink-0 transition-colors duration-700 ${isScrolled ? 'text-blue-600' : 'text-blue-200'}`}>INFO PENTING</span>
                
                <span className="opacity-95 font-bold ml-1">{item.title}</span>
                
                {item.content && (
                  <span className="opacity-75 font-normal ml-1">
                    - {item.content.replace(/<[^>]+>/g, '').substring(0, 50)}...
                  </span>
                )}

                {formattedDate && <span className="opacity-70 ml-1 shrink-0">({formattedDate})</span>}
              </button>
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
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      {/* Modal Pengumuman */}
      {createPortal(
        <AnimatePresence>
          {selectedItem && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" 
              onClick={() => setSelectedItem(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
                onClick={e => e.stopPropagation()}
              >
                {/* Dekorasi Modal */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-blue-100 blur-2xl opacity-50 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-yellow-100 blur-2xl opacity-50 pointer-events-none"></div>

                <div className="p-8 relative z-10 text-left">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">INFO PENTING</h4>
                        <p className="text-sm font-medium text-gray-500">
                          {new Date(selectedItem.event_date).toLocaleDateString("id-ID", {
                            day: "numeric", month: "long", year: "numeric"
                          })}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedItem(null)}
                      className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 hover:text-gray-800 transition-colors shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 whitespace-normal">{selectedItem.title}</h3>
                  
                  <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar whitespace-normal">
                    {selectedItem.content ? (
                      <div dangerouslySetInnerHTML={{ __html: selectedItem.content }} />
                    ) : (
                      <p className="italic text-gray-400">Tidak ada deskripsi tambahan.</p>
                    )}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                    <button 
                      onClick={() => setSelectedItem(null)}
                      className="px-6 py-2.5 bg-smansa-navy text-white font-bold rounded-xl hover:bg-blue-900 transition-colors shadow-lg shadow-blue-900/20"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
