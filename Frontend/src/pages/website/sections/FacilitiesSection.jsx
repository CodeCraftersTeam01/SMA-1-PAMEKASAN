import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.smansa.m-tech.fun";
const API_KEY = import.meta.env.VITE_API_KEY || "smansa-secure-key-2026";

const fallbackFacilities = [
  { name: "Laboratorium Komputer", description: "Fasilitas lab komputer modern dengan akses internet cepat untuk menunjang pembelajaran.", image_url: "" },
  { name: "Perpustakaan", description: "Koleksi buku lengkap dengan ruang baca yang nyaman dan ber-AC.", image_url: "" },
  { name: "Lapangan Olahraga", description: "Lapangan multifungsi untuk basket, futsal, dan voli.", image_url: "" }
];

export default function FacilitiesSection() {
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    let active = true;
    const fetchFacilities = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/facilities`, {
          headers: { "x-api-key": API_KEY },
        });
        if (res.ok) {
          const json = await res.json();
          if (active && Array.isArray(json?.data) && json.data.length > 0) {
            setFacilities(json.data);
          }
        }
      } catch (error) {
        console.error("Error fetching facilities:", error);
      }
    };
    fetchFacilities();
    return () => {
      active = false;
    };
  }, []);

  const items = facilities.length ? facilities : fallbackFacilities;

  const imageUrl = (img) => {
    if (!img) return "/assets/images/logo-smansa.png";
    if (/^https?:\/\//.test(img)) return img;
    return `${API_BASE_URL}/storage/${img}`;
  };

  return (
    <section id="fasilitas" className="py-10 bg-white border-bottom border-light">
      <div className="container py-5">
        <div className="row mb-5 text-center justify-content-center">
          <div className="col-lg-8 reveal">
            <span className="section-tag">Sarana & Prasarana</span>
            <h2 className="display-6 fw-800 mb-0">Fasilitas Sekolah</h2>
          </div>
        </div>

        <div className="row g-4 mt-2">
          {items.map((f, i) => (
            <div className="col-md-6 col-lg-4" key={f.id || i}>
              <div className="card h-100 border-0 shadow-sm reveal overflow-hidden" style={{ transitionDelay: `${i * 80}ms` }}>
                <img
                  src={imageUrl(f.image_url)}
                  alt={f.name}
                  className="w-100"
                  style={{ aspectRatio: "16 / 10", objectFit: "cover" }}
                />
                <div className="card-body p-4">
                  <h5 className="fw-900 text-dark mb-2" style={{ fontSize: '1.15rem' }}>{f.name}</h5>
                  {f.description && (
                    <p className="text-muted small fw-500 lh-lg mb-0">{f.description}</p>
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
