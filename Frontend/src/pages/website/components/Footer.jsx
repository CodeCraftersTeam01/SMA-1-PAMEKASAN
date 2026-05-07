export default function Footer() {
  return (
    <footer id="kontak" className="bg-dark text-white pt-5 pb-4">
      <div className="container">
        <div className="row g-4">

          {/* School Info */}
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-3 mb-3">
              <img
                src="/assets/images/logo-smansa.png"
                alt="SMAN 1 Pamekasan"
                style={{ height: "50px" }}
              />

              <div>
                <h5 className="fw-bold mb-0 text-white">
                  SMAN 1 Pamekasan
                </h5>
                <small className="text-white-50">
                  Smart School Platform
                </small>
              </div>
            </div>

            <p className="text-white-50 mb-0">
              Platform digital sekolah untuk mendukung layanan akademik,
              administrasi, dan informasi sekolah secara terintegrasi.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-6 col-lg-2">
            <h6 className="fw-bold text-white mb-3">
              Menu
            </h6>

            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <a href="#" className="text-white-50 text-decoration-none">
                  Beranda
                </a>
              </li>

              <li className="mb-2">
                <a href="#fitur" className="text-white-50 text-decoration-none">
                  Fitur
                </a>
              </li>

              <li className="mb-2">
                <a href="#pengumuman" className="text-white-50 text-decoration-none">
                  Pengumuman
                </a>
              </li>

              <li>
                <a href="#kontak" className="text-white-50 text-decoration-none">
                  Kontak
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-md-6 col-lg-3">
            <h6 className="fw-bold text-white mb-3">
              Layanan Sistem
            </h6>

            <ul className="list-unstyled mb-0">
              <li className="mb-2 text-white-50">
                <i className="bi bi-check-circle me-2"></i>
                Akademik Digital
              </li>

              <li className="mb-2 text-white-50">
                <i className="bi bi-check-circle me-2"></i>
                Presensi Digital
              </li>

              <li className="mb-2 text-white-50">
                <i className="bi bi-check-circle me-2"></i>
                Informasi Sekolah
              </li>

              <li className="text-white-50">
                <i className="bi bi-check-circle me-2"></i>
                Monitoring Siswa
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-3">
            <h6 className="fw-bold text-white mb-3">
              Kontak Sekolah
            </h6>

            <ul className="list-unstyled mb-0">
              <li className="mb-3 text-white-50">
                <i className="bi bi-geo-alt-fill me-2"></i>
                Pamekasan, Jawa Timur
              </li>

              <li className="mb-3 text-white-50">
                <i className="bi bi-envelope-fill me-2"></i>
                info@smansa.sch.id
              </li>

              <li className="text-white-50">
                <i className="bi bi-telephone-fill me-2"></i>
                0324-000000
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <small className="text-white-50">
              © 2026 SMAN 1 Pamekasan. All rights reserved.
            </small>
          </div>

          <div className="col-md-6 text-center text-md-end mt-3 mt-md-0">
            <small className="text-white-50">
              Integrated School Information System
            </small>
          </div>
        </div>
      </div>
    </footer>
  );
}
