import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.smansa.m-tech.fun";
const API_KEY = import.meta.env.VITE_API_KEY || "smansa-secure-key-2026";

export default function AchievementsSection() {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    let active = true;
    const fetchAchievements = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/achievements`, {
          headers: { "x-api-key": API_KEY },
        });
        if (res.ok) {
          const json = await res.json();
          if (active && Array.isArray(json?.data)) setAchievements(json.data);
        }
      } catch (error) {
        console.error("Error fetching achievements:", error);
      }
    };
    fetchAchievements();
    return () => {
      active = false;
    };
  }, []);

  if (!achievements.length) return null;

  return (
    <section id="prestasi" className="py-10 bg-soft border-bottom border-light">
      <div className="container py-5">
        <div className="row mb-5 text-center justify-content-center">
          <div className="col-lg-8 reveal">
            <span className="section-tag">Kebanggaan Kami</span>
            <h2 className="display-6 fw-800 mb-0">Prestasi Siswa</h2>
          </div>
        </div>

        <div className="row g-4 mt-2">
          {achievements.map((a, i) => (
            <div className="col-md-6 col-lg-4" key={a.id || i}>
              <div className="card h-100 p-4 border-0 shadow-sm reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="card-body p-2">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-trophy-fill text-warning" style={{ fontSize: '1.5rem' }}></i>
                    <div className="d-flex flex-wrap gap-2">
                      {a.level && <span className="badge bg-primary-subtle text-primary">{a.level}</span>}
                      {a.year && <span className="badge bg-secondary-subtle text-secondary">{a.year}</span>}
                    </div>
                  </div>
                  <h5 className="fw-900 text-dark mb-2" style={{ fontSize: '1.1rem' }}>{a.title}</h5>
                  {a.category && (
                    <p className="text-primary small fw-bold text-uppercase tracking-wider mb-2">{a.category}</p>
                  )}
                  {a.description && (
                    <p className="text-muted small fw-500 lh-lg mb-0">{a.description}</p>
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
