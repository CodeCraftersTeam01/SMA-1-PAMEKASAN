import { Link } from "react-router-dom";

export default function Navbar({ onLoginClick }) {
  return (
    <header className="navbar-light navbar-sticky header-static bg-white shadow-sm">
      <nav className="navbar navbar-expand-xl">
        <div className="container">
          {/* Logo */}
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <img
              src="/assets/images/logo-smansa.png"
              alt="SMAN 1 Pamekasan"
              style={{ height: "45px" }}
            />

            <div className="d-flex flex-column lh-sm">
              <span className="fw-bold text-dark">
                SMAN 1 Pamekasan
              </span>

              <small className="text-muted">
                Integrated School Platform
              </small>
            </div>
          </Link>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler ms-auto"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-animation">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {/* Menu */}
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <ul className="navbar-nav navbar-nav-scroll ms-auto">
              <li className="nav-item">
                <a className="nav-link active" href="#">
                  Beranda
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#fitur">
                  Fitur
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#pengumuman">
                  Pengumuman
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#kontak">
                  Kontak
                </a>
              </li>
            </ul>

            {/* Login Button */}
            <div className="ms-xl-3 mt-3 mt-xl-0">
              <button
                className="btn btn-primary mb-0"
                onClick={onLoginClick}
              >
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
