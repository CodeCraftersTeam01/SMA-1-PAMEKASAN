const academicItems = [
  {
    title: "Pembelajaran Terintegrasi",
    description:
      "Mendukung proses pembelajaran digital melalui akses materi, tugas, dan informasi akademik.",
    icon: "bi bi-journal-bookmark-fill",
  },
  {
    title: "Monitoring Siswa",
    description:
      "Memudahkan sekolah dalam memantau data siswa, perkembangan akademik, dan administrasi.",
    icon: "bi bi-person-check-fill",
  },
  {
    title: "Manajemen Tahun Ajaran",
    description:
      "Pengelolaan data tahun ajaran, pendaftar, dan siswa dilakukan lebih terstruktur.",
    icon: "bi bi-calendar2-check-fill",
  },
];

export default function AcademicSection() {
  return (
    <section id="akademik" className="py-5 bg-white">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-5">
            <span className="badge bg-primary bg-opacity-10 text-primary mb-3">
              Akademik Digital
            </span>

            <h2 className="fw-bold mb-3">
              Mendukung Tata Kelola Akademik Sekolah
            </h2>

            <p className="text-muted mb-4">
              Platform ini dirancang bukan hanya sebagai halaman informasi,
              tetapi sebagai pintu masuk menuju sistem akademik dan administrasi
              sekolah yang lebih terpusat.
            </p>

            <a href="#fitur" className="btn btn-outline-primary">
              Lihat Fitur Sistem
            </a>
          </div>

          <div className="col-lg-7">
            <div className="row g-4">
              {academicItems.map((item, index) => (
                <div className="col-md-6" key={index}>
                  <div className="card border-0 shadow-sm rounded-4 h-100">
                    <div className="card-body p-4">
                      <div className="icon-lg bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                        <i className={`${item.icon} fs-4`}></i>
                      </div>

                      <h5 className="fw-bold mb-2">{item.title}</h5>

                      <p className="text-muted mb-0">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="col-md-6">
                <div className="card border-0 bg-primary text-white rounded-4 h-100">
                  <div className="card-body p-4 d-flex flex-column justify-content-center">
                    <h4 className="fw-bold mb-2">Terintegrasi</h4>
                    <p className="mb-0 text-white-50">
                      Satu platform untuk menghubungkan data, layanan, dan akses
                      pengguna sekolah.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
