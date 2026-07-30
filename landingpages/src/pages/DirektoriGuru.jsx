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

  // Predefined hierarchical category order
  const categoryOrder = [
    'Pimpinan Sekolah',
    'Wakil Kepala Sekolah',
    'Guru Mata Pelajaran',
    'Staf Tata Usaha',
    'Komite Sekolah'
  ];

  // Helper to get styling config for each category
  const getCategoryTheme = (cat) => {
    switch (cat) {
      case 'Pimpinan Sekolah':
        return {
          icon: <Trophy className="w-6 h-6" />,
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-600',
          lineColor: 'from-amber-400 to-blue-200',
          dotColor: 'bg-blue-500'
        };
      case 'Wakil Kepala Sekolah':
        return {
          icon: <Users className="w-6 h-6" />,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
          lineColor: 'from-blue-200 to-emerald-200',
          dotColor: 'bg-emerald-500'
        };
      case 'Guru Mata Pelajaran':
        return {
          icon: <BookOpen className="w-6 h-6" />,
          bgColor: 'bg-emerald-100',
          textColor: 'text-emerald-600',
          lineColor: 'from-emerald-200 to-slate-200',
          dotColor: 'bg-slate-500'
        };
      case 'Staf Tata Usaha':
        return {
          icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
          bgColor: 'bg-slate-100',
          textColor: 'text-slate-600',
          lineColor: 'from-slate-200 to-indigo-200',
          dotColor: 'bg-indigo-500'
        };
      case 'Komite Sekolah':
        return {
          icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
          bgColor: 'bg-indigo-100',
          textColor: 'text-indigo-600',
          lineColor: 'from-indigo-200 to-slate-200',
          dotColor: 'bg-slate-500'
        };
      default:
        return {
          icon: <BookOpen className="w-6 h-6" />,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          lineColor: 'from-gray-200 to-gray-100',
          dotColor: 'bg-gray-400'
        };
    }
  };

  // Group teachers by category dynamically based on their parsed jabatan
  const groupedTeachers = {};
  teachers.forEach(teacher => {
    const jabatan = (teacher.jabatan || '').toLowerCase();
    let cat = 'Guru Mata Pelajaran';
    if (jabatan.includes('kepala sekolah') && !jabatan.includes('wakil')) {
      cat = 'Pimpinan Sekolah';
    } else if (jabatan.includes('wakil kepala') || jabatan.includes('wakasek')) {
      cat = 'Wakil Kepala Sekolah';
    } else if (jabatan.includes('tata usaha') || jabatan.includes('staf') || jabatan.includes('tu')) {
      cat = 'Staf Tata Usaha';
    } else if (jabatan.includes('komite')) {
      cat = 'Komite Sekolah';
    }
    
    if (!groupedTeachers[cat]) {
      groupedTeachers[cat] = [];
    }
    groupedTeachers[cat].push(teacher);
  });

  // Sort categories based on predefined order list, unrecognized categories go to the end alphabetically
  const sortedCategories = Object.keys(groupedTeachers).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
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
            {sortedCategories.map((cat, catIdx) => {
              const categoryTeachers = groupedTeachers[cat] || [];
              const theme = getCategoryTheme(cat);
              const hasNextCategory = catIdx < sortedCategories.length - 1;

              return (
                <React.Fragment key={cat}>
                  <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col items-center animate-fade-in">
                    <h2 className="text-2xl font-bold text-smansa-navy mb-8 flex flex-col items-center gap-2">
                      <div className={`${theme.bgColor} p-3 rounded-full ${theme.textColor} shadow-sm`}>
                        {theme.icon}
                      </div>
                      <span>{cat}</span>
                      <div className={`w-16 h-1 ${theme.textColor.replace('text', 'bg')} rounded-full mt-2`}></div>
                    </h2>
                    <div className="flex flex-wrap justify-center gap-8 w-full">
                      {categoryTeachers.map((teacher, idx) => (
                        <TeacherCard key={idx} teacher={teacher} />
                      ))}
                    </div>
                  </motion.div>

                  {/* Connecting Line to Next Category */}
                  {hasNextCategory && (
                    <div className="flex flex-col items-center my-4">
                      <div className={`w-0.5 h-16 bg-linear-to-b ${theme.lineColor}`}></div>
                      <div className={`w-3 h-3 rounded-full ${theme.dotColor} shadow-sm -mt-1.5`}></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {teachers.length === 0 && (
              <div className="text-center text-gray-500 py-12 bg-white rounded-3xl border border-gray-100 animate-fade-up">
                <p>Belum ada data tenaga pendidik.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
