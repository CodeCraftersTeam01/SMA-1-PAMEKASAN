import useLandingSettings from "../hooks/useLandingSettings";

export default function SambutanSection() {
  const { settings, API_BASE_URL } = useLandingSettings();

  // Don't render the section if there's no sambutan content yet
  if (!settings || (!settings.headmaster_message && !settings.headmaster_name)) {
    return null;
  }

  const photo = settings.headmaster_photo
    ? `${API_BASE_URL}/storage/${settings.headmaster_photo}`
    : "/assets/images/logo-smansa.png";

  return (
    <section id="sambutan" className="py-10 bg-white border-bottom border-light">
      <div className="container py-5">
        <div className="row mb-5 text-center justify-content-center">
          <div className="col-lg-8 reveal">
            <span className="section-tag">Kata Sambutan</span>
            <h2 className="display-6 fw-800 mb-0">Sambutan Kepala Sekolah</h2>
          </div>
        </div>

        <div className="row align-items-center g-5 justify-content-center">
          {/* Foto Kepala Sekolah */}
          <div className="col-lg-4 text-center reveal">
            <div className="position-relative d-inline-block">
              <img
                src={photo}
                alt={settings.headmaster_name || "Kepala Sekolah"}
                className="img-fluid rounded-4 shadow-lg"
                style={{
                  width: "100%",
                  maxWidth: "320px",
                  aspectRatio: "3 / 4",
                  objectFit: "cover",
                }}
              />
            </div>
            <h5 className="fw-900 text-dark mt-4 mb-1">
              {settings.headmaster_name || "Kepala Sekolah"}
            </h5>
            {settings.headmaster_title && (
              <p className="text-primary fw-bold small text-uppercase tracking-wider mb-0">
                {settings.headmaster_title}
              </p>
            )}
          </div>

          {/* Teks Sambutan */}
          <div className="col-lg-7 reveal" style={{ transitionDelay: "150ms" }}>
            <i className="bi bi-quote text-primary" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
            <div
              className="text-muted fs-5 fw-500 lh-lg"
              style={{ whiteSpace: "pre-line" }}
            >
              {settings.headmaster_message}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
