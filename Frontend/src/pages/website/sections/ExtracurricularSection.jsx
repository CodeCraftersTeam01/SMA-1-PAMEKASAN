import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.smansa.m-tech.fun";
const API_KEY = import.meta.env.VITE_API_KEY || "smansa-secure-key-2026";

export default function ExtracurricularSection() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/public/extracurriculars`, {
          headers: { "x-api-key": API_KEY },
        });
        if (res.data && active) {
          const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data.data) ? res.data.data : []);
          setItems(data);
        }
      } catch (error) {
        console.error("Error fetching extracurriculars:", error);
      }
    };
    fetchItems();
    return () => {
      active = false;
    };
  }, []);

  if (!items.length) return null;

  const imageUrl = (img) => {
    if (!img) return "https://placehold.co/600x400?text=Ekstrakurikuler";
    if (/^https?:\/\//.test(img)) return img;
    return `${API_BASE_URL}/storage/${img}`;
  };

  return (
    <section id="ekstrakurikuler" className="py-10 bg-light border-bottom border-light">
      <div className="container py-5">
        <div className="row mb-5 text-center justify-content-center">
          <div className="col-lg-8 reveal">
            <span className="section-tag">Pengembangan Diri</span>
            <h2 className="display-6 fw-800 mb-0">Kegiatan Ekstrakurikuler</h2>
          </div>
        </div>

        <div className="row g-4 mt-2">
          {items.map((item, i) => (
            <div className="col-md-6 col-lg-4" key={item.id || i}>
              <div className="card h-100 border-0 shadow-sm reveal overflow-hidden" style={{ transitionDelay: `${i * 80}ms` }}>
                <img
                  src={imageUrl(item.image_path)}
                  alt={item.name}
                  className="w-100"
                  style={{ aspectRatio: "16 / 10", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/600x400?text=Ekstrakurikuler";
                  }}
                />
                <div className="card-body p-4">
                  <h5 className="fw-900 text-dark mb-2" style={{ fontSize: '1.15rem' }}>{item.name}</h5>
                  {item.description && (
                    <p className="text-muted small fw-500 lh-lg mb-0">{item.description}</p>
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
