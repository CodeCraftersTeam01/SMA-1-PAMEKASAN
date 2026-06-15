import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.smansa.m-tech.fun";
const API_KEY = import.meta.env.VITE_API_KEY || "smansa-secure-key-2026";

const parseFeatures = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(raw).split(",").map((s) => s.trim()).filter(Boolean);
  }
};

export default function ProgramsSection() {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    let active = true;
    const fetchPrograms = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/programs`, {
          headers: { "x-api-key": API_KEY },
        });
        if (res.ok) {
          const json = await res.json();
          if (active && Array.isArray(json?.data)) setPrograms(json.data);
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
      }
    };
    fetchPrograms();
    return () => {
      active = false;
    };
  }, []);

  if (!programs.length) return null;

  return (
    <section id="program" className="py-10 bg-white border-bottom border-light">
      <div className="container py-5">
        <div className="row mb-5 text-center justify-content-center">
          <div className="col-lg-8 reveal">
            <span className="section-tag">Program Unggulan</span>
            <h2 className="display-6 fw-800 mb-0">Program Jurusan</h2>
          </div>
        </div>

        <div className="row g-4 mt-2">
          {programs.map((p, i) => {
            const features = parseFeatures(p.features_json);
            return (
              <div className="col-md-6 col-lg-4" key={p.id || i}>
                <div className="card h-100 p-4 border-0 shadow-sm reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="card-body p-2">
                    <h5 className="fw-900 text-dark mb-3" style={{ fontSize: '1.25rem' }}>{p.title}</h5>
                    <p className="text-muted small fw-500 lh-lg mb-3">{p.description}</p>
                    {features.length > 0 && (
                      <ul className="list-unstyled mb-0">
                        {features.map((f, fi) => (
                          <li key={fi} className="text-muted small mb-1 d-flex align-items-center gap-2">
                            <i className="bi bi-check-circle-fill text-primary"></i>
                            {typeof f === 'object' ? f.title : f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
