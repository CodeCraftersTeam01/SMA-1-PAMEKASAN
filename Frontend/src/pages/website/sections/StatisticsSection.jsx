export default function StatisticsSection({ stats }) {
  return (
    <section className="py-5 bg-soft border-top border-bottom border-light">
      <div className="container py-4 text-center">
        <div className="row g-5 animate-fade-in-up">
          <div className="col-md-4">
            <div className="display-5 fw-800 text-dark mb-1">{stats?.total_siswa?.toLocaleString() || '0'}</div>
            <div className="small text-muted font-bold text-uppercase tracking-wider">Database Siswa</div>
            <p className="text-muted small mt-2">Data siswa aktif terverifikasi</p>
          </div>
          <div className="col-md-4">
            <div className="display-5 fw-800 text-dark mb-1">{stats?.total_pendaftar?.toLocaleString() || '0'}</div>
            <div className="small text-muted font-bold text-uppercase tracking-wider">Antrian Pendaftar</div>
            <p className="text-muted small mt-2">Calon siswa dalam sistem</p>
          </div>
          <div className="col-md-4">
            <div className="display-5 fw-800 text-dark mb-1">{stats?.total_admin?.toLocaleString() || '0'}</div>
            <div className="small text-muted font-bold text-uppercase tracking-wider">Akses Pengelola</div>
            <p className="text-muted small mt-2">Administrator sistem aktif</p>
          </div>
        </div>
      </div>
    </section>
  );
}
