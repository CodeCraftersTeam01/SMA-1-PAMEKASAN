import React from 'react';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Selamat Datang, {user?.data_akademik?.nama_lengkap || user?.name || 'Siswa'}!</h2>
        <p className="text-slate-600 text-sm">
          Ini adalah portal siswa SMAN 1 Pamekasan. Anda dapat melihat profil, mengganti password, atau mengisi data penelusuran alumni melalui menu di sebelah kiri.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Data Diri</h3>
          <p className="text-xs text-slate-500">Lihat dan pastikan data diri Anda sudah sesuai dengan data sekolah.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Penelusuran Alumni</h3>
          <p className="text-xs text-slate-500">Khusus kelas 12: lengkapi data nilai dan rencana pendidikan lanjutan.</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
