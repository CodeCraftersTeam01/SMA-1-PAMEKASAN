import React, { useState, useEffect } from 'react';

const PRESET_ROLES = ['admin', 'petugas', 'tu', 'guru', 'kepsek'];

const RESOURCES = [
  { key: 'pendaftaran', label: 'Pendaftaran' },
  { key: 'siswa', label: 'Siswa' },
  { key: 'tahun_ajaran', label: 'Tahun Ajaran' },
  { key: 'laporan', label: 'Laporan' },
  { key: 'alumni', label: 'Alumni' },
  { key: 'alumni_tracking', label: 'Penelusuran Alumni' },
  { key: 'kelas', label: 'Kelas' },
  { key: 'pengaturan', label: 'Pengaturan' },
];

const ACTIONS = [
  { key: 'view', label: 'Lihat' },
  { key: 'create', label: 'Tambah' },
  { key: 'edit', label: 'Ubah' },
  { key: 'delete', label: 'Hapus' },
];

const defaultPermissions = () => {
  const perms = {};
  RESOURCES.forEach(r => {
    perms[r.key] = { view: true, create: false, edit: false, delete: false };
  });
  return perms;
};

const UserForm = ({ user, onSubmit, isEditing }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'petugas',
    customRole: '',
  });

  const [permissions, setPermissions] = useState(defaultPermissions());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && user) {
      const isPreset = PRESET_ROLES.includes(user.role?.toLowerCase());
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        role: isPreset ? (user.role?.toLowerCase() || 'petugas') : 'kustom',
        customRole: isPreset ? '' : (user.role || ''),
      });

      if (user.permissions && Object.keys(user.permissions).length > 0) {
        const merged = { ...defaultPermissions() };
        Object.keys(user.permissions).forEach(r => {
          if (merged[r]) {
            merged[r] = { ...merged[r], ...user.permissions[r] };
          }
        });
        setPermissions(merged);
      } else {
        setPermissions(defaultPermissions());
      }
    }
  }, [isEditing, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePermissionChange = (resource, action) => {
    setPermissions(prev => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: !prev[resource][action],
      },
    }));
  };

  const handleSelectAll = (resource, checked) => {
    setPermissions(prev => {
      const updated = { ...prev[resource] };
      ACTIONS.forEach(a => { updated[a.key] = checked; });
      return { ...prev, [resource]: updated };
    });
  };

  const isAllSelected = (resource) => {
    return ACTIONS.every(a => permissions[resource]?.[a.key]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama harus diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email tidak valid';
    }

    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = 'Password harus diisi';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password minimal 8 karakter';
      }
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    }

    if (formData.password && formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Password tidak cocok';
    }

    if (!formData.role) {
      newErrors.role = 'Role harus dipilih';
    } else if (formData.role === 'kustom' && !formData.customRole.trim()) {
      newErrors.customRole = 'Nama role kustom harus diisi';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    const submitData = {
      name: formData.name,
      email: formData.email,
      role: formData.role === 'kustom' ? formData.customRole.trim().toLowerCase() : formData.role,
      permissions: formData.role === 'admin' ? null : permissions,
    };

    if (formData.password) {
      submitData.password = formData.password;
    }

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <h2 className="text-xl font-bold text-[#1e293b] mb-6">
        {isEditing ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
      </h2>

      <div className="space-y-5">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
            Nama Lengkap
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-xl font-medium transition-colors text-sm text-slate-600 ${
              errors.name
                ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20'
                : 'border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500'
            }`}
            placeholder="Masukkan nama lengkap"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-xl font-medium transition-colors text-sm text-slate-600 ${
              errors.email
                ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20'
                : 'border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500'
            }`}
            placeholder="Masukkan email"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
            Password
            {isEditing && <span className="text-slate-500 text-xs font-normal ml-1">(Kosongkan jika tidak ingin mengubah)</span>}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-xl font-medium transition-colors text-sm text-slate-600 ${
              errors.password
                ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20'
                : 'border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500'
            }`}
            placeholder={isEditing ? 'Masukkan password baru (opsional)' : 'Masukkan password'}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        {/* Password Confirmation Field */}
        {formData.password && (
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-semibold text-slate-700 mb-2">
              Konfirmasi Password
            </label>
            <input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-xl font-medium transition-colors text-sm text-slate-600 ${
                errors.password_confirmation
                  ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20'
                  : 'border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500'
              }`}
              placeholder="Masukkan kembali password"
            />
            {errors.password_confirmation && (
              <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
            )}
          </div>
        )}

        {/* Role Field */}
        <div>
          <label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-2">
            Role / Jabatan
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-xl font-medium transition-colors text-sm text-slate-600 bg-white ${
              errors.role
                ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20'
                : 'border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500'
            }`}
          >
            <option value="admin">Admin (Full Akses)</option>
            <option value="petugas">Petugas</option>
            <option value="tu">Tata Usaha (TU)</option>
            <option value="guru">Guru</option>
            <option value="kepsek">Kepala Sekolah</option>
            <option value="kustom">Lainnya (Kustom...)</option>
          </select>
          {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
        </div>

        {/* Custom Role Input */}
        {formData.role === 'kustom' && (
          <div className="animate-fade-up">
            <label htmlFor="customRole" className="block text-sm font-semibold text-slate-700 mb-2">
              Nama Role Kustom
            </label>
            <input
              type="text"
              id="customRole"
              name="customRole"
              value={formData.customRole}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-xl font-medium transition-colors text-sm text-slate-600 ${
                errors.customRole
                  ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20'
                  : 'border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500'
              }`}
              placeholder="Contoh: wakasek, humas, dll"
            />
            {errors.customRole && <p className="text-red-500 text-sm mt-1">{errors.customRole}</p>}
          </div>
        )}
      </div>

      {/* Permissions Section - only show for non-admin */}
      {formData.role !== 'admin' && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-lg font-bold text-[#1e293b] mb-1">Hak Akses</h3>
          <p className="text-sm text-slate-500 mb-4">
            Atur izin akses untuk setiap modul. Centang aksi yang diizinkan untuk pengguna ini.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-2 pr-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Modul</th>
                  {ACTIONS.map(a => (
                    <th key={a.key} className="py-2 px-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">{a.label}</th>
                  ))}
                  <th className="py-2 pl-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">Semua</th>
                </tr>
              </thead>
              <tbody>
                {RESOURCES.map(r => (
                  <tr key={r.key} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 pr-4 text-[13px] font-semibold text-slate-700">{r.label}</td>
                    {ACTIONS.map(a => (
                      <td key={a.key} className="py-2.5 px-3 text-center">
                        <label className="inline-flex items-center justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions[r.key]?.[a.key] || false}
                            onChange={() => handlePermissionChange(r.key, a.key)}
                            className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500/20 focus:ring-offset-0 cursor-pointer"
                          />
                        </label>
                      </td>
                    ))}
                    <td className="py-2.5 pl-3 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAllSelected(r.key)}
                          onChange={(e) => handleSelectAll(r.key, e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500/20 focus:ring-offset-0 cursor-pointer"
                        />
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {formData.role === 'admin' && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-semibold">Akun Admin — Full Akses</p>
            <p className="text-blue-600 mt-1">Pengguna dengan role Admin memiliki akses penuh ke seluruh modul tanpa perlu dikonfigurasi.</p>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 mt-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-bold rounded-xl transition-all shadow-md shadow-slate-900/20 flex items-center justify-center gap-2 text-sm"
        >
          {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
          {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Pengguna'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
