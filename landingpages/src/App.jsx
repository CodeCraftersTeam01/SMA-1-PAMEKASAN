import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Lenis from 'lenis';
import { ArrowRight, Calendar, MessageSquare, MapPin, Mail, Phone, Trophy, Users, Building, ChevronRight, Play, BookOpen, Monitor, Award, Heart, LayoutGrid, Users2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import DarkVeil from './DarkVeil';
import SideRays from './SideRays';
import SplitText from './SplitText';
import CountUp from './CountUp';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';

const DynamicPage = React.lazy(() => import('./pages/DynamicPage'));
const NewsDetail = React.lazy(() => import('./pages/NewsDetail'));
const PrestasiDetail = React.lazy(() => import('./pages/PrestasiDetail'));
const FormPrestasi = React.lazy(() => import('./pages/FormPrestasi'));

// Shared minimal loading fallback for dynamic routes
const MinimalLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
    <div className="flex items-center gap-3">
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="w-3 h-3 bg-blue-600 rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
      ))}
    </div>
  </div>
);

// Page transition wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

gsap.registerPlugin(ScrollTrigger, useGSAP);

const API_KEY = import.meta.env.VITE_API_KEY || 'smansa123';
const API_BASE = 'http://localhost:8000/api/public';

// Full-page loading screen component
const LoadingScreen = () => (
    <motion.div
      key="loading"
      initial={{ opacity: 1, y: "0%" }}
      exit={{ opacity: 1, y: "-100%" }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }} // smooth curtain-like slide up
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-smansa-navy origin-top"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6"
      >
        <img src="/logo-sma.png" alt="Logo SMAN 1" className="w-20 h-20 object-contain" />
        <div className="text-center">
          <p className="text-white font-bold text-xl tracking-widest uppercase">SMAN 1 Pamekasan</p>
          <p className="text-blue-200 text-xs mt-1 tracking-[0.3em]">School of Excellence</p>
        </div>
        <div className="flex items-center gap-2 mt-4">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 bg-smansa-gold rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
);

