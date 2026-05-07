const features = [
  {
    title: "Manajemen Siswa",
    desc: "Modul inti pengelolaan database siswa, biodata, dan status akademik terpadu.",
    theme: "blue"
  },
  {
    title: "Pendaftaran Online",
    desc: "Sistem penerimaan siswa baru dengan validasi data dan migrasi otomatis.",
    theme: "purple"
  },
  {
    title: "Dashboard Analitik",
    desc: "Visualisasi data statistik untuk mendukung pengambilan keputusan strategis.",
    theme: "emerald"
  },
  {
    title: "Sistem Pelaporan",
    desc: "Ekspor data laporan administratif dalam berbagai format secara instan.",
    theme: "amber"
  },
  {
    title: "Manajemen User",
    desc: "Pengaturan hak akses sistem bagi administrator dan staf tata usaha.",
    theme: "slate"
  },
  {
    title: "Konfigurasi Sistem",
    desc: "Pengaturan NIS dan periode akademik yang fleksibel sesuai kebutuhan.",
    theme: "indigo"
  }
];

export default function Features() {
  return (
    <section id="fitur" className="py-10 bg-soft border-top border-bottom border-light">
      <div className="container py-5">
        <div className="row mb-10 text-center justify-content-center">
          <div className="col-lg-8 animate-fade-in-up">
            <span className="section-tag">Powerful Modules</span>
            <h2 className="h1 mb-4">Fitur Utama Platform</h2>
            <p className="text-muted fs-5 fw-500">
              Infrastruktur digital yang dirancang untuk menyederhanakan operasional harian sekolah Anda.
            </p>
          </div>
        </div>

        <div className="row g-4 mt-2">
          {features.map((f, i) => (
            <div className="col-md-6 col-lg-4" key={i}>
              <div className="card h-100 p-4 border-0 shadow-sm animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="card-body p-2">
                  <h5 className="fw-900 text-dark mb-3" style={{ fontSize: '1.25rem' }}>{f.title}</h5>
                  <p className="text-muted small fw-500 lh-lg mb-0">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
