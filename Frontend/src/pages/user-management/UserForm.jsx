import React, { useState, useEffect } from 'react';

const UserForm = ({ user, onSubmit, isEditing }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'petugas',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        role: user.role || 'petugas',
      });
    }
  }, [isEditing, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validation
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
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Prepare submission data
    const submitData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
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
    <form onSubmit={handleSubmit} className="max-w-2xl">
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
            <option value="petugas">Petugas</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
        </div>
      </div>

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
