import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.smansa.m-tech.fun";
const API_KEY = import.meta.env.VITE_API_KEY || "smansa-secure-key-2026";

export default function TeachersSection() {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    let active = true;
    const fetchTeachers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/teachers`, {
          headers: { "x-api-key": API_KEY },
        });
        if (res.ok) {
          const json = await res.json();
          if (active && Array.isArray(json?.data)) setTeachers(json.data);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };
    fetchTeachers();
    return () => {
      active = false;
    };
  }, []);

  if (!teachers.length) return null;

  const photoUrl = (photo) =>
    photo ? `${API_BASE_URL}/storage/${photo}` : "/assets/images/logo-smansa.png";

  return (
    <section id="guru" className="py-10 bg-soft border-bottom border-light">
      <div className="container py-5">
        <div className="row mb-5 text-center justify-content-center">
          <div className="col-lg-8 reveal">
            <span className="section-tag">Tenaga Pendidik</span>
            <h2 className="display-6 fw-800 mb-0">Guru & Staf Pengajar</h2>
          </div>
        </div>

        <div className="row g-4 mt-2 justify-content-center">
          {teachers.map((t, i) => (
            <div className="col-6 col-md-4 col-lg-3" key={t.id || i}>
              <div className="card h-100 border-0 shadow-sm text-center reveal overflow-hidden" style={{ transitionDelay: `${i * 80}ms` }}>
                <img
                  src={photoUrl(t.photo)}
                  alt={t.name}
                  className="w-100"
                  style={{ aspectRatio: "1 / 1", objectFit: "cover" }}
                />
                <div className="card-body p-3">
                  <h6 className="fw-900 text-dark mb-1" style={{ fontSize: '0.95rem' }}>{t.name}</h6>
                  {t.subject && (
                    <p className="text-muted small mb-0">{t.subject}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
