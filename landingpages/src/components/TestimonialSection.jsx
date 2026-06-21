import { useEffect, useState } from "react";
import axios from "axios";
import { Quote, Star } from "lucide-react";

// List of professional fallback testimonials if database has none or very few
const DEFAULT_TESTIMONIALS = [
  {
    id: "def-1",
    name: "dr. H. Rahmat Fajar, Sp.PD",
    role: "alumni",
    graduation_year: 2005,
    current_occupation: "Dokter Spesialis Penyakit Dalam",
    message: "SMAN 1 Pamekasan mendidik saya tidak hanya secara akademis, tetapi juga menanamkan karakter disiplin dan integritas tinggi. Pengalaman berharga yang menjadi fondasi karier kedokteran saya."
  },
  {
    id: "def-2",
    name: "Ahmad Wildan, M.T.",
    role: "alumni",
    graduation_year: 2012,
    current_occupation: "Senior Software Engineer di Tech Corp",
    message: "Lingkungan belajar di SMAN 1 Pamekasan sangat kompetitif namun suportif. Guru-gurunya berdedikasi tinggi membimbing kami hingga mampu bersaing di tingkat nasional."
  },
  {
    id: "def-3",
    name: "Prof. Dr. Ir. Siti Aminah, M.Sc.",
    role: "alumni",
    graduation_year: 1998,
    current_occupation: "Guru Besar Fakultas Teknik, Universitas Indonesia",
    message: "Kenangan indah di SMAN 1 Pamekasan selalu melekat. Sekolah ini melahirkan calon pemimpin bangsa dengan membiasakan berpikir kritis, inovatif, dan berakhlak mulia."
  },
  {
    id: "def-4",
    name: "Faisal Akbar",
    role: "siswa",
    graduation_year: 2026,
    current_occupation: "Ketua OSIS SMAN 1 Pamekasan",
    message: "Bangga sekali menjadi bagian dari SMAN 1 Pamekasan. Fasilitas penunjang belajar sangat lengkap dan ekstrakurikulernya memfasilitasi minat bakat kami secara maksimal."
  },
  {
    id: "def-5",
    name: "Dra. Herlina Wati",
    role: "orangtua",
    graduation_year: null,
    current_occupation: "Wiraswasta / Orang Tua Siswa",
    message: "Sebagai orang tua, saya sangat puas dengan sistem pendidikan di SMAN 1 Pamekasan. Disiplinnya luar biasa, pembinaan keagamaannya kuat, dan perkembangannya terpantau dengan sangat baik."
  },
  {
    id: "def-6",
    name: "Budi Santoso, M.B.A.",
    role: "orangtua",
    graduation_year: null,
    current_occupation: "Karyawan Swasta / Orang Tua Siswa",
    message: "Putra saya tumbuh menjadi pribadi yang mandiri dan berprestasi sejak bersekolah di SMAN 1 Pamekasan. Sekolah ini benar-benar mencetak lulusan berkelas."
  },
  {
    id: "def-7",
    name: "Nadia Puspita",
    role: "siswa",
    graduation_year: 2027,
    current_occupation: "Siswa Kelas XI MIPA 1",
    message: "Pembelajaran di kelas sangat interaktif. Guru-guru menerangkan dengan cara yang menyenangkan sehingga materi sesulit apapun terasa mudah dipahami. SMANSA Jaya!"
  },
  {
    id: "def-8",
    name: "Rian Aditya",
    role: "alumni",
    graduation_year: 2020,
    current_occupation: "Mahasiswa Kedokteran Unair",
    message: "Berkat bimbingan intensif dan konseling karier di SMAN 1 Pamekasan, saya berhasil lolos SNBP ke jurusan impian saya. Terima kasih bapak dan ibu guru!"
  }
];

