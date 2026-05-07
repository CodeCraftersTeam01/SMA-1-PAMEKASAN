export default function Hero({ onLoginClick }) {
  return (
    <section className="pt-5 pb-0 pb-lg-5">
      <div className="container">
        <div className="row g-4 g-lg-5 align-items-center">

          {/* Left Content */}
          <div className="col-lg-6 position-relative z-index-9">

            {/* Badge */}
            <span className="badge bg-primary bg-opacity-10 text-primary mb-3">
              Platform Digital Terintegrasi
            </span>

            {/* Heading */}
            <h1 className="display-4 fw-bold mb-4">
              SMAN 1 Pamekasan
              <span className="text-primary d-block">
                Smart School Platform
              </span>
            </h1>

            {/* Description */}
            <p className="lead text-muted mb-4">
              Sistem informasi sekolah berbasis digital untuk mendukung
              pembelajaran, administrasi, monitoring akademik, dan layanan
              sekolah secara terintegrasi.
            </p>

            {/* Buttons */}
            <div className="d-flex flex-wrap gap-3">

              <button
                className="btn btn-primary btn-lg"
                onClick={onLoginClick}
              >
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Masuk Sistem
              </button>

              <a
                href="#fitur"
                className="btn btn-outline-secondary btn-lg"
              >
                Jelajahi Fitur
              </a>
            </div>

            {/* Stats */}
            <div className="row g-4 mt-5">

              <div className="col-sm-4">
                <div className="text-center text-sm-start">
                  <h3 className="fw-bold text-primary mb-0">1000+</h3>
                  <p className="mb-0 text-muted">Siswa Aktif</p>
                </div>
              </div>

              <div className="col-sm-4">
                <div className="text-center text-sm-start">
                  <h3 className="fw-bold text-primary mb-0">50+</h3>
                  <p className="mb-0 text-muted">Tenaga Pengajar</p>
                </div>
              </div>

              <div className="col-sm-4">
                <div className="text-center text-sm-start">
                  <h3 className="fw-bold text-primary mb-0">24/7</h3>
                  <p className="mb-0 text-muted">Akses Sistem</p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Image */}
          <div className="col-lg-6 text-center position-relative">

            {/* Main Image */}
            <img
              src="/assets/images/hero-school.png"
              className="img-fluid rounded-4 shadow-lg"
              alt="SMAN 1 Pamekasan"
            />

            {/* Floating Card */}
            <div
              className="card shadow border-0 p-3 position-absolute bg-white"
              style={{
                bottom: "30px",
                left: "0",
                maxWidth: "250px",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="icon-lg bg-success bg-opacity-10 rounded-circle text-success">
                  <i className="bi bi-mortarboard-fill"></i>
                </div>

                <div className="text-start">
                  <h6 className="mb-1 fw-bold">
                    Sistem Akademik
                  </h6>

                  <small className="text-muted">
                    Terintegrasi & realtime
                  </small>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
