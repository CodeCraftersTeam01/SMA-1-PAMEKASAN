/**
 * main.js — Entry point
 * Bootstraps semua modul setelah DOM siap.
 */

import './style.css';
import { initNavbar, loadCarouselData, loadHomepageStats, loadLatestNews } from './ui.js';
import { initAuth } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  // ── 1. Navbar scroll & mobile menu
  initNavbar();

  // ── 2. Login modal bindings
  initAuth();

  // ── 3. Carousel banner
  loadCarouselData();

  // ── 4. Stats
  loadHomepageStats();

  // ── 5. Berita terbaru
  loadLatestNews();
});
