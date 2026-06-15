import LightRays from './LightRays';
import useLandingSettings from '../hooks/useLandingSettings';

export default function Hero({ onLoginClick, stats }) {
  const { settings } = useLandingSettings();

  const title = settings?.hero_title;
  const subtitle = settings?.hero_subtitle;
  const ppdbLink = settings?.ppdb_link;
  const videoLink = settings?.video_link;

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
              {title ? (
                title
              ) : (
                <>
                  Satu Ekosistem. <br />
                  <span className="text-gradient">Satu Kendali Sekolah.</span>
                </>
              )}
            </h1>

            <p className="lead text-muted mb-5 mx-auto" style={{ maxWidth: '650px', fontSize: '1.2rem', fontWeight: 500 }}>
              {subtitle ||
                'Optimalkan tata kelola SMAN 1 Pamekasan dengan sistem dashboard terintegrasi yang akurat, transparan, dan mudah digunakan.'}
            </p>

            <div className="d-flex justify-content-center gap-3 mb-5 flex-wrap">
              {ppdbLink ? (
                <a
                  href={ppdbLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary px-5 py-3 shadow-sm"
                >
                  Pendaftaran (PPDB)
                </a>
              ) : (
                <button
                  className="btn btn-primary px-5 py-3 shadow-sm"
                  onClick={onLoginClick}
                >
                  Mulai Sekarang
                </button>
              )}
              <a
                href={videoLink || '#fitur'}
                target={videoLink ? '_blank' : undefined}
                rel={videoLink ? 'noopener noreferrer' : undefined}
                className="btn btn-light border px-5 py-3 text-dark fw-bold shadow-sm"
                style={{ background: '#fff' }}
              >
                {videoLink ? 'Tonton Video Profil' : 'Pelajari Fitur'}
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
