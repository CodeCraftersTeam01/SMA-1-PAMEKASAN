/**
 * ui.js — UI Rendering & Component Logic
 * Carousel, Stats, News, Facilities, Navbar scroll
 */

import { API_BASE_URL, getPromotions, getHomeStats, getLatestNews } from './api.js';

// ─── Helpers ───────────────────────────────────────────
const $ = id => document.getElementById(id);
const imgSrc = (url, fallback) =>
  url ? `${API_BASE_URL}/storage/${url}` : fallback;

// ─── NAVBAR: Scroll shadow ─────────────────────────────
export function initNavbar() {
  const nav = document.getElementById('main-navbar');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('shadow-md', window.scrollY > 10);
  });

  // Mobile menu toggle
  $('mobile-menu-btn')?.addEventListener('click', () => {
    const menu = $('mobile-menu');
    menu?.classList.toggle('hidden');
  });
}

// ─── CAROUSEL ─────────────────────────────────────────
let carouselSlides = [];
let carouselIdx    = 0;
let carouselTimer  = null;

function renderCarouselSlides(slides) {
  const track = $('carousel-track');
  if (!track) return;
  track.innerHTML = slides.map((s, i) => `
    <div class="carousel-slide absolute inset-0 transition-opacity duration-700 ease-in-out ${i === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}"
         data-index="${i}">
      ${s.image_url
        ? `<img src="${API_BASE_URL}/storage/${s.image_url}" alt="${s.title}" class="absolute inset-0 w-full h-full object-cover"/>`
        : ''}
      <div class="absolute inset-0 bg-gradient-to-r ${s.bg_gradient ?? 'from-slate-900 to-teal-900'}"></div>
      <div class="relative z-10 h-full flex flex-col justify-center px-8 md:px-20 max-w-3xl">
        <span class="inline-block bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5">SMAN 1 Pamekasan</span>
        <h2 class="text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">${s.title}</h2>
        <p class="text-slate-300 text-base md:text-lg leading-relaxed mb-8 max-w-xl">${s.subtitle}</p>
        <a href="${s.cta_url ?? '#'}"
           class="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors w-fit">
          ${s.cta_label ?? 'Selengkapnya'}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
        </a>
      </div>
    </div>
  `).join('');
}

function renderCarouselDots(slides) {
  const dots = $('carousel-dots');
  if (!dots) return;
  dots.innerHTML = slides.map((_, i) => `
    <button data-dot="${i}" class="carousel-dot w-2 h-2 rounded-full transition-all duration-300 ${i === 0 ? 'bg-white w-6' : 'bg-white/40'}"></button>
  `).join('');
  dots.querySelectorAll('.carousel-dot').forEach(btn => {
    btn.addEventListener('click', () => goToSlide(parseInt(btn.dataset.dot)));
  });
}

function goToSlide(idx) {
  const allSlides = document.querySelectorAll('.carousel-slide');
  const allDots   = document.querySelectorAll('.carousel-dot');
  if (!allSlides.length) return;

  allSlides.forEach(s => { s.classList.replace('opacity-100', 'opacity-0'); s.classList.replace('z-10','z-0'); });
  allDots.forEach(d => { d.classList.remove('bg-white','w-6'); d.classList.add('bg-white/40','w-2'); });

  carouselIdx = (idx + carouselSlides.length) % carouselSlides.length;
  allSlides[carouselIdx]?.classList.replace('opacity-0', 'opacity-100');
  allSlides[carouselIdx]?.classList.replace('z-0', 'z-10');
  const activeDot = allDots[carouselIdx];
  activeDot?.classList.remove('bg-white/40','w-2');
  activeDot?.classList.add('bg-white','w-6');
}

function startAutoplay() {
  stopAutoplay();
  carouselTimer = setInterval(() => goToSlide(carouselIdx + 1), 5000);
}

function stopAutoplay() {
  if (carouselTimer) clearInterval(carouselTimer);
}

