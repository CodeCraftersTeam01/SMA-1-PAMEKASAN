import { Link } from "react-router-dom";

export default function Navbar({ onLoginClick, isScrolled, isLoginOpen }) {
  return (
    <div className={`navbar-container ${isLoginOpen ? 'is-blurred' : ''}`}>
      <nav className={`navbar navbar-expand-md transition-all ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container-fluid px-0">
          
          {/* Branding - Bold & Minimal */}
          <Link className="navbar-brand d-flex align-items-center gap-3" to="/">
            <img
              src="/assets/images/logo-smansa.png"
              alt="SMAN 1 Pamekasan"
              style={{ height: "30px" }}
            />
            <div className="d-flex flex-column lh-1">
              <span className="fw-900 text-dark tracking-tighter" style={{ fontSize: '15px' }}>
                SMAN 1 PAMEKASAN
              </span>
              <span className="text-primary fw-800 tracking-widest" style={{ fontSize: '8px' }}>
                SMART SCHOOL
              </span>
            </div>
          </Link>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler border-0 p-0 shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="bi bi-grid-fill fs-4 text-dark"></i>
          </button>

          {/* Navigation Links */}
          <div className="d-none d-md-flex flex-grow-1 align-items-center justify-content-between w-100" id="navbarCollapse">
            <ul className="navbar-nav mx-auto d-flex flex-row align-items-center justify-content-center" style={{ gap: '2rem' }}>
              <li className="nav-item">
                <a className="nav-link fw-medium" href="/" style={{ color: '#1e293b', fontSize: '14px', opacity: 1, padding: '0.5rem' }}>Beranda</a>
              </li>
              <li className="nav-item">
                <a className="nav-link fw-medium" href="#fitur" style={{ color: '#1e293b', fontSize: '14px', opacity: 0.7, padding: '0.5rem' }}>Fitur</a>
              </li>
              <li className="nav-item">
                <a className="nav-link fw-medium" href="#pengumuman" style={{ color: '#1e293b', fontSize: '14px', opacity: 0.7, padding: '0.5rem' }}>Informasi</a>
              </li>
              <li className="nav-item">
                <a className="nav-link fw-medium" href="#kontak" style={{ color: '#1e293b', fontSize: '14px', opacity: 0.7, padding: '0.5rem' }}>Kontak</a>
              </li>
            </ul>

            {/* CTA Login */}
            <div className="ms-auto d-flex align-items-center mt-3 mt-md-0">
              <button
                className="btn btn-primary px-4 py-2 rounded-pill shadow-sm"
                onClick={onLoginClick}
                style={{ fontSize: '12px', backgroundColor: '#1e293b', border: 'none', color: '#ffffff' }}
              >
                <span className="fw-800 tracking-widest">SIGN IN</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
