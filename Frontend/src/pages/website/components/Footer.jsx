export default function Footer() {
  return (
    <footer id="kontak" className="py-10 bg-white border-top border-light">
      <div className="container">
        <div className="row g-5">
          
          {/* Brand & Mission */}
          <div className="col-lg-5">
            <div className="d-flex align-items-center gap-3 mb-4">
              <img
                src="/assets/images/logo-smansa.png"
                alt="SMAN 1 Pamekasan"
                style={{ height: "48px" }}
              />
              <div>
                <h4 className="fw-900 text-dark mb-0">SMAN 1 PAMEKASAN</h4>
                <div className="small text-primary fw-800 tracking-widest">SMART SCHOOL SYSTEM</div>
              </div>
            </div>
            <p className="text-muted mb-4 fs-6 lh-lg" style={{ maxWidth: '400px' }}>
              Mewujudkan ekosistem pendidikan digital yang transparan dan akuntabel melalui integrasi data yang cerdas dan efisien.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="bg-soft p-2 rounded-circle text-dark hover-bg-primary hover-text-white transition-all"><i className="bi bi-facebook"></i></a>
              <a href="#" className="bg-soft p-2 rounded-circle text-dark hover-bg-primary hover-text-white transition-all"><i className="bi bi-instagram"></i></a>
              <a href="#" className="bg-soft p-2 rounded-circle text-dark hover-bg-primary hover-text-white transition-all"><i className="bi bi-twitter"></i></a>
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="col-lg-7">
            <div className="row g-4">
              <div className="col-md-4">
                <h6 className="fw-800 text-dark mb-4 text-uppercase tracking-widest" style={{ fontSize: '12px' }}>Navigasi</h6>
                <ul className="list-unstyled space-y-2">
                  <li><a href="#" className="text-muted text-decoration-none small hover-text-dark transition-all">Beranda</a></li>
                  <li><a href="#fitur" className="text-muted text-decoration-none small hover-text-dark transition-all">Fitur Utama</a></li>
                  <li><a href="#akademik" className="text-muted text-decoration-none small hover-text-dark transition-all">Sistem Layanan</a></li>
                  <li><a href="#galeri" className="text-muted text-decoration-none small hover-text-dark transition-all">Galeri Sekolah</a></li>
                </ul>
              </div>
              <div className="col-md-4">
                <h6 className="fw-800 text-dark mb-4 text-uppercase tracking-widest" style={{ fontSize: '12px' }}>Modul Dashboard</h6>
                <ul className="list-unstyled space-y-2">
                  <li><a href="#" className="text-muted text-decoration-none small hover-text-dark transition-all">Data Siswa</a></li>
                  <li><a href="#" className="text-muted text-decoration-none small hover-text-dark transition-all">Pendaftaran Baru</a></li>
                  <li><a href="#" className="text-muted text-decoration-none small hover-text-dark transition-all">Laporan Harian</a></li>
                  <li><a href="#" className="text-muted text-decoration-none small hover-text-dark transition-all">Manajemen User</a></li>
                </ul>
              </div>
              <div className="col-md-4">
                <h6 className="fw-800 text-dark mb-4 text-uppercase tracking-widest" style={{ fontSize: '12px' }}>Hubungi Kami</h6>
                <ul className="list-unstyled space-y-2">
                  <li className="text-muted small">Jl. Kabupaten No. 1, Pamekasan, Jawa Timur</li>
                  <li className="text-muted small">info@smansa.sch.id</li>
                  <li className="text-muted small">+62 324-000-000</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-5 border-top border-light d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <p className="text-muted small mb-0">© 2026 SMAN 1 Pamekasan. Dikembangkan untuk kemajuan pendidikan.</p>
          <div className="d-flex gap-4">
            <a href="#" className="text-muted text-decoration-none small hover-text-dark">Privacy Policy</a>
            <a href="#" className="text-muted text-decoration-none small hover-text-dark">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
