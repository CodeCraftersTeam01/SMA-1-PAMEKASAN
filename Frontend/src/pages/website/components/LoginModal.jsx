import { useState } from "react";

export default function LoginModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        body: JSON.stringify({
          email,
          password,
        }),
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

     localStorage.setItem("token", data.token);

     if (data.user) {
         localStorage.setItem("user", JSON.stringify(data.user));
     }

        window.location.href = "/dashboard";
    } catch (err) {
      setError("Tidak dapat terhubung ke server. Periksa koneksi atau API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow-lg">

            {/* Header */}
            <div className="modal-header border-0 pb-0">
              <div>
                <h5 className="modal-title fw-bold mb-1">
                  Login Sistem
                </h5>

                <small className="text-muted">
                  Masuk menggunakan akun yang telah terdaftar.
                </small>
              </div>

              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={loading}
              ></button>
            </div>

            {/* Body */}
            <form onSubmit={handleLogin}>
              <div className="modal-body pt-4">

                {error && (
                  <div className="alert alert-danger py-2" role="alert">
                    {error}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Email
                  </label>

                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>

                    <input
                      type="email"
                      className="form-control"
                      placeholder="Masukkan email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Password
                  </label>

                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>

                    <input
                      type="password"
                      className="form-control"
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                    />

                    <label
                      className="form-check-label small text-muted"
                      htmlFor="rememberMe"
                    >
                      Ingat saya
                    </label>
                  </div>

                  <a href="#" className="small text-decoration-none">
                    Lupa password?
                  </a>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={onClose}
                  disabled={loading}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Masuk
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </>
  );
}
