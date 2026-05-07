const galleries = [
  {
    title: "Kegiatan Akademik",
    description: "Dokumentasi kegiatan pembelajaran dan aktivitas sekolah.",
    image: "/assets/images/gallery-1.jpg",
  },
  {
    title: "Kegiatan Siswa",
    description: "Aktivitas kesiswaan, organisasi, dan pengembangan minat.",
    image: "/assets/images/gallery-2.jpg",
  },
  {
    title: "Lingkungan Sekolah",
    description: "Suasana lingkungan dan fasilitas SMAN 1 Pamekasan.",
    image: "/assets/images/gallery-3.jpg",
  },
];

export default function GallerySection() {
  return (
    <section id="galeri" className="py-5 bg-white">
      <div className="container">
        <div className="row mb-5">
          <div className="col-lg-8 mx-auto text-center">
            <span className="badge bg-primary bg-opacity-10 text-primary mb-3">
              Galeri Sekolah
            </span>

            <h2 className="fw-bold mb-3">
              Dokumentasi Kegiatan SMAN 1 Pamekasan
            </h2>

            <p className="text-muted mb-0">
              Menampilkan kegiatan akademik, kesiswaan, dan lingkungan sekolah
              sebagai bagian dari identitas digital sekolah.
            </p>
          </div>
        </div>

        <div className="row g-4">
          {galleries.map((item, index) => (
            <div className="col-md-4" key={index}>
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                <div
                  className="bg-light d-flex align-items-center justify-content-center"
                  style={{ height: "220px" }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="img-fluid w-100 h-100"
                    style={{ objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <span className="text-muted small position-absolute">
                    Gambar belum tersedia
                  </span>
                </div>

                <div className="card-body p-4">
                  <h5 className="fw-bold mb-2">{item.title}</h5>
                  <p className="text-muted mb-0">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
