import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ isScrolled, navItems = [] }) {
  return (
    <div className={`fixed w-full z-50 transition-all duration-500 px-4 flex justify-center ${isScrolled ? 'top-4' : 'top-6'}`}>
      <nav className={`w-full max-w-5xl rounded-full transition-all duration-500 border ${isScrolled ? 'bg-white/95 shadow-xl text-smansa-navy py-2 lg:py-2.5 border-gray-200 backdrop-blur-md' : 'bg-white/10 text-white py-2 lg:py-3 border-white/20 backdrop-blur-md shadow-2xl'}`}>
        <div className="px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo-sma.png" alt="Logo SMAN 1" className="w-7 h-7 md:w-8 md:h-8 object-contain" />
            <div className="flex flex-col">
              <span className="font-sans font-bold text-xs md:text-sm leading-tight">SMAN 1 Pamekasan</span>
              <span className={`text-[7px] md:text-[8px] tracking-[0.2em] font-bold uppercase ${isScrolled ? 'text-smansa-gold' : 'text-blue-200'}`}>School of Excellence</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6 font-bold text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
            {navItems.map(item => {
              const hasChildren = item.children && item.children.length > 0;

              const renderLink = (childItem, cls) => {
                const childHash = childItem.url ? childItem.url.startsWith('#') : false;
                const childHref = childHash ? `/${childItem.url}` : (childItem.url || '#');
                if (!childItem.url) return <span key={childItem.id} className={cls + " cursor-pointer"}>{childItem.label}</span>;
                if (childItem.url.startsWith('/')) return <Link key={childItem.id} to={childItem.url} className={cls}>{childItem.label}</Link>;
                if (childHash) return <a key={childItem.id} href={childHref} className={cls}>{childItem.label}</a>;
                return <a key={childItem.id} href={childItem.url} target="_blank" rel="noopener noreferrer" className={cls}>{childItem.label}</a>;
              };

              if (hasChildren) {
                return (
                  <div key={item.id} className="relative group py-2">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-blue-400 transition-colors">
                      {item.url ? renderLink(item, "") : <span>{item.label}</span>}
                      <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left scale-95 group-hover:scale-100 overflow-hidden flex flex-col py-2">
                      {item.children.map(child => renderLink(child, "px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors block text-left font-semibold"))}
                    </div>
                  </div>
                );
              }

              return renderLink(item, "hover:text-blue-400 transition-colors");
            })}

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
