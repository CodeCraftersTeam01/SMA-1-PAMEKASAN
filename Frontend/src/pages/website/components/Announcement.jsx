import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.smansa.m-tech.fun";
const API_KEY = import.meta.env.VITE_API_KEY || "smansa-secure-key-2026";

const fallbackNews = [
  { title: "Update Sistem: Modul Pendaftaran Calon Siswa Baru Telah Aktif", published_at: "2026-05-06", category: "Sistem" },
  { title: "Pemeliharaan Database Rutin untuk Stabilitas Dashboard", published_at: "2026-05-04", category: "Maintenance" },
  { title: "Sosialisasi Penggunaan Platform Digital bagi Tenaga Pendidik", published_at: "2026-05-01", category: "Kegiatan" },
];

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
};

export default function Announcement() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    let active = true;
    const fetchNews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/news`, {
          headers: { "x-api-key": API_KEY },
        });
        if (res.ok) {
          const json = await res.json();
          if (active && Array.isArray(json?.data) && json.data.length) {
            setNews(json.data);
          }
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };
    fetchNews();
    return () => {
      active = false;
    };
  }, []);

  const items = news.length ? news : fallbackNews;

  return (
    <section id="pengumuman" className="py-10 bg-soft">
      <div className="container py-5">
        <div className="row mb-5 justify-content-between align-items-end">
          <div className="col-lg-7">
            <span className="section-tag">Log Informasi</span>
            <h2 className="display-6 fw-800 mb-0">Informasi Terbaru</h2>
          </div>
          <div className="col-lg-3 text-lg-end mt-3 mt-lg-0">
             <button className="btn btn-link text-dark fw-bold text-decoration-none p-0">Lihat Semua Arsip <i className="bi bi-arrow-right"></i></button>
          </div>
        </div>

        <div className="mt-5">
          {items.map((item, index) => (
            <div className="py-4 border-bottom border-light d-flex flex-column flex-md-row justify-content-between align-items-md-center reveal" key={item.id || index} style={{ transitionDelay: `${index * 100}ms` }}>
              <div className="d-flex align-items-center gap-4 mb-3 mb-md-0">
                <span className="small text-muted font-bold text-uppercase tracking-widest d-none d-md-block" style={{ minWidth: '100px' }}>{item.category || 'Info'}</span>
                <h5 className="fw-bold mb-0 hover-text-primary cursor-pointer transition-all">{item.title}</h5>
              </div>
              <div className="text-muted small font-medium">
                <i className="bi bi-calendar3 me-2"></i>
                {formatDate(item.published_at || item.date)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
