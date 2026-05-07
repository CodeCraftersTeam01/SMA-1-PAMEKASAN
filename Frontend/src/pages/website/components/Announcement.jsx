const announcements = [
  {
    title: "Pelaksanaan Penilaian Akhir Semester",
    date: "06 Mei 2026",
    category: "Akademik",
    description:
      "Penilaian Akhir Semester genap akan dilaksanakan mulai tanggal 20 Mei 2026 secara terjadwal.",
  },
  {
    title: "Pembukaan Pendaftaran Ekstrakurikuler",
    date: "04 Mei 2026",
    category: "Kesiswaan",
    description:
      "Siswa dapat melakukan pendaftaran ekstrakurikuler melalui sistem sekolah mulai minggu ini.",
  },
  {
    title: "Sosialisasi Platform Digital Sekolah",
    date: "01 Mei 2026",
    category: "Informasi",
    description:
      "Sekolah melakukan pengembangan platform digital terintegrasi untuk mendukung layanan akademik.",
  },
];

export default function Announcement() {
  return (
    <section id="pengumuman" className="py-5">
      <div className="container">

        {/* Section Title */}
        <div className="row mb-5">
          <div className="col-lg-8 mx-auto text-center">

            <span className="badge bg-warning bg-opacity-10 text-warning mb-3">
              Informasi Sekolah
            </span>

            <h2 className="fw-bold mb-3">
              Pengumuman & Informasi Terbaru
            </h2>

            <p className="text-muted mb-0">
              Dapatkan informasi terbaru mengenai kegiatan akademik,
              kesiswaan, dan pengembangan sistem sekolah.
            </p>

          </div>
        </div>

        {/* Announcement List */}
        <div className="row g-4">

          {announcements.map((item, index) => (
            <div className="col-lg-4" key={index}>

              <div className="card border-0 shadow-sm h-100 rounded-4">
                <div className="card-body p-4 d-flex flex-column">

                  {/* Badge */}
                  <div className="mb-3">
                    <span className="badge bg-primary bg-opacity-10 text-primary">
                      {item.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h5 className="fw-bold mb-3">
                    {item.title}
                  </h5>

                  {/* Description */}
                  <p className="text-muted flex-grow-1">
                    {item.description}
                  </p>

                  {/* Footer */}
                  <div className="d-flex justify-content-between align-items-center mt-3">

                    <small className="text-muted">
                      <i className="bi bi-calendar-event me-2"></i>
                      {item.date}
                    </small>

                    <button className="btn btn-sm btn-light">
                      Detail
                    </button>

                  </div>

                </div>
              </div>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
