import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white shadow-2xl shadow-slate-900/20 animate-fade-up ${colors[type] || colors.info}`}>
      {type === 'success' && (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {type === 'error' && (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

const Profile = () => {
  const { user, token, refreshUser } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Profile Form State
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef(null);

  // Password Form State
  const [passwordData, setPasswordData] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Toast State
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || '', email: user.email || '' });
      setPhotoPreview(user.photo ? `${API_BASE_URL}/storage/${user.photo}` : '');
    }
  }, [user, API_BASE_URL]);

  const showToast = (message, type = 'info') => setToast({ message, type });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);

    const formData = new FormData();
    formData.append('name', profileData.name);
    formData.append('email', profileData.email);
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'POST', // Using POST for file upload
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Profil berhasil diperbarui!', 'success');
        await refreshUser(); // Update context user data
        setPhotoFile(null); // Reset file input
      } else {
        showToast(data.message || 'Gagal memperbarui profil', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.password_confirmation) {
      showToast('Konfirmasi password tidak cocok', 'error');
      return;
    }
    
    setIsSavingPassword(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Password berhasil diperbarui!', 'success');
        setPasswordData({ current_password: '', password: '', password_confirmation: '' });
      } else {
        showToast(data.message || 'Gagal memperbarui password', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-[#1e293b]">Pengaturan Profil</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Kelola informasi pribadi dan pengaturan keamanan akun Anda.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Identitas Profil */}
        <div className="lg:col-span-2 space-y-6 animate-fade-up delay-75">
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-lg font-bold text-slate-800">Identitas Profil</h3>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6">
              
              {/* Photo Upload Section */}
              <div className="mb-8 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-full border-4 border-slate-50 overflow-hidden bg-slate-100 shadow-md transition-transform group-hover:scale-105">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'A')}&background=eff6ff`} alt="Avatar" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    accept="image/jpeg,image/png,image/jpg" 
                    onChange={handlePhotoChange}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Foto Profil</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-3 max-w-xs">Upload foto baru untuk mengganti foto profil Anda. Rekomendasi rasio 1:1, max 2MB.</p>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors">
                    Pilih Foto Baru
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 text-sm"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    Alamat Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 text-sm"
                    placeholder="Masukkan alamat email"
                  />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile || (!photoFile && profileData.name === user?.name && profileData.email === user?.email)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSavingProfile ? (
                     <>
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     <span>Menyimpan...</span>
                   </>
                  ) : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Ubah Password */}
        <div className="space-y-6 animate-fade-up delay-150">
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-lg font-bold text-slate-800">Ubah Password</h3>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="p-6 space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Saat Ini</label>
                <div className="relative">
                  <input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-700 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Baru</label>
                <div className="relative">
                  <input
                    type="password"
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}
                    required
                    minLength={8}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-700 text-sm"
                    placeholder="Minimal 8 karakter"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Konfirmasi Password Baru</label>
                <div className="relative">
                  <input
                    type="password"
                    value={passwordData.password_confirmation}
                    onChange={(e) => setPasswordData({...passwordData, password_confirmation: e.target.value})}
                    required
                    minLength={8}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-700 text-sm"
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSavingPassword || !passwordData.current_password || !passwordData.password || !passwordData.password_confirmation}
                  className="w-full px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSavingPassword ? (
                     <>
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     <span>Memperbarui...</span>
                   </>
                  ) : "Update Password"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default Profile;