export async function loadCarouselData() {
  const skeleton = $('carousel-skeleton');

  try {
    carouselSlides = await getPromotions();
    if (!carouselSlides.length) return;

    renderCarouselSlides(carouselSlides);
    renderCarouselDots(carouselSlides);

    // Arrow controls
    $('carousel-prev')?.addEventListener('click', () => { goToSlide(carouselIdx - 1); startAutoplay(); });
    $('carousel-next')?.addEventListener('click', () => { goToSlide(carouselIdx + 1); startAutoplay(); });

    // Pause on hover
    $('carousel-track')?.addEventListener('mouseenter', stopAutoplay);
    $('carousel-track')?.addEventListener('mouseleave', startAutoplay);

    // Touch swipe
    let touchStartX = 0;
    $('carousel-track')?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    $('carousel-track')?.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goToSlide(diff > 0 ? carouselIdx + 1 : carouselIdx - 1);
    }, { passive: true });

    startAutoplay();
  } catch (e) {
    console.error('Carousel load failed:', e);
  } finally {
    skeleton?.classList.add('hidden');
  }
}

// ─── STATS ────────────────────────────────────────────
export async function loadHomepageStats() {
  const container = $('stats-container');
  if (!container) return;

  try {
    const s = await getHomeStats();
    const items = [
      { value: s.siswa_aktif?.toLocaleString('id-ID') ?? '1.247', label: 'Siswa Aktif', icon: '👨‍🎓' },
      { value: s.guru_aktif?.toLocaleString('id-ID')  ?? '84',    label: 'Guru & Staff', icon: '👨‍🏫' },
      { value: s.alumni?.toLocaleString('id-ID')      ?? '8.500+',label: 'Alumni',        icon: '🎓' },
      { value: s.prestasi?.toLocaleString('id-ID')    ?? '157',   label: 'Prestasi',      icon: '🏆' },
    ];
    container.innerHTML = items.map(it => `
      <div class="text-center p-6">
        <div class="text-3xl mb-2">${it.icon}</div>
        <div class="text-4xl font-extrabold text-[#333333] tracking-tight">${it.value}</div>
        <div class="text-sm text-[#717171] mt-1 font-medium">${it.label}</div>
      </div>
    `).join('');
  } catch {
    container.innerHTML = '<p class="col-span-4 text-center text-sm text-[#717171]">Gagal memuat statistik.</p>';
  }
}

// ─── NEWS ─────────────────────────────────────────────
function fmtDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

const CAT_COLOR = {
  Prestasi: 'bg-teal-50 text-teal-700',
  PPDB:     'bg-indigo-50 text-indigo-700',
  umum:     'bg-amber-50 text-amber-700',
};

export async function loadLatestNews() {
  const grid = $('news-grid');
  if (!grid) return;

  try {
    const news = await getLatestNews();
    if (!news.length) throw new Error('empty');
    grid.innerHTML = news.map(n => `
      <article class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-[#008080]/40 hover:-translate-y-0.5 transition-all duration-200 group">
        <div class="h-44 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-5xl">
          ${n.category === 'Prestasi' ? '🏆' : n.category === 'PPDB' ? '📋' : '📰'}
        </div>
        <div class="p-5">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${CAT_COLOR[n.category] ?? 'bg-gray-100 text-gray-600'}">${n.category}</span>
            <span class="text-xs text-[#717171]">${fmtDate(n.published_at)}</span>
          </div>
          <h3 class="font-bold text-[#333333] text-base leading-snug mb-2 group-hover:text-[#008080] transition-colors">${n.title}</h3>
          <p class="text-sm text-[#717171] leading-relaxed line-clamp-2">${n.excerpt}</p>
          <a href="#" class="inline-flex items-center gap-1 text-xs font-semibold text-[#008080] mt-4 hover:underline">
            Baca Selengkapnya
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </a>
        </div>
      </article>
    `).join('');
  } catch {
    grid.innerHTML = '<p class="col-span-3 text-center text-sm text-[#717171] py-8">Tidak ada berita saat ini.</p>';
  }
}
