import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SplitText from '../SplitText';

export default function Navbar({ isScrolled, navItems = [], onLoginClick }) {
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedItem, setMobileExpandedItem] = useState(null);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  // Memaksa mode solid background/text gelap di halaman selain beranda (agar teks tidak putih di atas background abu-abu/putih)
  const applyScrolledStyle = isScrolled || !isHomePage;

  return (
    <div className={`fixed w-full z-50 transition-all duration-500 px-4 flex justify-center ${applyScrolledStyle ? 'top-4' : 'top-6'}`}>
      <nav className={`relative w-full max-w-5xl transition-all duration-500 border rounded-2xl lg:rounded-full ${applyScrolledStyle ? 'bg-white/95 shadow-xl text-smansa-navy py-2 lg:py-2.5 border-gray-200 backdrop-blur-md' : 'bg-white/10 text-white py-2 lg:py-3 border-white/20 backdrop-blur-md shadow-2xl'}`}>
        <div className="px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo-sma.png" alt="Logo SMAN 1" className="w-7 h-7 md:w-8 md:h-8 object-contain" />
            <div className="flex flex-col">
              <span className="font-sans font-bold text-xs md:text-sm leading-tight">SMAN 1 Pamekasan</span>
              <span className={`text-[7px] md:text-[8px] tracking-[0.2em] font-bold uppercase ${applyScrolledStyle ? 'text-smansa-gold' : 'text-blue-200'}`}>School of Excellence</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6 font-bold text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
            {navItems.map((item, index) => {
              const hasChildren = item.children && item.children.length > 0;
              const isHovered = hoveredItemId === item.id;

              const renderLink = (childItem, cls, animate = false) => {
                const childHash = childItem.url ? childItem.url.startsWith('#') : false;
                const childHref = childHash ? `/${childItem.url}` : (childItem.url || '#');
                
                const Label = animate ? (
                  <SplitText
                    key={`split-${childItem.id}`}
                    text={childItem.label}
                    tag="span"
                    delay={30}
                    duration={0.6}
                    ease="power3.out"
                    from={{ opacity: 0, y: 15 }}
                    to={{ opacity: 1, y: 0 }}
                  />
                ) : (
                  <span key={`text-${childItem.id}`}>{childItem.label}</span>
                );

                if (!childItem.url) return <span key={childItem.id} className={cls + " cursor-pointer"}>{Label}</span>;
                if (childItem.url.startsWith('/')) return <Link key={childItem.id} to={childItem.url} className={cls}>{Label}</Link>;
                if (childHash) return <a key={childItem.id} href={childHref} className={cls}>{Label}</a>;
                return <a key={childItem.id} href={childItem.url} target="_blank" rel="noopener noreferrer" className={cls}>{Label}</a>;
              };

              if (hasChildren) {
                return (
                  <div 
                    key={item.id} 
                    className="group py-2"
                    onMouseEnter={() => setHoveredItemId(item.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                  >
                    <div className="flex items-center gap-1 cursor-pointer hover:text-blue-400 transition-colors">
                      {item.url ? renderLink(item, "", true) : (
                        <span className="cursor-pointer">
                          <SplitText text={item.label} tag="span" delay={30} duration={0.6} from={{opacity: 0, y: 15}} to={{opacity: 1, y: 0}} />
                        </span>
                      )}
                      <svg className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {/* Antigravity-style Mega Menu Dropdown */}
                    <div className="absolute top-full left-0 right-0 -mt-4 pt-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="w-full bg-white rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.08)] border border-gray-100 flex overflow-hidden transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300 cursor-default">
                        {/* Left Panel */}
                        <div className="w-[40%] p-10 flex flex-col justify-between bg-gray-50/50">
                          <div>
                            <h3 className="text-xl font-medium text-gray-900 leading-snug tracking-tight mb-6 text-left">
                              {isHovered ? (
                                <SplitText
                                  key={`title-${item.id}`}
                                  text="Membangun generasi cerdas & berwawasan global"
                                  tag="span"
                                  delay={20}
                                  duration={0.6}
                                  ease="power3.out"
                                  splitType="words"
                                  textAlign="left"
                                  from={{ opacity: 0, y: 15 }}
                                  to={{ opacity: 1, y: 0 }}
                                />
                              ) : (
                                "Membangun generasi cerdas & berwawasan global"
                              )}
                            </h3>
                          </div>
                          <div className="text-left">
                            <Link to="/" className="inline-block px-5 py-2.5 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 rounded-full text-[13px] font-semibold text-gray-700 transition-colors text-left">
                              {isHovered ? (
                                <SplitText
                                  key={`btn-${item.id}`}
                                  text="Lihat detail"
                                  tag="span"
                                  delay={15}
                                  duration={0.5}
                                  ease="power3.out"
                                  textAlign="left"
                                  from={{ opacity: 0, y: 10 }}
                                  to={{ opacity: 1, y: 0 }}
                                />
                              ) : (
                                "Lihat detail"
                              )}
                            </Link>
                          </div>
                        </div>
                        
                        {/* Vertical Separator and Right Panel */}
                        <div className="w-[60%] p-8 flex flex-col gap-2 relative bg-white border-l border-gray-100">
                          {item.children.map(child => renderLink(child, "px-4 py-3 text-[14px] text-gray-600 hover:text-gray-900 transition-colors block text-left font-medium rounded-xl hover:bg-gray-50", isHovered))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return renderLink(item, "hover:text-blue-400 transition-colors", true);
            })}

            <div className="flex items-center gap-3 border-l pl-6 border-white/20">
              <button onClick={onLoginClick} className="bg-smansa-navy text-white px-5 py-2 rounded-full font-bold hover:bg-blue-800 transition-all duration-300 hover:scale-105 shadow-md cursor-pointer">
                Portal Admin
              </button>
            </div>
          </div>
          
          {/* Mobile Menu Toggle Button */}
          <button 
            className="lg:hidden p-2 text-current outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={`lg:hidden flex flex-col gap-4 ${applyScrolledStyle ? 'text-smansa-navy' : 'text-white'}`}
            >
              <div className={`border-t pt-4 pb-4 px-6 flex flex-col gap-4 ${applyScrolledStyle ? 'border-gray-200' : 'border-white/20'}`}>
                {navItems.map(item => {
                  const hasChildren = item.children && item.children.length > 0;
                  return (
                    <div key={item.id} className="flex flex-col">
                      <div className="flex justify-between items-center cursor-pointer font-bold text-sm" onClick={() => {
                        if (hasChildren) {
                          setMobileExpandedItem(mobileExpandedItem === item.id ? null : item.id);
                        } else if (item.url) {
                          setIsMobileMenuOpen(false);
                        }
                      }}>
                        {item.url ? (
                          item.url.startsWith('/') 
                            ? <Link to={item.url} onClick={() => setIsMobileMenuOpen(false)}>{item.label}</Link> 
                            : <a href={item.url} target={item.url.startsWith('#') ? '_self' : '_blank'} rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)}>{item.label}</a>
                        ) : (
                          <span>{item.label}</span>
                        )}
                        {hasChildren && (
                          <svg className={`w-4 h-4 transition-transform duration-300 ${mobileExpandedItem === item.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        )}
                      </div>
                      <AnimatePresence>
                        {hasChildren && mobileExpandedItem === item.id && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col gap-3 pl-4 border-l border-current/20 overflow-hidden"
                          >
                            <div className="mt-3 flex flex-col gap-3">
                              {item.children.map(child => (
                                <div key={child.id} className="text-sm">
                                  {child.url && child.url.startsWith('/') 
                                    ? <Link to={child.url} onClick={() => setIsMobileMenuOpen(false)}>{child.label}</Link> 
                                    : <a href={child.url} target={child.url.startsWith('#') ? '_self' : '_blank'} rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)}>{child.label}</a>}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
                <button onClick={() => { setIsMobileMenuOpen(false); onLoginClick(); }} className="mt-4 bg-smansa-navy text-white px-5 py-2.5 rounded-full font-bold shadow-md w-full active:scale-95 transition-transform duration-200">
                  Portal Admin
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