export default function TestimonialSection() {
  const [dbItems, setDbItems] = useState([]);

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
          setDbItems(data);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      }
    };
    fetchItems();
    return () => {
      active = false;
    };
  }, []);

  const imageUrl = (item) => {
    if (item.avatar_url) {
      if (/^https?:\/\//.test(item.avatar_url)) return item.avatar_url;
      const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const API_BASE_URL = rawApiUrl.replace(/\/$/, "");
      return `${API_BASE_URL}${item.avatar_url}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=eff6ff&color=2563eb`;
  };

  // If database has approved testimonials, use them exclusively. Otherwise, fallback to defaults.
  const baseTestimonials = dbItems.length > 0 ? dbItems : DEFAULT_TESTIMONIALS;

  // Helper to ensure we have enough items for the marquee to scroll smoothly
  const fillMarquee = (arr, minLength = 6) => {
    if (arr.length === 0) return [];
    let result = [...arr];
    while (result.length < minLength) {
      result = [...result, ...arr];
    }
    return result;
  };

  // Distribute testimonials between two rows for staggered marquee
  const baseRow1 = baseTestimonials.filter((_, idx) => idx % 2 === 0);
  const baseRow2 = baseTestimonials.filter((_, idx) => idx % 2 !== 0);

  const row1 = fillMarquee(baseRow1, 6);
  const row2 = fillMarquee(baseRow2, 6);

  const renderCard = (item, uniqueKey) => (
    <div
      key={uniqueKey}
      className="w-[22rem] sm:w-[26rem] bg-white rounded-[2rem] p-8 border border-slate-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.07)] hover:border-blue-200 hover:-translate-y-1.5 transition-all duration-300 flex flex-col shrink-0 relative overflow-hidden group/card cursor-default"
    >
      {/* Background Quote Icon for high visual design */}
      <Quote className="absolute top-6 right-8 w-20 h-20 text-slate-100/70 group-hover/card:text-blue-50/50 transition-colors duration-500 pointer-events-none z-0" />

      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-5 relative z-10">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-blue-50 shrink-0 border border-slate-100">
          <img
            src={imageUrl(item)}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=eff6ff&color=2563eb`;
            }}
          />
        </div>
        <div>
          <h3 className="text-base font-bold text-smansa-navy leading-tight line-clamp-1 group-hover/card:text-blue-600 transition-colors">
            {item.name}
          </h3>
          
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {/* Role Badge */}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              item.role === 'alumni' 
                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                : item.role === 'siswa'
                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}>
              {item.role === 'alumni' ? 'Alumni' : item.role === 'siswa' ? 'Siswa' : 'Orang Tua'}
              {item.role === 'alumni' && item.graduation_year ? ` '${item.graduation_year.toString().slice(-2)}` : ''}
            </span>
            
            {item.current_occupation && (
              <span className="text-[11px] text-slate-400 font-medium">
                • {item.current_occupation}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Testimonial message */}
      <div className="flex-1 relative z-10 mb-6">
        <p className="text-slate-600 leading-relaxed italic text-sm sm:text-[14.5px] line-clamp-4">
          "{item.message}"
        </p>
      </div>
      
      {/* Bottom stars */}
      <div className="flex text-amber-400 gap-0.5 relative z-10 shrink-0">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className="w-4 h-4 fill-current text-amber-400" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative w-full overflow-hidden py-14 flex flex-col gap-8 bg-gradient-to-b from-gray-50/50 via-white to-gray-50/50">
      
      {/* LANE 1: Move Left */}
      <div className="relative flex w-full overflow-hidden group">
        <div className="flex w-max gap-8 animate-marquee-left group-hover:[animation-play-state:paused] py-4">
          {/* Main set */}
          <div className="flex gap-8 px-4 shrink-0">
            {row1.map((item, i) => renderCard(item, `r1-${i}`))}
          </div>
          {/* Duplicate set for infinite loop */}
          <div className="flex gap-8 px-4 shrink-0" aria-hidden="true">
            {row1.map((item, i) => renderCard(item, `r1-dup-${i}`))}
          </div>
        </div>
      </div>

      {/* LANE 2: Move Right */}
      <div className="relative flex w-full overflow-hidden group">
        <div className="flex w-max gap-8 animate-marquee-right group-hover:[animation-play-state:paused] py-4">
          {/* Main set */}
          <div className="flex gap-8 px-4 shrink-0">
            {row2.map((item, i) => renderCard(item, `r2-${i}`))}
          </div>
          {/* Duplicate set for infinite loop */}
          <div className="flex gap-8 px-4 shrink-0" aria-hidden="true">
            {row2.map((item, i) => renderCard(item, `r2-dup-${i}`))}
          </div>
        </div>
      </div>

      {/* Animations styling */}
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee-left {
          animation: marquee-left 40s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
        .animate-marquee-right {
          animation: marquee-right 45s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
      `}</style>
      
      {/* Elegant side gradient overlay shields to fade edges */}
      <div className="absolute inset-y-0 left-0 w-20 sm:w-40 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10"></div>
      <div className="absolute inset-y-0 right-0 w-20 sm:w-40 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10"></div>
    </div>
  );
}