export default function App() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const el = document.querySelector(location.hash);
        if (el) {
          if (window.lenis) {
            window.lenis.scrollTo(el);
          } else {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 100);
    } else {
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  }, [location]);

  const [data, setData] = useState({
    news: [],
    calendar: [],
    forums: [],
    achievements: [],
    teachers: [],
    facilities: [],
    features: [],
    programs: [],
    settings: {}
  });
  const [navItems, setNavItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newsPage, setNewsPage] = useState(1);
  const [showAllNews, setShowAllNews] = useState(false);
  const [showTeacherHierarchy, setShowTeacherHierarchy] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('MIPA');
  const [activeCategory, setActiveCategory] = useState('Semua');

  const statsCardRef = useRef(null);
  const shinyRef = useRef(null);

  useGSAP(() => {
    if (statsCardRef.current) {
      gsap.fromTo(statsCardRef.current,
        { scale: 1 },
        {
          scale: 1.1,
          ease: "none",
          scrollTrigger: {
            trigger: statsCardRef.current,
            start: 0,
            end: "center center",
            scrub: 0.5,
          }
        }
      );
    }
    
    if (shinyRef.current) {
      gsap.fromTo(shinyRef.current,
        { left: "-150%" },
        {
          left: "150%",
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: statsCardRef.current,
            start: "top 90%",   // Digeser lebih ke bawah sedikit
            end: "bottom 30%",  // Midpoint sekarang berada di sekitar 60% layar (sedikit di bawah tengah)
            scrub: 1.5,
          }
        }
      );
    }
  });

  const STORAGE_BASE = API_BASE.replace('/api/public', '/storage');
  
  const heroImages = data.settings?.hero_image 
    ? [`${STORAGE_BASE}/${data.settings.hero_image}`] 
    : ["/gerbang-sma.jpg"];

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    window.lenis = lenis;
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
      delete window.lenis;
    };
  }, []);

  useEffect(() => {
    const headers = { 'x-api-key': API_KEY, 'Accept': 'application/json' };

    // 1️⃣ Fetch NAVBAR dulu → segera sembunyikan loading screen
    fetch(`${API_BASE}/navbars`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(navbars => {
        setNavItems(Array.isArray(navbars) ? navbars : []);
        // Jeda sangat singkat (150ms) agar transisi DOM React selesai sebelum layar dihilangkan
        setTimeout(() => setIsLoading(false), 150);
      })
      .catch((error) => {
        setIsLoading(false);
      });

    const fetchSettingsAndData = async () => {
      try {
        const [newsRes, calRes, forumRes, achRes, teacherRes, facRes, featRes, progRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE}/news`, { headers }),
          fetch(`${API_BASE}/academic-calendar`, { headers }),
          fetch(`${API_BASE}/forum`, { headers }),
          fetch(`${API_BASE}/achievements`, { headers }),
          fetch(`${API_BASE}/teachers`, { headers }),
          fetch(`${API_BASE}/facilities`, { headers }),
          fetch(`${API_BASE}/features`, { headers }),
          fetch(`${API_BASE}/programs`, { headers }),
          fetch(`${API_BASE}/landing-settings`, { headers }),
        ]);
        const toArr = (json) => Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
        const toObj = (json) => typeof json === 'object' && json !== null && !Array.isArray(json) ? (json.data || json) : {};
        const [news, calendar, forums, achievements, teachers, facilities, features, programs, settings] = await Promise.all([
          newsRes.ok ? newsRes.json() : [],
          calRes.ok ? calRes.json() : [],
          forumRes.ok ? forumRes.json() : [],
          achRes.ok ? achRes.json() : [],
          teacherRes.ok ? teacherRes.json() : [],
          facRes.ok ? facRes.json() : [],
          featRes.ok ? featRes.json() : [],
          progRes.ok ? progRes.json() : [],
          settingsRes.ok ? settingsRes.json() : {},
        ]);
        setData({
          news: toArr(news),
          calendar: toArr(calendar),
          forums: toArr(forums),
          achievements: toArr(achievements),
          teachers: toArr(teachers),
          facilities: toArr(facilities),
          features: toArr(features),
          programs: toArr(programs),
          settings: toObj(settings),
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchSettingsAndData();

  }, []);

  const fadeUp = useMemo(() => ({
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }), []);
  const staggerContainer = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delayChildren: 0.8, staggerChildren: 0.2 } }
  }), []);

  const defaultPrograms = {
    'MIPA': {
      desc: 'Fokus pada Matematika dan Ilmu Pengetahuan Alam, mencetak siswa dengan nalar analitis dan riset yang kuat.',
      features: [
        { icon: <Monitor className="w-6 h-6 text-smansa-navy"/>, title: 'Science Lab Modern', desc: 'Fasilitas praktikum berstandar nasional.' },
        { icon: <BookOpen className="w-6 h-6 text-smansa-navy"/>, title: 'Olimpiade Sains', desc: 'Pembinaan khusus olimpiade rutin.' },
        { icon: <Award className="w-6 h-6 text-smansa-navy"/>, title: 'Riset Terapan', desc: 'Proyek penelitian siswa setiap semester.' }
      ]
    },
    'IPS': {
      desc: 'Fokus pada Ilmu Pengetahuan Sosial, membentuk jiwa kepemimpinan, sosial, dan kewirausahaan yang tangguh.',
      features: [
        { icon: <Users2 className="w-6 h-6 text-smansa-navy"/>, title: 'Social Studies', desc: 'Analisis masalah sosial kultural.' },
        { icon: <Heart className="w-6 h-6 text-smansa-navy"/>, title: 'Community Service', desc: 'Program pengabdian masyarakat.' },
        { icon: <Building className="w-6 h-6 text-smansa-navy"/>, title: 'Business Plan', desc: 'Praktek kewirausahaan siswa.' }
      ]
    },
    'Bahasa': {
      desc: 'Program khusus untuk penguasaan bahasa dan sastra internasional sebagai bekal global.',
      features: [
        { icon: <MessageSquare className="w-6 h-6 text-smansa-navy"/>, title: 'Native Speakers', desc: 'Pembelajaran dengan penutur asli.' },
        { icon: <Trophy className="w-6 h-6 text-smansa-navy"/>, title: 'Debate Club', desc: 'Ekskul debat bahasa Inggris aktif.' },
        { icon: <LayoutGrid className="w-6 h-6 text-smansa-navy"/>, title: 'Cultural Exchange', desc: 'Program pertukaran pelajar.' }
      ]
    }
  };

  const dynamicPrograms = {};
  if (data.programs && data.programs.length > 0) {
    data.programs.forEach(prog => {
      dynamicPrograms[prog.title] = {
        desc: prog.description,
        features: (prog.features_json || []).map(feat => ({
          icon: <i className={`bi ${feat.icon || 'bi-star'} text-2xl text-smansa-navy`}></i>,
          title: feat.title,
          desc: feat.desc
        }))
      };
    });
  }

  const programs = Object.keys(dynamicPrograms).length > 0 ? dynamicPrograms : defaultPrograms;
  const programTabs = Object.keys(programs);

  useEffect(() => {
    if (programTabs.length > 0 && !programTabs.includes(activeTab)) {
      setActiveTab(programTabs[0]);
    }
  }, [programTabs, activeTab]);

  const categories = ['Semua', 'Berita Sekolah', 'Kegiatan Siswa', 'Pengumuman', 'Kemitraan & Kerja Sama'];

  const filteredNews = activeCategory === 'Semua' 
    ? data.news 
    : data.news.filter(n => n.category === activeCategory);
  
  const NEWS_PER_PAGE = 4;
  const totalNewsPages = Math.ceil(filteredNews.length / NEWS_PER_PAGE) || 1;
  const currentNews = filteredNews.slice((newsPage - 1) * NEWS_PER_PAGE, newsPage * NEWS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 selection:bg-smansa-navy selection:text-white font-sans text-gray-800">
      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>
      
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: !isLoading ? 0 : -100, opacity: !isLoading ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.8, ease: [0.76, 0, 0.24, 1] }}
        className="relative z-[60]"
      >
        <Navbar isScrolled={isScrolled} navItems={navItems} onLoginClick={() => setShowLoginModal(true)} />
      </motion.div>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/prestasi" element={
            <React.Suspense fallback={<MinimalLoader />}>
              <PageTransition>
                <PrestasiDetail />
              </PageTransition>
            </React.Suspense>
          } />
          <Route path="/prestasi/form" element={
            <React.Suspense fallback={<MinimalLoader />}>
              <PageTransition>
                <FormPrestasi />
              </PageTransition>
            </React.Suspense>
          } />
          <Route path="/p/:slug" element={
            <React.Suspense fallback={<MinimalLoader />}>
              <PageTransition>
                <DynamicPage />
              </PageTransition>
            </React.Suspense>
          } />
          <Route path="/berita/:id" element={
            <React.Suspense fallback={<MinimalLoader />}>
              <PageTransition>
                <NewsDetail />
              </PageTransition>
            </React.Suspense>
          } />
          <Route path="/" element={
            <PageTransition>
              <main>
        
        {/* HERO SECTION */}
        <section className="relative h-screen flex items-center justify-center overflow-visible bg-smansa-navy">
          <div className="absolute inset-0 z-0 overflow-hidden">
            {heroImages.map((img, idx) => (
              <motion.img 
                key={idx}
                src={img}
                alt={`Slide ${idx}`}
                fetchPriority="high"
                className="absolute inset-0 w-full h-full object-cover object-center"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: currentSlide === idx ? 1 : 0, scale: currentSlide === idx ? 1 : 1.05 }}
                transition={{ duration: 1.5 }}
              />
            ))}
            
            {/* Simple Overlay for Text Readability */}
            <div className="absolute inset-0 bg-black/40"></div>
            
            {/* OGL SideRays Integration */}
            <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1, mixBlendMode: 'screen' }}>
              <SideRays
                speed={2.5}
                rayColor1="#EAB308"
                rayColor2="#96c8ff"
                intensity={2}
                spread={2}
                origin="top-right"
                tilt={0}
                saturation={1.5}
                blend={0.75}
                falloff={1.6}
                opacity={0.8}
              />
            </div>
          </div>

          <div className="relative z-10 w-full px-6 max-w-4xl mx-auto flex flex-col pt-20 lg:pt-0 text-center items-center">
            <motion.div initial="hidden" animate={!isLoading ? "visible" : "hidden"} variants={staggerContainer} className="max-w-3xl flex flex-col items-center">
              <div className="mb-4 w-full flex justify-center">
                <motion.h1 
                  variants={fadeUp}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.2] drop-shadow-md tracking-tight text-center"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {data.settings?.hero_title || 'Mencetak Generasi Cerdas & Berwawasan Global'}
                </motion.h1>
              </div>
              <motion.p variants={fadeUp} className="text-sm md:text-base lg:text-lg text-white/90 mb-8 leading-relaxed font-normal opacity-90 text-center max-w-xl drop-shadow">
                {data.settings?.hero_subtitle || 'Selamat Datang di SMAN 1 Pamekasan! Sekolah Tangguh, Berakhlak, dan Berwawasan Digital dengan kurikulum unggulan dan fasilitas modern.'}
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
                <a href={data.settings?.ppdb_link || "http://localhost:5173"} className="bg-smansa-gold text-white font-bold px-6 py-3 rounded-full hover:bg-yellow-500 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-sm">
                  Daftar Sekarang <ArrowRight className="w-4 h-4" />
                </a>
                <a href={data.settings?.video_link || "#video-profil"} className="bg-transparent border border-white text-white font-bold px-6 py-3 rounded-full hover:bg-white hover:text-smansa-navy transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 text-sm">
                  <Play className="w-4 h-4" fill="currentColor"/> Video Profil
                </a>
              </motion.div>
            </motion.div>
          </div>

          {/* Floating Stats Card (Overlapping Bottom) */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: !isLoading ? 1 : 0, y: !isLoading ? 0 : 50 }}
            transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
            className="absolute -bottom-12 left-0 right-0 z-20 px-4 flex justify-center"
          >
            <div 
              ref={statsCardRef}
              className="bg-white rounded-[2rem] shadow-lg p-5 md:p-6 max-w-4xl w-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100 border border-gray-100 origin-center relative overflow-hidden"
            >
              {/* Shiny Overlay */}
              <div 
                ref={shinyRef}
                className="absolute -top-[50%] -bottom-[50%] w-64 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent rotate-[25deg] pointer-events-none z-20"
                style={{ filter: 'blur(2px)' }}
              ></div>
              
              <div className="flex-1 text-center py-3 md:py-0 relative z-10">
                <h3 className="text-3xl lg:text-4xl font-bold text-smansa-navy mb-1 tracking-tighter"><CountUp end={3} duration={1500} /></h3>
                <p className="text-gray-500 text-sm font-medium">Program Peminatan</p>
              </div>
              <div className="flex-1 text-center py-3 md:py-0 relative z-10">
                <h3 className="text-3xl lg:text-4xl font-bold text-smansa-navy mb-1 tracking-tighter"><CountUp end={1200} suffix="+" duration={2000} /></h3>
                <p className="text-gray-500 text-sm font-medium">Siswa Aktif</p>
              </div>
              <div className="flex-1 text-center py-3 md:py-0 relative z-10">
                <h3 className="text-3xl lg:text-4xl font-bold text-smansa-navy mb-1 tracking-tighter"><CountUp end={10000} suffix="+" duration={2500} /></h3>
                <p className="text-gray-500 text-sm font-medium">Alumni Sukses</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* SAMBUTAN KEPALA SEKOLAH */}
        <section id="sambutan" className="pt-40 pb-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="w-full lg:w-5/12">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-gray-200">
                  <img src={data.settings?.headmaster_photo ? `${STORAGE_BASE}/${data.settings.headmaster_photo}` : "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop"} alt="Kepala Sekolah" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-smansa-navy/80 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="font-bold text-xl">{data.settings?.headmaster_name || 'Drs. Moh. Ali, M.Pd'}</p>
                    <p className="text-blue-200 text-sm">{data.settings?.headmaster_title || 'Kepala SMAN 1 Pamekasan'}</p>
                  </div>
                </div>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="w-full lg:w-7/12">
                <motion.div variants={fadeUp} className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-1 bg-smansa-gold"></div>
                  <span className="text-smansa-navy font-bold tracking-wider uppercase">Sambutan</span>
                </motion.div>
                <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-bold text-smansa-navy mb-6 tracking-tight leading-tight">
                  Sambutan Kepala Sekolah<br/><span className="text-smansa-gold">SMAN 1 Pamekasan</span>
                </motion.h2>
                <motion.div variants={fadeUp} className="text-gray-600 text-lg leading-relaxed space-y-6 whitespace-pre-wrap">
                  <p>{data.settings?.headmaster_message || 'Segala puji bagi Allah SWT Tuhan Yang Maha Esa atas rahmat dan karunia-Nya. Selamat datang di portal resmi SMAN 1 Pamekasan.\n\nDi era digital yang serba cepat ini, kami berkomitmen tidak hanya mencetak siswa yang unggul secara akademik, namun juga tangguh karakternya, serta memiliki wawasan teknologi yang mumpuni untuk bersaing secara global. Mari bersama mewujudkan masa depan yang cemerlang!'}</p>
                  <p className="font-bold text-smansa-navy mt-8 text-xl italic">
                    — {data.settings?.headmaster_name || 'Drs. Moh. Ali, M.Pd'}
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* KEUNGGULAN (Why Choose Us) */}
        <section id="keunggulan" className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-2xl">
                <h2 className="text-4xl lg:text-5xl font-bold text-smansa-navy mb-4 tracking-tight">Mengapa memilih<br/>SMAN 1 Pamekasan?</h2>
                <p className="text-gray-600 text-lg">Sekolah unggulan dengan segudang prestasi dan fasilitas berstandar internasional.</p>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <a href={data.settings?.ppdb_link || "http://localhost:5173"} className="bg-smansa-navy text-white px-8 py-4 rounded-full text-base font-bold inline-flex items-center gap-2 hover:bg-blue-900 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl">
                  Daftar PPDB <ArrowRight className="w-5 h-5"/>
                </a>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.features.length > 0 ? data.features.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 group"
                >
                  <div className="w-14 h-14 bg-blue-50 text-smansa-navy rounded-2xl flex items-center justify-center mb-6 group-hover:bg-smansa-navy group-hover:text-white transition-colors duration-300">
                    <i className={`bi ${item.icon || 'bi-star-fill'} text-2xl`}></i>
                  </div>
                  <h3 className="text-2xl font-bold text-smansa-navy mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </motion.div>
              )) : [
                { icon: <Trophy/>, title: 'Akreditasi A - Unggul', desc: 'Diakui secara nasional dengan standar kualitas terbaik oleh BAN-S/M.' },
                { icon: <Monitor/>, title: 'School of Digital Era', desc: 'Fokus pada pembelajaran interaktif dan keterampilan teknologi masa depan.' },
                { icon: <BookOpen/>, title: 'Program SKS', desc: 'Sistem Kredit Semester memungkinkan siswa lulus lebih cepat dalam 2 tahun.' },
                { icon: <Users/>, title: 'Pendidikan Berkarakter', desc: 'Membangun akhlak mulia melalui pembiasaan dan bimbingan komprehensif.' },
                { icon: <Award/>, title: 'Prestasi Nasional', desc: 'Mendominasi berbagai olimpiade sains dan kompetisi non-akademik di Indonesia.' },
                { icon: <Building/>, title: 'Fasilitas Modern', desc: 'Laboratorium, perpustakaan digital, dan ruang kelas ber-AC yang nyaman.' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 group"
                >
                  <div className="w-14 h-14 bg-blue-50 text-smansa-navy rounded-2xl flex items-center justify-center mb-6 group-hover:bg-smansa-navy group-hover:text-white transition-colors duration-300">
                    {React.cloneElement(item.icon, { className: 'w-7 h-7' })}
                  </div>
                  <h3 className="text-2xl font-bold text-smansa-navy mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PROGRAM KEAHLIAN / PEMINATAN (Tabs Layout) */}
        <section id="program" className="py-24 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
              <h2 className="text-4xl font-bold text-smansa-navy mb-4 tracking-tight">Program Peminatan</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">Kami menyediakan berbagai program penjurusan yang disesuaikan dengan minat dan bakat siswa untuk melanjutkan studi ke Perguruan Tinggi.</p>
            </motion.div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-3 mb-16">
              {programTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-3.5 rounded-full text-sm lg:text-base font-bold transition-all duration-300 shadow-sm ${
                    activeTab === tab 
                      ? 'bg-smansa-navy text-white shadow-md scale-105' 
                      : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200 hover:text-smansa-navy'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-[3rem] p-10 lg:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100"
            >
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
                <div className="lg:w-1/2">
                  <h3 className="text-4xl font-bold text-smansa-navy mb-6 tracking-tight">{activeTab}</h3>
                  <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                    {programs[activeTab]?.desc || 'Program unggulan dengan kurikulum komprehensif untuk mempersiapkan siswa bersaing di kancah nasional maupun internasional.'}
                  </p>
                  <div className="space-y-6">
                    {(programs[activeTab]?.features || programs['MIPA'].features).map((feat, i) => (
                      <div key={i} className="flex gap-5 items-start">
                        <div className="bg-blue-50 p-4 rounded-2xl">
                          {feat.icon}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-smansa-navy mb-1">{feat.title}</h4>
                          <p className="text-gray-600">{feat.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:w-1/2 w-full">
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl relative">
                    <img 
                      src={`https://source.unsplash.com/random/800x600/?${activeTab === 'MIPA' ? 'laboratory' : activeTab === 'IPS' ? 'library' : 'students'}`} 
                      alt={activeTab}
                      className="w-full h-full object-cover"
                    />
                    {/* Fallback image incase unsplash source fails */}
                    <img 
                      src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop" 
                      className="absolute inset-0 w-full h-full object-cover -z-10" 
                      alt="fallback"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* BERITA & INFORMASI (Split Layout) */}
        <section id="berita" className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-16">
              <h2 className="text-4xl font-bold text-smansa-navy tracking-tight">Berita & Informasi Terkini<br/>SMAN 1 Pamekasan</h2>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-12">
              {/* Sidebar Categories */}
              <div className="lg:w-1/4">
                <div className="sticky top-32 space-y-2">
                  <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-6 px-4">Kategori Berita</h3>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setNewsPage(1); }}
                      className={`w-full text-left px-5 py-3.5 rounded-2xl font-semibold transition-all duration-300 ${
                        activeCategory === cat 
                          ? 'bg-smansa-navy text-white shadow-lg scale-[1.02]' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-smansa-navy'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* News Grid */}
              <div className="lg:w-3/4">
                {filteredNews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {currentNews.map((item, i) => (
                      <Link 
                        to={`/berita/${item.id}`}
                        key={i}
                        className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 flex flex-col"
                      >
                        <div className="aspect-[16/10] overflow-hidden relative">
                          <img 
                            src={item.image_url || "https://images.unsplash.com/photo-1546410531-b4c69811dc31?q=80&w=800&auto=format&fit=crop"} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-smansa-navy">
                            {item.published_at?.split(' ')[0] || 'Baru'}
                          </div>
                        </div>
                        <div className="p-8 flex-1 flex flex-col">
                          <span className="text-smansa-gold font-bold text-xs uppercase tracking-wider mb-3">{item.category || 'Berita Sekolah'}</span>
                          <h3 className="font-bold text-xl text-smansa-navy mb-4 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                            {item.title}
                          </h3>
                          <div className="text-gray-500 line-clamp-2 mt-auto text-sm" dangerouslySetInnerHTML={{ __html: item.content }} />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-3xl p-16 text-center border border-gray-100">
                    <p className="text-gray-500 font-medium text-lg">Belum ada berita dalam kategori {activeCategory}.</p>
                  </div>
                )}

                {/* Pagination */}
                {totalNewsPages > 1 && (
                  <div className="mt-12 flex justify-center gap-2">
                    {Array.from({ length: totalNewsPages }, (_, i) => i + 1).map(num => (
                      <button 
                        key={num} 
                        onClick={() => setNewsPage(num)}
                        className={`w-10 h-10 rounded-full font-bold flex items-center justify-center transition-colors ${num === newsPage ? 'bg-smansa-navy text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {num}
                      </button>
                    ))}
                    <button 
                      onClick={() => setNewsPage(prev => Math.min(prev + 1, totalNewsPages))}
                      disabled={newsPage === totalNewsPages}
                      className="w-10 h-10 rounded-full bg-smansa-navy text-white font-bold flex items-center justify-center shadow-md hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5"/>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* PRESTASI SISWA */}
        <section id="prestasi" className="py-24 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex flex-col md:flex-row justify-between items-end mb-16">
              <div className="mb-6 md:mb-0">
                <h2 className="text-4xl font-bold text-smansa-navy mb-4 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>Prestasi Siswa</h2>
                <p className="text-gray-600 text-lg max-w-2xl">Daftar pencapaian gemilang siswa-siswi SMAN 1 Pamekasan di tingkat nasional maupun internasional.</p>
              </div>
              <Link to="/prestasi" className="hidden md:inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-800 transition-colors">
                Lihat Semua Prestasi <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {data.achievements.slice(0, 3).map((item, index) => (
                <div key={index} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden">
                  {item.image_url && (
                    <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                      <img src={`${STORAGE_BASE}/${item.image_url}`} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 bg-yellow-50 text-smansa-gold rounded-full flex items-center justify-center shrink-0">
                        <Trophy className="w-8 h-8" />
                      </div>
                      <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{item.level}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-smansa-navy mb-4">{item.title} ({item.year})</h3>

                    {item.siswas && item.siswas.length > 0 ? (
                      <div className="flex flex-col gap-2 mb-4 self-start">
                        {item.siswas.map((s, idx) => (
                          <div key={idx} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl font-bold text-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            {s.nama_lengkap}
                            {s.jenis_kelamin === 'L' && <span className="text-blue-500 font-black ml-1">(L)</span>}
                            {s.jenis_kelamin === 'P' && <span className="text-pink-500 font-black ml-1">(P)</span>}
                            {s.kelas && <span className="ml-1 text-xs font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Kelas {s.kelas}</span>}
                          </div>
                        ))}
                      </div>
                    ) : item.student_name ? (
                      <div className="flex flex-col gap-2 mb-4 self-start">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl font-bold text-sm">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          {item.student_name}
                        </div>
                      </div>
                    ) : null}

                    <p className="text-gray-500 text-sm mt-auto">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 text-center md:hidden">
              <Link to="/prestasi" className="inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-6 py-3 rounded-full">
                Lihat Semua Prestasi <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* DIREKTORI GURU */}
        <section id="guru" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-4xl font-bold text-smansa-navy mb-4 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>Tenaga Pendidik</h2>
                <p className="text-gray-600 text-lg">Guru-guru berdedikasi tinggi pembimbing generasi cerdas.</p>
              </div>
              <a href="#" className="hidden md:inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-800">
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {data.teachers.length > 0 ? data.teachers.slice(0, 4).map((teacher, index) => (
                <div key={index} className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-gray-100 aspect-[3/4]">
                  <img src={teacher.photo ? `${API_BASE.replace('/api/public', '')}/storage/${teacher.photo}` : `https://source.unsplash.com/random/400x500/?portrait,teacher,${index}`} className="absolute inset-0 w-full h-full object-cover z-10" alt={teacher.name} />
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover -z-10" alt="fallback" />
                  <div className="absolute inset-0 bg-gradient-to-t from-smansa-navy/90 via-smansa-navy/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 z-30">
                    <h3 className="text-lg font-bold">{teacher.name}</h3>
                    <p className="text-blue-200 text-xs">{teacher.subject || 'Guru Mata Pelajaran'}</p>
                  </div>
                </div>
              )) : [1, 2, 3, 4].map((item) => (
                <div key={item} className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-gray-100 aspect-[3/4]">
                  <img src={`https://source.unsplash.com/random/400x500/?portrait,teacher,${item}`} className="absolute inset-0 w-full h-full object-cover" alt="Guru" />
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover -z-10" alt="fallback" />
                  <div className="absolute inset-0 bg-gradient-to-t from-smansa-navy/90 via-smansa-navy/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-lg font-bold">Nama Guru, S.Pd</h3>
                    <p className="text-blue-200 text-xs">Guru Mata Pelajaran</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AGENDA SEKOLAH */}
        <section id="agenda" className="py-24 bg-smansa-navy text-white relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>Agenda Sekolah</h2>
              <p className="text-blue-100 text-lg">Jadwal kegiatan akademik dan non-akademik SMAN 1 Pamekasan.</p>
            </motion.div>
            <div className="max-w-4xl mx-auto space-y-4">
              {data.calendar.length > 0 ? data.calendar.map((agenda, i) => {
                const dateObj = new Date(agenda.event_date);
                const day = dateObj.getDate();
                const monthStr = dateObj.toLocaleString('id-ID', { month: 'short' });
                return (
                <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center gap-6">
                    <div className="bg-smansa-gold text-white text-center rounded-xl p-3 w-20 flex-shrink-0">
                      <span className="block text-2xl font-bold">{day}</span>
                      <span className="block text-xs uppercase">{monthStr}</span>
                    </div>
                    <div>
                      <span className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1 block">{agenda.type || 'Akademik'}</span>
                      <h3 className="text-xl font-bold">{agenda.title}</h3>
                    </div>
                  </div>
                  <button className="px-6 py-2 rounded-full border border-white/30 text-sm font-bold hover:bg-white hover:text-smansa-navy transition-colors">
                    Detail
                  </button>
                </div>
              )}) : [
                { date: '15 Jul', title: 'Hari Pertama Masuk Sekolah', type: 'Akademik' },
                { date: '20 Aug', title: 'Perayaan HUT RI ke-81', type: 'Non-Akademik' },
                { date: '05 Sep', title: 'Ujian Tengah Semester (UTS)', type: 'Akademik' }
              ].map((agenda, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center gap-6">
                    <div className="bg-smansa-gold text-white text-center rounded-xl p-3 w-20 flex-shrink-0">
                      <span className="block text-2xl font-bold">{agenda.date.split(' ')[0]}</span>
                      <span className="block text-xs uppercase">{agenda.date.split(' ')[1]}</span>
                    </div>
                    <div>
                      <span className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1 block">{agenda.type}</span>
                      <h3 className="text-xl font-bold">{agenda.title}</h3>
                    </div>
                  </div>
                  <button className="px-6 py-2 rounded-full border border-white/30 text-sm font-bold hover:bg-white hover:text-smansa-navy transition-colors">
                    Detail
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
            </PageTransition>
          } />
        </Routes>
      </AnimatePresence>

      {/* FOOTER (4 Column Design) */}
      <footer className="bg-smansa-navy text-white pt-24 pb-12 border-t-4 border-smansa-gold">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Kolom 1: Bio & Kontak */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl inline-block">
                  <img src="/logo-sma.png" alt="Logo" className="w-12 h-12 object-contain" />
                </div>
                <h3 className="font-bold text-2xl tracking-tight">SMAN 1 Pamekasan</h3>
              </div>
              <p className="text-blue-100/80 leading-relaxed font-medium">
                Bersama SMAN 1 Pamekasan, jadilah generasi tangguh, cerdas, dan berwawasan global di era digital.
              </p>
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-start gap-3 text-sm text-blue-100">
                  <Mail className="w-5 h-5 text-smansa-gold shrink-0"/>
                  <span>{data.settings?.contact_email || 'informasi@sman1pamekasan.sch.id'}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-blue-100">
                  <Phone className="w-5 h-5 text-smansa-gold shrink-0"/>
                  <span>{data.settings?.contact_phone || '(0324) 321049'}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-blue-100">
                  <MapPin className="w-5 h-5 text-smansa-gold shrink-0"/>
                  {data.settings?.contact_map_url ? (
                    <a href={data.settings.contact_map_url} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                      {data.settings?.contact_address || 'Jl. Pramuka No.2, Barurambat Kota, Pamekasan, Jawa Timur'}
                    </a>
                  ) : (
                    <span>{data.settings?.contact_address || 'Jl. Pramuka No.2, Barurambat Kota, Pamekasan, Jawa Timur'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Kolom 2: Menu Utama & Aplikasi Siswa */}
            <div>
              <h4 className="font-bold text-xl mb-6 tracking-tight">Menu Utama</h4>
              <ul className="space-y-3 text-blue-100/80 mb-8">
                <li><a href="#" className="hover:text-smansa-gold transition-colors inline-block hover:translate-x-1 transform duration-200">Beranda</a></li>
                <li><a href="#" className="hover:text-smansa-gold transition-colors inline-block hover:translate-x-1 transform duration-200">Profil Sekolah</a></li>
                <li><a href="#" className="hover:text-smansa-gold transition-colors inline-block hover:translate-x-1 transform duration-200">Program Peminatan</a></li>
                <li><a href="#" className="hover:text-smansa-gold transition-colors inline-block hover:translate-x-1 transform duration-200">Info PPDB</a></li>
              </ul>
              
              <h4 className="font-bold text-xl mb-6 tracking-tight">Aplikasi Siswa</h4>
              <ul className="space-y-3 text-blue-100/80">
                <li><a href="http://localhost:5173/dashboard" className="hover:text-smansa-gold transition-colors inline-block hover:translate-x-1 transform duration-200">Sistem Akademik (Admin)</a></li>
                <li><a href="#" className="hover:text-smansa-gold transition-colors inline-block hover:translate-x-1 transform duration-200">E-Learning</a></li>
              </ul>
            </div>

            {/* Kolom 3: Berita Sekolah */}
            <div>
              <h4 className="font-bold text-xl mb-6 tracking-tight">Berita Sekolah</h4>
              <ul className="space-y-3 text-blue-100/80">
                {categories.slice(1).map(cat => (
                  <li key={cat}>
                    <a href="#" className="hover:text-smansa-gold transition-colors inline-block hover:translate-x-1 transform duration-200">{cat}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kolom 4: Pengunjung & Map */}
            <div>
              <h4 className="font-bold text-xl mb-6 tracking-tight">Pengunjung Website</h4>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                  <span className="text-blue-100/80 text-sm">Hari ini</span>
                  <span className="font-bold text-smansa-gold text-lg">124</span>
                </div>
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                  <span className="text-blue-100/80 text-sm">Bulan ini</span>
                  <span className="font-bold text-smansa-gold text-lg">3,450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100/80 text-sm">Tahun ini</span>
                  <span className="font-bold text-smansa-gold text-lg">45,102</span>
                </div>
              </div>
            </div>

          </div>
          
          {/* Copyright Bar */}
          <div className="pt-8 border-t border-white/10 text-center flex flex-col md:flex-row justify-between items-center gap-4 text-blue-100/60 text-sm">
            <p>Copyright &copy; {new Date().getFullYear()} SMAN 1 Pamekasan. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-smansa-gold hover:text-white transition-all duration-300">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-smansa-gold hover:text-white transition-all duration-300">
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
