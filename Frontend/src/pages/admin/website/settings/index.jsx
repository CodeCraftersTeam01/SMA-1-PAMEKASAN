import React, { useState, useEffect } from 'react';

export default function AdminSettings() {
  const [formData, setFormData] = useState({
    hero_title: '',
    hero_subtitle: '',
    hero_image: null,
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
    hero_image: null,
    headmaster_photo: null
  });

  const [isLoading, setIsLoading] = useState(false);

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
            hero_image: data.hero_image ? `${import.meta.env.VITE_API_BASE_URL}/storage/${data.hero_image}` : null,
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
      if (files[0]) {
        setFormData({ ...formData, [name]: files[0] });
        setPreview({ ...preview, [name]: URL.createObjectURL(files[0]) });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
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
        alert("Pengaturan berhasil disimpan!");
        fetchSettings();
      } else {
        alert("Gagal menyimpan pengaturan.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem.");
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
                <label className="block text-sm font-semibold text-slate-600 mb-1">Gambar Latar (Hero Background)</label>
                <input type="file" name="hero_image" onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
                {preview.hero_image && <img src={preview.hero_image} alt="Preview Hero" className="mt-2 h-32 object-cover rounded-xl" />}
                <p className="text-xs text-slate-400 mt-1">Kosongkan jika tidak ingin mengubah gambar.</p>
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
                <input type="file" name="headmaster_photo" onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
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
    </div>
  );
}
