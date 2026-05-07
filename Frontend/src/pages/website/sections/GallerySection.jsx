const galleries = [
  {
    title: "Inovasi Pembelajaran Digital",
    desc: "Implementasi teknologi terbaru dalam kurikulum harian siswa.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800",
    size: "large"
  },
  {
    title: "Laboratorium Komputer",
    desc: "Fasilitas riset dan komputasi modern untuk siswa unggul.",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800",
    size: "small"
  },
  {
    title: "Aktivitas Ekstrakurikuler",
    desc: "Pengembangan minat dan bakat di bidang teknologi.",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800",
    size: "small"
  },
];

export default function GallerySection() {
  return (
    <section id="galeri" className="py-10 bg-soft border-top border-bottom border-light">
      <div className="container py-5">
        
        <div className="row mb-10 justify-content-center text-center">
          <div className="col-lg-8 animate-fade-in-up">
            <span className="section-tag">Visual Insight</span>
            <h2 className="display-6 fw-900 mb-4">Aktivitas SMAN 1 Pamekasan</h2>
            <p className="text-muted fs-5 fw-500">
              Melihat lebih dekat implementasi Smart School dalam aktivitas harian siswa dan guru.
            </p>
          </div>
        </div>

        <div className="row g-4 mt-2">
          {galleries.map((item, index) => (
            <div className={item.size === 'large' ? "col-lg-8" : "col-lg-4"} key={index}>
              <div className="card h-100 border-0 overflow-hidden shadow-sm animate-fade-in-up" style={{ minHeight: '350px', animationDelay: `${index * 0.1}s` }}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-100 h-100 position-absolute top-0 start-0"
                  style={{ objectFit: "cover", zIndex: 0 }}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient-dark opacity-60" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)', zIndex: 1 }}></div>
                
                <div className="card-body position-relative z-2 d-flex flex-column justify-content-end p-5">
                  <h4 className="fw-900 text-white mb-2">{item.title}</h4>
                  <p className="text-white-50 small mb-0">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
