import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.smansa.m-tech.fun";
const API_KEY = import.meta.env.VITE_API_KEY || "smansa-secure-key-2026";

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

export default function AgendaSection() {
  const [agendas, setAgendas] = useState([]);

  useEffect(() => {
    let active = true;
    const fetchAgendas = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/academic-calendar`, {
          headers: { "x-api-key": API_KEY },
        });
        if (res.ok) {
          const json = await res.json();
          if (active && Array.isArray(json?.data)) {
            setAgendas(json.data);
          }
        }
      } catch (error) {
        console.error("Error fetching agendas:", error);
      }
    };
    fetchAgendas();
    return () => {
      active = false;
    };
  }, []);

  if (agendas.length === 0) return null;

  return (
    <section id="agenda" className="py-10 bg-white border-bottom border-light">
      <div className="container py-5">
        <div className="row mb-5 text-center justify-content-center">
          <div className="col-lg-8 reveal">
            <span className="section-tag">Kalender Akademik</span>
            <h2 className="display-6 fw-800 mb-0">Agenda Sekolah</h2>
          </div>
        </div>

        <div className="row justify-content-center mt-4">
          <div className="col-lg-10">
            <div className="row g-4">
              {agendas.map((item, i) => (
                <div className="col-md-6 col-lg-4" key={item.id || i}>
                  <div className="p-4 border border-light rounded-4 bg-soft hover-bg-white transition-all shadow-sm h-100 reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                    <div className="d-flex align-items-center mb-3 gap-2">
                      <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                        <i className="bi bi-calendar-event"></i>
                      </div>
                      <div>
                        <p className="text-primary font-bold text-sm mb-0 uppercase tracking-widest">{formatDate(item.event_date)}</p>
                      </div>
                    </div>
                    <h5 className="fw-bold mb-2 text-dark">{item.title}</h5>
                    {item.description && (
                      <p className="text-muted small mb-0 lh-lg">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
