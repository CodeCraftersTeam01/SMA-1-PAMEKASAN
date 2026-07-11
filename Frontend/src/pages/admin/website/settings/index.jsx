import React, { useState, useEffect } from 'react';

// ─── Toast Notification ──────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
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
      {type === 'warning' && (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
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

export default function AdminSettings() {
  const [formData, setFormData] = useState({
    hero_title: '',
    hero_subtitle: '',
    existing_hero_images: [],
    new_hero_images: [],
    video_link: '',
    ppdb_link: '',
    headmaster_name: '',
    headmaster_title: '',
    headmaster_message: '',
    headmaster_photo: null,
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    contact_map_url: ''
  });

  const [preview, setPreview] = useState({
    new_hero_images: [],
    headmaster_photo: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => setToast({ message, type });

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/landing-page-settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.id) {
          setFormData({
            hero_title: data.hero_title || '',
            hero_subtitle: data.hero_subtitle || '',
            existing_hero_images: Array.isArray(data.hero_images) ? data.hero_images : (data.hero_image ? [data.hero_image] : []),
            new_hero_images: [],
            video_link: data.video_link || '',
            ppdb_link: data.ppdb_link || '',
            headmaster_name: data.headmaster_name || '',
            headmaster_title: data.headmaster_title || '',
            headmaster_message: data.headmaster_message || '',
            contact_email: data.contact_email || '',
            contact_phone: data.contact_phone || '',
            contact_address: data.contact_address || '',
            contact_map_url: data.contact_map_url || ''
          });
          setPreview({
            new_hero_images: [],
            headmaster_photo: data.headmaster_photo ? `${import.meta.env.VITE_API_BASE_URL}/storage/${data.headmaster_photo}` : null
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (name === 'new_hero_images') {
        if (files.length > 0) {
          const newFilesArray = Array.from(files);
          setFormData(prev => ({ ...prev, new_hero_images: [...prev.new_hero_images, ...newFilesArray] }));
          const newPreviewsArray = newFilesArray.map(file => URL.createObjectURL(file));
          setPreview(prev => ({ ...prev, new_hero_images: [...prev.new_hero_images, ...newPreviewsArray] }));
        }
      } else if (files[0]) {
        setFormData({ ...formData, [name]: files[0] });
        setPreview({ ...preview, [name]: URL.createObjectURL(files[0]) });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const removeExistingHeroImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      existing_hero_images: prev.existing_hero_images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const removeNewHeroImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      new_hero_images: prev.new_hero_images.filter((_, index) => index !== indexToRemove)
    }));
    setPreview(prev => ({
      ...prev,
      new_hero_images: prev.new_hero_images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'existing_hero_images') {
           formData[key].forEach(img => data.append('existing_hero_images[]', img));
        } else if (key === 'new_hero_images') {
           formData[key].forEach(file => data.append('new_hero_images[]', file));
        } else if (formData[key] !== null && formData[key] !== undefined) {
           data.append(key, formData[key]);
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/landing-page-settings`, {
        method: 'POST', // POST for multipart/form-data
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          'Accept': 'application/json'
        },
        body: data
      });

      if (response.ok) {
        showToast("Pengaturan berhasil disimpan!", "success");
        fetchSettings();
      } else {
        showToast("Gagal menyimpan pengaturan.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Terjadi kesalahan sistem.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Pengaturan Landing Page</h2>
        <p className="text-slate-500 mb-8">Ubah teks statis, gambar utama, sambutan kepala sekolah, dan info kontak secara dinamis di sini.</p>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Section 1: Hero */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-700 mb-4 border-b pb-2">1. Bagian Utama (Hero)</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Judul Utama</label>
                <input type="text" name="hero_title" value={formData.hero_title} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Mencetak Generasi Cerdas..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Sub Judul (Deskripsi Singkat)</label>
                <textarea name="hero_subtitle" value={formData.hero_subtitle} onChange={handleChange} rows="3" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Link PPDB</label>
                  <input type="text" name="ppdb_link" value={formData.ppdb_link} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Link Video Profil</label>
                  <input type="text" name="video_link" value={formData.video_link} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg" placeholder="#video-profil atau url youtube" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Gambar Latar (Hero Slideshow)</label>
                <input type="file" name="new_hero_images" multiple onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg" accept="image/*" />
                <p className="text-xs text-slate-400 mt-1">Anda dapat memilih lebih dari satu gambar untuk membuat slideshow.</p>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Existing Images */}
                  {formData.existing_hero_images.map((imgUrl, idx) => (
                    <div key={`existing-${idx}`} className="relative group rounded-xl overflow-hidden border border-slate-200">
                      <img src={`${import.meta.env.VITE_API_BASE_URL}/storage/${imgUrl}`} alt="Existing Hero" className="h-24 w-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button type="button" onClick={() => removeExistingHeroImage(idx)} className="bg-red-500 text-white text-xs px-2 py-1 rounded">Hapus</button>
                      </div>
                    </div>
                  ))}
                  
                  {/* New Images */}
                  {preview.new_hero_images.map((previewUrl, idx) => (
                    <div key={`new-${idx}`} className="relative group rounded-xl overflow-hidden border border-blue-400 border-dashed">
                      <img src={previewUrl} alt="New Hero" className="h-24 w-full object-cover" />
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">BARU</div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button type="button" onClick={() => removeNewHeroImage(idx)} className="bg-red-500 text-white text-xs px-2 py-1 rounded">Hapus</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Sambutan */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-700 mb-4 border-b pb-2">2. Sambutan Kepala Sekolah</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Nama Kepala Sekolah</label>
                  <input type="text" name="headmaster_name" value={formData.headmaster_name} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Jabatan</label>
                  <input type="text" name="headmaster_title" value={formData.headmaster_title} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Teks Sambutan</label>
                <textarea name="headmaster_message" value={formData.headmaster_message} onChange={handleChange} rows="5" className="w-full px-4 py-2 border border-slate-300 rounded-lg"></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Foto Kepala Sekolah</label>
                <input type="file" name="headmaster_photo" onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg" accept="image/*" />
                {preview.headmaster_photo && <img src={preview.headmaster_photo} alt="Preview Kepsek" className="mt-2 h-32 object-cover rounded-xl" />}
              </div>
            </div>
          </div>

          {/* Section 3: Kontak & Footer */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-700 mb-4 border-b pb-2">3. Kontak & Footer</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Email</label>
                  <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Telepon / WhatsApp</label>
                  <input type="text" name="contact_phone" value={formData.contact_phone} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Alamat Lengkap</label>
                <textarea name="contact_address" value={formData.contact_address} onChange={handleChange} rows="2" className="w-full px-4 py-2 border border-slate-300 rounded-lg"></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Link Google Maps (URL)</label>
                <input type="text" name="contact_map_url" value={formData.contact_map_url} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all disabled:opacity-50">
              {isLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>
      
      {/* ── Toast ── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
