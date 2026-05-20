import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";

export default function LoginModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  if (!open) return null;

  const handleLoginGuru = async (e) => {
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

      login(data.user, data.token, rememberMe);
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Tidak dapat terhubung ke server. Periksa koneksi atau API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .hover-card-premium {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .hover-card-premium:hover {
          transform: translateY(-4px) !important;
          background-color: #ffffff !important;
          border-color: #cbd5e1 !important;
          box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.08), 0 10px 15px -6px rgba(0, 0, 0, 0.03) !important;
        }
      `}</style>

      {/* Backdrop with Maximum Glassmorphism Blur */}
      <div
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1040, 
          backgroundColor: 'rgba(15, 23, 42, 0.25)',
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
        <div 
          className="modal-dialog modal-dialog-centered" 
          style={{ 
            maxWidth: '400px',
            transition: 'max-width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div className="modal-content border-0 rounded-5 shadow-2xl overflow-hidden bg-white">
            
            {/* Minimalist Close Button */}
            <button
              type="button"
              className="btn-close shadow-none position-absolute"
              style={{ top: '2rem', right: '2rem', opacity: 0.3, zIndex: 10 }}
              onClick={onClose}
              disabled={loading}
            ></button>

            {/* SCREEN: Login Guru */}
            <div className="p-5">
              <div className="mb-4.5 mt-2">
                <h3 className="fw-900 text-dark mb-1" style={{ letterSpacing: '-0.04em', fontSize: '24px' }}>
                  Login Admin
                </h3>
                <p className="text-muted small fw-500 mb-0">
                  Masukkan email dan password untuk mengakses dashboard admin.
                </p>
              </div>

              {error && (
                <div className="alert alert-danger py-3 border-0 rounded-4 small mb-4.5 animate-fade-in-up" style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
                  <i className="bi bi-exclamation-circle-fill me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleLoginGuru} className="space-y-4">
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

                <div className="d-flex justify-content-between align-items-center mb-4.5">
                  <div className="form-check">
                    <input
                      className="form-check-input shadow-none cursor-pointer"
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label
                      className="form-check-label small text-muted fw-500 cursor-pointer"
                      htmlFor="rememberMe"
                      style={{ fontSize: '12px' }}
                    >
                      Ingat saya
                    </label>
                  </div>
                </div>

                {/* Action Button - Elegant & Bold */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-3.5 rounded-4 d-flex align-items-center justify-content-center gap-3 transition-all mb-3"
                  disabled={loading}
                  style={{ backgroundColor: '#1e293b', border: 'none', transition: 'all 0.2s ease' }}
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
      </div>
    </>
  );
}

