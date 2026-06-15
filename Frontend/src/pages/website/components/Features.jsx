import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.smansa.m-tech.fun";
const API_KEY = import.meta.env.VITE_API_KEY || "smansa-secure-key-2026";

// Fallback content shown if the dashboard has no features yet
const fallbackFeatures = [
  { title: "Manajemen Siswa", description: "Modul inti pengelolaan database siswa, biodata, dan status akademik terpadu.", icon: "bi-people" },
  { title: "Pendaftaran Online", description: "Sistem penerimaan siswa baru dengan validasi data dan migrasi otomatis.", icon: "bi-pencil-square" },
  { title: "Dashboard Analitik", description: "Visualisasi data statistik untuk mendukung pengambilan keputusan strategis.", icon: "bi-graph-up" },
  { title: "Sistem Pelaporan", description: "Ekspor data laporan administratif dalam berbagai format secara instan.", icon: "bi-file-earmark-bar-graph" },
  { title: "Manajemen User", description: "Pengaturan hak akses sistem bagi administrator dan staf tata usaha.", icon: "bi-shield-lock" },
  { title: "Konfigurasi Sistem", description: "Pengaturan NIS dan periode akademik yang fleksibel sesuai kebutuhan.", icon: "bi-gear" },
];

export default function Features() {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    let active = true;
    const fetchFeatures = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/features`, {
          headers: { "x-api-key": API_KEY },
        });
        if (res.ok) {
          const json = await res.json();
          if (active && Array.isArray(json?.data) && json.data.length) {
            setFeatures(json.data);
          }
        }
      } catch (error) {
        console.error("Error fetching features:", error);
      }
    };
    fetchFeatures();
    return () => {
      active = false;
    };
  }, []);

  const items = features.length ? features : fallbackFeatures;

  return (
    <section id="fitur" className="py-10 bg-soft border-top border-bottom border-light">
      <div className="container py-5">
        <div className="row mb-10 text-center justify-content-center">
          <div className="col-lg-8 reveal">
            <span className="section-tag">Powerful Modules</span>
            <h2 className="h1 mb-4">Fitur Utama Platform</h2>
            <p className="text-muted fs-5 fw-500">
              Infrastruktur digital yang dirancang untuk menyederhanakan operasional harian sekolah Anda.
            </p>
          </div>
        </div>

        <div className="row g-4 mt-2">
          {items.map((f, i) => (
            <div className="col-md-6 col-lg-4" key={f.id || i}>
              <div className="card h-100 p-4 border-0 shadow-sm reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="card-body p-2">
                  {f.icon && (
                    <i className={`bi ${f.icon} text-primary mb-3 d-block`} style={{ fontSize: '1.75rem' }}></i>
                  )}
                  <h5 className="fw-900 text-dark mb-3" style={{ fontSize: '1.25rem' }}>{f.title}</h5>
                  <p className="text-muted small fw-500 lh-lg mb-0">{f.description || f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
