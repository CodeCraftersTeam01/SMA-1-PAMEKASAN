import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";

export default function LoginModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  if (!open) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://api.smansa.m-tech.fun";
      const response = await fetch(`${apiBaseUrl}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Email atau password salah.");
        return;
      }

      if (!data.token) {
        setError("Token login tidak ditemukan dari server.");
        return;
      }

      login(data.user, data.token, true);
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Tidak dapat terhubung ke server. Periksa koneksi atau API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop with Maximum Glassmorphism Blur */}
      <div
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1040, 
          backgroundColor: 'rgba(15, 23, 42, 0.25)', /* Sangat transparan agar blur terlihat jelas */
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          transition: 'all 0.3s ease-in-out'
        }}
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
          <div className="modal-content border-0 rounded-5 shadow-2xl overflow-hidden bg-white">
            
            {/* Minimalist Header */}
            <div className="modal-header border-0 pt-5 pb-4 px-5 d-flex flex-column align-items-start">
               <h3 className="fw-900 text-dark mb-1" style={{ letterSpacing: '-0.04em' }}>Sign In</h3>
               <p className="text-muted small fw-500 mb-0">Selamat datang kembali di Smart School.</p>
               <button
                  type="button"
                  className="btn-close shadow-none position-absolute"
                  style={{ top: '2rem', right: '2rem', opacity: 0.3 }}
                  onClick={onClose}
                  disabled={loading}
               ></button>
            </div>

            {/* Body */}
            <form onSubmit={handleLogin} className="px-5 pb-5">
              <div className="modal-body p-0">
                {error && (
                  <div className="alert alert-danger py-3 border-0 rounded-4 small mb-4 animate-fade-in-up" style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
                    <i className="bi bi-exclamation-circle-fill me-2"></i>
                    {error}
                  </div>
                )}

                <div className="mb-4">
                  <label className="form-label small fw-800 text-dark text-uppercase tracking-widest mb-2" style={{ fontSize: '10px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control bg-soft border-light py-3 px-3 rounded-4 shadow-none fw-500"
                    placeholder="name@school.id"
                    style={{ fontSize: '14px', border: '1px solid #f1f5f9' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-800 text-dark text-uppercase tracking-widest mb-2" style={{ fontSize: '10px' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control bg-soft border-light py-3 px-3 rounded-4 shadow-none fw-500"
                    placeholder="••••••••"
                    style={{ fontSize: '14px', border: '1px solid #f1f5f9' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-5">
                  <div className="form-check">
                    <input
                      className="form-check-input shadow-none"
                      type="checkbox"
                      id="rememberMe"
                    />
                    <label
                      className="form-check-label small text-muted fw-500 cursor-pointer"
                      htmlFor="rememberMe"
                      style={{ fontSize: '12px' }}
                    >
                      Ingat saya
                    </label>
                  </div>
                  <a href="#" className="small text-dark fw-800 text-decoration-none" style={{ fontSize: '12px' }}>
                    Lupa Password?
                  </a>
                </div>
              </div>

              {/* Action Button - Elegant & Bold */}
              <button
                type="submit"
                className="btn btn-primary w-100 py-3 rounded-4 d-flex align-items-center justify-content-center gap-3"
                disabled={loading}
                style={{ backgroundColor: '#1e293b', border: 'none' }}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  <span className="fw-800 text-uppercase tracking-widest" style={{ fontSize: '12px' }}>Akses Dashboard</span>
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </>
  );
}
