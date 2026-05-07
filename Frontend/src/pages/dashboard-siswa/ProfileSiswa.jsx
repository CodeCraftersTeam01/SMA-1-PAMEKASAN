import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfileSiswa = () => {
  const { user } = useAuth();
  
  const student = user?.data_akademik || {};

  const infoItems = [
    { label: 'Nama Lengkap', value: student.nama_lengkap || user?.name || '-' },
    { label: 'NIS', value: user?.nis || student.nis || '-' },
    { label: 'NISN', value: student.nisn || '-' },
    { label: 'Kelas', value: student.grade || user?.student_grade || '-' },
    { label: 'Status Akun', value: student.is_active ? 'Aktif' : 'Non-Aktif', isStatus: true },
    { label: 'Tahun Masuk', value: student.tahun_masuk || '-' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 relative">
          <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-2xl shadow-lg border border-slate-100">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.nama_lengkap || user?.name || 'Siswa')}&background=eff6ff&color=3b82f6&size=128`} 
              alt="Avatar" 
              className="w-24 h-24 rounded-xl object-cover"
            />
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
          <h2 className="text-2xl font-bold text-slate-900">{student.nama_lengkap || user?.name || 'Siswa'}</h2>
          <p className="text-slate-500 font-medium">Siswa SMAN 1 Pamekasan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Informasi Identitas
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              {infoItems.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                  {item.isStatus ? (
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[12px] font-bold ${
                      item.value === 'Aktif' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {item.value}
                    </span>
                  ) : (
                    <p className="text-sm font-semibold text-slate-700">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Catatan
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Data di atas merupakan data resmi yang terdaftar di sistem sekolah. Jika terdapat kesalahan data, harap segera melapor ke bagian Tata Usaha (TU) atau Admin Sekolah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSiswa;
