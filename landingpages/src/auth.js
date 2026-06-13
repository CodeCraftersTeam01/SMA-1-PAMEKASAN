/**
 * auth.js — Login Modal & Authentication Logic
 * Mengelola: tampil/sembunyi modal, handleLogin, redirect, error UI.
 */

import { loginUser, API_BASE_URL } from './api.js';

// ─── State ─────────────────────────────────────────────
let isLoginOpen = false;

// ─── DOM Refs ──────────────────────────────────────────
const getEl = id => document.getElementById(id);

// ─── Show / Hide Modal ─────────────────────────────────
export function openLoginModal() {
  const modal   = getEl('login-modal');
  const overlay = getEl('modal-overlay');
  modal.classList.remove('translate-y-4', 'opacity-0', 'pointer-events-none');
  modal.classList.add('translate-y-0', 'opacity-100');
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  isLoginOpen = true;
  clearLoginError();
  getEl('login-email').focus();
}

export function closeLoginModal() {
  const modal   = getEl('login-modal');
  const overlay = getEl('modal-overlay');
  modal.classList.add('translate-y-4', 'opacity-0', 'pointer-events-none');
  modal.classList.remove('translate-y-0', 'opacity-100');
  overlay.classList.add('hidden');
  document.body.style.overflow = '';
  isLoginOpen = false;
}

// ─── Error UI ──────────────────────────────────────────
function showLoginError(msg) {
  const el = getEl('login-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

function clearLoginError() {
  const el = getEl('login-error');
  el.textContent = '';
  el.classList.add('hidden');
}

// ─── Button Loading State ──────────────────────────────
function setLoginLoading(loading) {
  const btn  = getEl('login-submit-btn');
  const spin = getEl('login-spinner');
  const txt  = getEl('login-btn-text');
  btn.disabled = loading;
  spin.classList.toggle('hidden', !loading);
  txt.textContent = loading ? 'Memverifikasi...' : 'Masuk ke Dashboard';
}

// ─── Handle Login Submit ───────────────────────────────
export async function handleLogin(e) {
  e.preventDefault();
  clearLoginError();

  const email    = getEl('login-email').value.trim();
  const password = getEl('login-password').value;

  if (!email || !password) {
    showLoginError('Email dan password tidak boleh kosong.');
    return;
  }

  setLoginLoading(true);
  try {
    const data = await loginUser(email, password);

    // Simpan token dan user ke localStorage
    const token = data.token ?? data.access_token;
    const user  = data.user ?? {};
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));

    // Redirect ke dashboard admin
    window.location.href = 'http://localhost:5173/dashboard';
  } catch (err) {
    if (err.status === 401 || err.status === 422) {
      showLoginError('Email atau password yang Anda masukkan salah. Periksa kembali.');
    } else if (err.name === 'AbortError') {
      showLoginError('Koneksi timeout. Pastikan server backend berjalan.');
    } else {
      showLoginError('Terjadi kesalahan. Silakan coba beberapa saat lagi.');
    }
  } finally {
    setLoginLoading(false);
  }
}

// ─── Toggle password visibility ────────────────────────
export function togglePasswordVisibility() {
  const input = getEl('login-password');
  const icon  = getEl('pw-eye-icon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>`;
  } else {
    input.type = 'password';
    icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>`;
  }
}

// ─── Init Auth Bindings ────────────────────────────────
export function initAuth() {
  // Open / close triggers
  document.querySelectorAll('[data-action="open-login"]')
    .forEach(el => el.addEventListener('click', openLoginModal));
  document.querySelectorAll('[data-action="close-login"]')
    .forEach(el => el.addEventListener('click', closeLoginModal));

  getEl('modal-overlay')?.addEventListener('click', closeLoginModal);

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isLoginOpen) closeLoginModal();
  });

  // Form submit
  getEl('login-form')?.addEventListener('submit', handleLogin);

  // Toggle pw visibility
  getEl('pw-toggle')?.addEventListener('click', togglePasswordVisibility);

  // Update navbar if already logged in
  const user = JSON.parse(localStorage.getItem('auth_user') ?? 'null');
  if (user) {
    const loginBtns = document.querySelectorAll('[data-action="open-login"]');
    loginBtns.forEach(btn => {
      btn.textContent = user.name?.split(' ')[0] ?? 'Dashboard';
      btn.removeAttribute('data-action');
      btn.href = 'http://localhost:5173/dashboard';
    });
  }
}
