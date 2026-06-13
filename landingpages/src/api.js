/**
 * api.js — Centralized API Layer
 * SMAN 1 Pamekasan · BackendLumen Integration
 */

export const API_BASE_URL = 'http://127.0.0.1:8000';

// ─── Core fetch helper ────────────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 8000);

  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw Object.assign(new Error(err.message ?? `HTTP ${res.status}`), { status: res.status, data: err });
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// ─── Public Endpoints ──────────────────────────────────────────────────────────

/** GET /api/public/news — 3 berita terbaru */
export async function getLatestNews() {
  const json = await apiFetch('/api/public/news');
  return json.data ?? [];
}

/** GET /api/public/achievements */
export async function getAchievements() {
  const json = await apiFetch('/api/public/achievements');
  return json.data ?? [];
}

/** GET /api/public/facilities */
export async function getFacilities() {
  const json = await apiFetch('/api/public/facilities');
  return json.data ?? [];
}

/** GET /api/public/testimonials */
export async function getTestimonials() {
  const json = await apiFetch('/api/public/testimonials');
  return json.data ?? [];
}

/**
 * GET /api/home — Statistik homepage
 * Endpoint hipotetis; fallback ke data statis jika belum ada.
 */
export async function getHomeStats() {
  try {
    const json = await apiFetch('/api/home');
    return json.data ?? null;
  } catch {
    return { siswa_aktif: 1247, guru_aktif: 84, alumni: 8500, prestasi: 157 };
  }
}

// ─── Auth Endpoints ────────────────────────────────────────────────────────────

/**
 * POST /api/login
 * @returns {{ token: string, user: object }}
 */
export async function loginUser(email, password) {
  const json = await apiFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return json;
}

/** POST /api/logout */
export async function logoutUser() {
  await apiFetch('/api/logout', { method: 'POST' });
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

// ─── Promotions (Carousel) ─────────────────────────────────────────────────────

/**
 * GET /api/promotions — Data carousel promosi sekolah
 * Fallback ke data statis jika endpoint belum tersedia.
 */
export async function getPromotions() {
  try {
    const json = await apiFetch('/api/promotions');
    return json.data ?? [];
  } catch {
    // Static fallback — ganti image_url dengan asset nyata dari backend nanti
    return [
      {
        id: 1,
        title: 'Pendaftaran Siswa Baru 2025/2026',
        subtitle: 'Kuota terbatas. Daftarkan diri Anda sekarang dan raih masa depan bersama kami.',
        cta_label: 'Daftar Sekarang',
        cta_url: '#ppdb',
        image_url: null,
        bg_gradient: 'from-teal-900 via-teal-800 to-slate-900',
      },
      {
        id: 2,
        title: 'Medali Emas Olimpiade Sains Nasional',
        subtitle: 'Siswa SMAN 1 Pamekasan raih medali emas OSN bidang Matematika tingkat Nasional 2024.',
        cta_label: 'Baca Selengkapnya',
        cta_url: '#berita',
        image_url: null,
        bg_gradient: 'from-slate-900 via-indigo-900 to-slate-900',
      },
      {
        id: 3,
        title: 'Akreditasi A+ · Standar Nasional',
        subtitle: 'Diakui oleh BAN-S/M sebagai sekolah dengan mutu pendidikan tertinggi di Kabupaten Pamekasan.',
        cta_label: 'Lihat Profil Sekolah',
        cta_url: '#profil',
        image_url: null,
        bg_gradient: 'from-emerald-900 via-teal-900 to-slate-900',
      },
    ];
  }
}
