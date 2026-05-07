export default function AcademicSection() {
  const items = [
    { title: "Dashboard Real-time", desc: "Pantau seluruh aktivitas sekolah secara instan melalui satu layar utama." },
    { title: "Keamanan Data", desc: "Enkripsi tingkat tinggi untuk melindungi seluruh database dan informasi sekolah." },
    { title: "Kemudahan Akses", desc: "Platform responsif yang dapat diakses melalui berbagai perangkat dengan aman." }
  ];

  return (
    <section id="akademik" className="py-10">
      <div className="container py-5">
        <div className="row align-items-center g-5">
          <div className="col-lg-6 animate-fade-in-up">
            <span className="section-tag">Integrasi Sistem</span>
            <h2 className="display-6 fw-800 mb-4">Solusi Digital untuk Tata Kelola Modern</h2>
            <p className="text-muted fs-5 mb-5">
              Kami menghadirkan infrastruktur digital yang akurat dan reliabel untuk mendukung kemajuan SMAN 1 Pamekasan di era transformasi pendidikan.
            </p>
            <div className="d-flex align-items-center gap-3">
               <div className="px-3 py-2 bg-dark text-white rounded-3 small fw-bold">Enterprise Ready</div>
               <div className="px-3 py-2 bg-soft text-dark rounded-3 small fw-bold border border-light">ISO Standard</div>
            </div>
          </div>
          <div className="col-lg-6 animate-fade-in-up">
            <div className="row g-4">
              {items.map((item, i) => (
                <div className="col-12" key={i}>
                  <div className="p-4 border border-light rounded-4 bg-soft hover-bg-white transition-all">
                    <h5 className="fw-bold mb-2">{item.title}</h5>
                    <p className="text-muted small mb-0">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
