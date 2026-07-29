import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Trophy, BookOpen } from 'lucide-react';
import SEO from '../components/SEO';

const API_KEY = import.meta.env.VITE_API_KEY || 'smansa123';
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/api/public';
const STORAGE_BASE = API_BASE.replace('/api/public', '/storage');

export default function DirektoriGuru() {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // scroll to top
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    const headers = { 'x-api-key': API_KEY, 'Accept': 'application/json' };
    
    // fetch data
    fetch(`${API_BASE}/landing-data`, { headers })
      .then(res => res.json())
      .then(json => {
        if (json.data && json.data.teachers) {
          setTeachers(json.data.teachers);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  // Hierarchy grouping logic
  const kepalaSekolah = [];
  const wakilKepala = [];
  const guruMapel = [];

  teachers.forEach(teacher => {
    const jabatan = (teacher.jabatan || '').toLowerCase();
    if (jabatan.includes('kepala sekolah') && !jabatan.includes('wakil')) {
      kepalaSekolah.push(teacher);
    } else if (jabatan.includes('wakil kepala') || jabatan.includes('wakasek')) {
      wakilKepala.push(teacher);
    } else {
      guruMapel.push(teacher);
    }
  });

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const TeacherCard = ({ teacher }) => (
    <motion.div 
      variants={fadeUp}
      className="group relative rounded-[1.75rem] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.015)] hover:shadow-[0_20px_45px_rgba(37,99,235,0.08)] border border-slate-200/50 hover:border-blue-200/50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:scale-[1.01] bg-gray-100 aspect-3/4 w-64 sm:w-72"
    >
      <img 
        src={teacher.photo ? `${STORAGE_BASE}/${teacher.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=f1f5f9&color=1e293b&bold=true&size=256`} 
        className="absolute inset-0 w-full h-full object-cover z-10 group-hover:scale-105 transition-transform duration-700" 
        alt={teacher.name} 
      />
      <div className="absolute inset-0 bg-linear-to-t from-smansa-navy/90 via-smansa-navy/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500 z-20"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 z-30">
        <h3 className="text-[16px] font-bold">{teacher.name}</h3>
        <p className="text-smansa-gold font-bold text-[11px] uppercase tracking-wider mt-1">{teacher.jabatan || 'Guru Mata Pelajaran'}</p>
        <p className="text-blue-200 text-sm mt-0.5">{teacher.subject}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24">
      <SEO 
        title="Direktori Tenaga Pendidik"
        description="Profil guru dan tenaga pendidik berdedikasi tinggi di SMAN 1 Pamekasan yang siap mendidik siswa-siswi terbaik bangsa."
        keywords="daftar guru SMAN 1 Pamekasan, tenaga pendidik SMANSA, guru terbaik Pamekasan"
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-smansa-navy font-bold hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
        </div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-16">
          <div className="w-12 h-1 bg-smansa-gold mx-auto mb-6"></div>
          <h1 className="text-4xl md:text-5xl font-bold text-smansa-navy mb-4 tracking-tight">Direktori Tenaga Pendidik</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Mengenal lebih dekat para pendidik berdedikasi yang membimbing generasi cerdas SMAN 1 Pamekasan.</p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center gap-3">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-3 h-3 bg-blue-600 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Kepala Sekolah */}
            {kepalaSekolah.length > 0 && (
              <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-smansa-navy mb-8 flex flex-col items-center gap-2">
                  <div className="bg-yellow-100 p-3 rounded-full text-smansa-gold shadow-sm">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <span>Pimpinan Sekolah</span>
                  <div className="w-16 h-1 bg-smansa-gold rounded-full mt-2"></div>
                </h2>
                <div className="flex flex-wrap justify-center gap-8 w-full">
                  {kepalaSekolah.map((teacher, idx) => (
                    <TeacherCard key={idx} teacher={teacher} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Connecting Line 1 */}
            {kepalaSekolah.length > 0 && (wakilKepala.length > 0 || guruMapel.length > 0) && (
              <div className="flex flex-col items-center my-4">
                <div className="w-0.5 h-16 bg-linear-to-b from-blue-400 to-blue-200"></div>
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm -mt-1.5"></div>
              </div>
            )}

            {/* Wakil Kepala Sekolah */}
            {wakilKepala.length > 0 && (
              <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-smansa-navy mb-8 flex flex-col items-center gap-2">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600 shadow-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <span>Wakil Kepala Sekolah</span>
                  <div className="w-16 h-1 bg-blue-500 rounded-full mt-2"></div>
                </h2>
                <div className="flex flex-wrap justify-center gap-8 w-full">
                  {wakilKepala.map((teacher, idx) => (
                    <TeacherCard key={idx} teacher={teacher} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Connecting Line 2 */}
            {wakilKepala.length > 0 && guruMapel.length > 0 && (
              <div className="flex flex-col items-center my-4">
                <div className="w-0.5 h-16 bg-linear-to-b from-blue-200 to-emerald-200"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm -mt-1.5"></div>
              </div>
            )}

            {/* Guru Mata Pelajaran */}
            {guruMapel.length > 0 && (
              <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-smansa-navy mb-8 flex flex-col items-center gap-2">
                  <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 shadow-sm">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span>Guru Mata Pelajaran</span>
                  <div className="w-16 h-1 bg-emerald-500 rounded-full mt-2"></div>
                </h2>
                <div className="flex flex-wrap justify-center gap-8 w-full">
                  {guruMapel.map((teacher, idx) => (
                    <TeacherCard key={idx} teacher={teacher} />
                  ))}
                </div>
              </motion.div>
            )}

            {teachers.length === 0 && (
              <div className="text-center text-gray-500 py-12 bg-white rounded-3xl border border-gray-100">
                <p>Belum ada data tenaga pendidik.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
