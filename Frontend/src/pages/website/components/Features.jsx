const features = [
  {
    icon: "bi bi-mortarboard-fill",
    title: "E-Learning",
    description:
      "Akses materi pembelajaran, tugas, dan aktivitas kelas secara online.",
  },
  {
    icon: "bi bi-calendar-check-fill",
    title: "Presensi Digital",
    description:
      "Monitoring kehadiran siswa dan guru secara realtime dan terintegrasi.",
  },
  {
    icon: "bi bi-bar-chart-fill",
    title: "Monitoring Akademik",
    description:
      "Pantau perkembangan akademik, nilai, dan performa siswa dengan mudah.",
  },
  {
    icon: "bi bi-megaphone-fill",
    title: "Pengumuman Sekolah",
    description:
      "Informasi dan pengumuman sekolah tersampaikan lebih cepat dan terpusat.",
  },
  {
    icon: "bi bi-people-fill",
    title: "Manajemen Pengguna",
    description:
      "Pengelolaan akun siswa, guru, wali kelas, dan administrator sekolah.",
  },
  {
    icon: "bi bi-shield-lock-fill",
    title: "Sistem Terintegrasi",
    description:
      "Keamanan data dan akses sistem terpusat dalam satu platform digital.",
  },
];

export default function Features() {
  return (
    <section id="fitur" className="py-5 bg-light">
      <div className="container">

        {/* Section Title */}
        <div className="row mb-5">
          <div className="col-lg-8 mx-auto text-center">

            <span className="badge bg-primary bg-opacity-10 text-primary mb-3">
              Fitur Platform
            </span>

            <h2 className="fw-bold mb-3">
              Sistem Digital Sekolah dalam Satu Platform
            </h2>

            <p className="text-muted mb-0">
              Platform SMAN 1 Pamekasan dirancang untuk mendukung
              pembelajaran, administrasi, dan layanan sekolah secara modern,
              efisien, dan terintegrasi.
            </p>

          </div>
        </div>

        {/* Features Grid */}
        <div className="row g-4">

          {features.map((feature, index) => (
            <div className="col-md-6 col-lg-4" key={index}>

              <div className="card border-0 shadow-sm h-100 rounded-4 transition-all">
                <div className="card-body p-4">

                  {/* Icon */}
                  <div className="icon-lg bg-primary bg-opacity-10 text-primary rounded-circle mb-4 d-inline-flex align-items-center justify-content-center">
                    <i className={`${feature.icon} fs-4`}></i>
                  </div>

                  {/* Title */}
                  <h5 className="fw-bold mb-3">
                    {feature.title}
                  </h5>

                  {/* Description */}
                  <p className="text-muted mb-0">
                    {feature.description}
                  </p>

                </div>
              </div>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
