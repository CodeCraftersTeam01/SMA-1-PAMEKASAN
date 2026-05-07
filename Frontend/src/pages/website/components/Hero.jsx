import LightRays from './LightRays';

export default function Hero({ onLoginClick, stats }) {
  return (
    <section className="hero-section position-relative overflow-hidden">
      {/* Light Rays Background - Subtle Slate Color */}
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0, opacity: 0.5 }}>
        <LightRays
          raysOrigin="top-center"
          raysColor="#334155" // Back to subtle Slate-700
          raysSpeed={0.3}
          lightSpread={0.7}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.05}
          noiseAmount={0.02}
          distortion={0.1}
          pulsating={true}
          fadeDistance={0.8}
          saturation={0.5}
        />
      </div>

      <div className="container text-center position-relative z-1">
        <div className="row justify-content-center">
          <div className="col-lg-10 reveal">
            
            <div className="mb-4">
              <span className="section-tag">Digital Transformation</span>
            </div>

            <h1 className="hero-title">
              Satu Ekosistem. <br />
              <span className="text-gradient">Satu Kendali Sekolah.</span>
            </h1>

            <p className="lead text-muted mb-5 mx-auto" style={{ maxWidth: '650px', fontSize: '1.2rem', fontWeight: 500 }}>
              Optimalkan tata kelola SMAN 1 Pamekasan dengan sistem dashboard terintegrasi yang akurat, transparan, dan mudah digunakan.
            </p>

            <div className="d-flex justify-content-center gap-3 mb-5">
              <button
                className="btn btn-primary px-5 py-3 shadow-sm"
                onClick={onLoginClick}
              >
                Mulai Sekarang
              </button>
              <a
                href="#fitur"
                className="btn btn-light border px-5 py-3 text-dark fw-bold shadow-sm"
                style={{ background: '#fff' }}
              >
                Pelajari Fitur
              </a>
            </div>

            {/* Typography Stats - Bold & Minimal */}
            <div className="row g-4 mt-5 justify-content-center pt-5 border-top border-light">
              <div className="col-md-3">
                <div className="h3 fw-900 text-dark mb-0">{stats?.total_siswa?.toLocaleString() || '0'}</div>
                <div className="small text-muted font-bold text-uppercase tracking-widest" style={{ fontSize: '10px' }}>Total Siswa</div>
              </div>
              <div className="col-md-3">
                <div className="h3 fw-900 text-dark mb-0">{stats?.total_pendaftar?.toLocaleString() || '0'}</div>
                <div className="small text-muted font-bold text-uppercase tracking-widest" style={{ fontSize: '10px' }}>Pendaftar Aktif</div>
              </div>
              <div className="col-md-3">
                <div className="h3 fw-900 text-dark mb-0">{stats?.tahun_ajaran || '-'}</div>
                <div className="small text-muted font-bold text-uppercase tracking-widest" style={{ fontSize: '10px' }}>Tahun Ajaran</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
