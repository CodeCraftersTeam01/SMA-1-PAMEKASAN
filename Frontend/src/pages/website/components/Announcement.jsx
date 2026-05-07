const announcements = [
  {
    title: "Update Sistem: Modul Pendaftaran Calon Siswa Baru Telah Aktif",
    date: "06 Mei 2026",
    category: "Sistem",
  },
  {
    title: "Pemeliharaan Database Rutin untuk Stabilitas Dashboard",
    date: "04 Mei 2026",
    category: "Maintenance",
  },
  {
    title: "Sosialisasi Penggunaan Platform Digital bagi Tenaga Pendidik",
    date: "01 Mei 2026",
    category: "Kegiatan",
  },
];

export default function Announcement() {
  return (
    <section id="pengumuman" className="py-10 bg-soft">
      <div className="container py-5">
        <div className="row mb-5 justify-content-between align-items-end">
          <div className="col-lg-7">
            <span className="section-tag">Log Informasi</span>
            <h2 className="display-6 fw-800 mb-0">Warta Terbaru</h2>
          </div>
          <div className="col-lg-3 text-lg-end mt-3 mt-lg-0">
             <button className="btn btn-link text-dark fw-bold text-decoration-none p-0">Lihat Semua Arsip <i className="bi bi-arrow-right"></i></button>
          </div>
        </div>

        <div className="mt-5">
          {announcements.map((item, index) => (
            <div className="py-4 border-bottom border-light d-flex flex-column flex-md-row justify-content-between align-items-md-center reveal" key={index} style={{ transitionDelay: `${index * 100}ms` }}>
              <div className="d-flex align-items-center gap-4 mb-3 mb-md-0">
                <span className="small text-muted font-bold text-uppercase tracking-widest d-none d-md-block" style={{ minWidth: '100px' }}>{item.category}</span>
                <h5 className="fw-bold mb-0 hover-text-primary cursor-pointer transition-all">{item.title}</h5>
              </div>
              <div className="text-muted small font-medium">
                <i className="bi bi-calendar3 me-2"></i>
                {item.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
