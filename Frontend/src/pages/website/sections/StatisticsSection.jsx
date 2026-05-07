const statistics = [
  {
    value: "1000+",
    label: "Siswa Aktif",
    icon: "bi bi-people-fill",
  },
  {
    value: "50+",
    label: "Tenaga Pengajar",
    icon: "bi bi-person-badge-fill",
  },
  {
    value: "24/7",
    label: "Akses Sistem",
    icon: "bi bi-clock-history",
  },
  {
    value: "1",
    label: "Platform Terintegrasi",
    icon: "bi bi-grid-1x2-fill",
  },
];

export default function StatisticsSection() {
  return (
    <section className="py-5 bg-light">
      <div className="container">
        <div className="row g-4">
          {statistics.map((item, index) => (
            <div className="col-6 col-lg-3" key={index}>
              <div className="card border-0 shadow-sm rounded-4 h-100 text-center">
                <div className="card-body p-4">
                  <div className="icon-lg bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                    <i className={`${item.icon} fs-4`}></i>
                  </div>

                  <h3 className="fw-bold text-primary mb-1">{item.value}</h3>
                  <p className="text-muted mb-0">{item.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
