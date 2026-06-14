import React from 'react';

export default function Navbar({ isScrolled }) {
  return (
    <div className={`fixed w-full z-50 transition-all duration-500 px-4 flex justify-center ${isScrolled ? 'top-4' : 'top-6'}`}>
      <nav className={`w-full max-w-5xl rounded-full transition-all duration-500 border ${isScrolled ? 'bg-white/95 shadow-xl text-smansa-navy py-2 lg:py-2.5 border-gray-200 backdrop-blur-md' : 'bg-white/10 text-white py-2 lg:py-3 border-white/20 backdrop-blur-md shadow-2xl'}`}>
        <div className="px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-sma.png" alt="Logo SMAN 1" className="w-7 h-7 md:w-8 md:h-8 object-contain" />
            <div className="flex flex-col">
              <span className="font-sans font-bold text-xs md:text-sm leading-tight">SMAN 1 Pamekasan</span>
              <span className={`text-[7px] md:text-[8px] tracking-[0.2em] font-bold uppercase ${isScrolled ? 'text-smansa-gold' : 'text-blue-200'}`}>School of Excellence</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-6 font-bold text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
            <a href="#sambutan" className="hover:text-blue-400 transition-colors">Profil</a>
            <a href="#keunggulan" className="hover:text-blue-400 transition-colors">Program</a>
            <a href="#prestasi" className="hover:text-blue-400 transition-colors">Prestasi</a>
            <a href="#guru" className="hover:text-blue-400 transition-colors">Guru</a>
            <a href="#agenda" className="hover:text-blue-400 transition-colors">Agenda</a>
            <a href="#berita" className="hover:text-blue-400 transition-colors">Berita</a>
            <div className="flex items-center gap-3 border-l pl-6 border-white/20">
              <div className="flex bg-black/20 rounded-full p-0.5 border border-white/10">
                <span className="bg-smansa-navy text-white text-[9px] px-2.5 py-1 rounded-full font-bold">ID</span>
                <span className="text-gray-300 text-[9px] px-2.5 py-1 font-bold">EN</span>
              </div>
              <a href="http://localhost:5173/dashboard" className="bg-smansa-navy text-white px-5 py-2 rounded-full font-bold hover:bg-blue-800 transition-all duration-300 hover:scale-105 shadow-md">
                Portal Admin
              </a>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
