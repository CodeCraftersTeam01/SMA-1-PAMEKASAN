import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && (data.success || data.token || data)) {
        localStorage.setItem('token', data.token || 'login_success');
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        navigate('/dashboard');
      } else {
        setError('Email atau kata sandi salah');
      }
    } catch (err) {
      setError('Email atau kata sandi salah');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f7f9] p-4 font-sans text-slate-800">
      <div className="max-w-[1000px] w-full grid md:grid-cols-2 gap-8 items-center scale-90 md:scale-95 origin-center">
        
        {/* Kolom Kiri: Branding */}
        <div className="hidden md:flex flex-col h-full py-8 pr-8">
          <div className="mb-8">
            <img 
              src="/public/logo-sma.png" 
              alt="Logo SMAN 1 Pamekasan" 
              className="w-[100px] h-auto object-contain"
            />
          </div>
          
          <div className="space-y-4 flex-grow">
            <h1 className="text-[2.75rem] font-bold text-[#1e293b] leading-[1.15] tracking-tight">
              SMAN 1 <br /> Pamekasan
            </h1>
            <p className="text-[#64748b] text-[13.5px] max-w-[340px] leading-relaxed">
              Website terintegrasi dengan joko kentir.
              selamat datang di website
            </p>
          </div>

          <div className="flex items-center gap-4 mt-16">
            <div className="w-8 h-px bg-slate-300"></div>
            <span className="text-[9px] tracking-[0.2em] text-slate-400 uppercase font-bold">
              Copyright by PENS Sumenep
            </span>
          </div>
        </div>

        {/* Kolom Kanan: Login Card */}
        <div className="relative w-full max-w-[380px] mx-auto md:ml-auto">
          {/* Shadow container with clip-path shape */}
          <div className="absolute inset-0 drop-shadow-[0_12px_28px_rgba(0,0,0,0.04)]">
            <div 
              className="w-full h-full bg-white rounded-t-[16px]"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 28px), 50% 100%, 0 calc(100% - 28px))' }}
            ></div>
          </div>
          
          <div className="relative z-10 p-8 pb-12">
            
            <div className="text-center mb-8 mt-1">
              <h2 className="text-[30px] font-bold text-[#1e293b]">Selamat datang kembali</h2>
              <p className="text-[12px] text-[#94a3b8] mt-2">
                Silahkan masukkan email dan password Anda untuk mengakses akun
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-[11px] rounded-lg text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5">
              {/* Input Registration ID */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block ml-1">
                  Akun email
                </label>
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-3 rounded-lg bg-[#f8fafc] border border-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-[12px] text-slate-600 placeholder:text-slate-300"
                />
              </div>

              {/* Input Password */}
              <div className="space-y-1 pt-0.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                    Kata sandi
                  </label>
                  <a href="#" className="text-[10px] text-[#94a3b8] hover:text-blue-500 transition-colors">
                    Lupa Kata Sandi?
                  </a>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-3 rounded-lg bg-[#f8fafc] border border-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-[12px] text-slate-600 placeholder:text-slate-300 tracking-widest"
                  />
                  {/* Optional eye icon toggle */}
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Keep me logged in */}
              <div className="flex items-center gap-2 ml-1 pt-1 mb-1.5">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="w-3.5 h-3.5 rounded border-slate-200 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-[#f8fafc] cursor-pointer"
                />
                <label htmlFor="remember" className="text-[10px] text-[#94a3b8] cursor-pointer">
                  Ingat saya
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-[#4685ff] hover:bg-[#3b75e6] text-white text-[11px] font-bold py-3.5 rounded-[6px] transition-all border border-[#2d68e1] uppercase tracking-[0.1em] ${isLoading ? 'opacity-70 cursor-not-allowed shadow-none translate-y-[3px]' : 'shadow-[0_3px_0_0_#2d68e1] active:translate-y-[3px] active:shadow-none'}`}
                >
                  {isLoading ? 'Memproses...' : 'Masuk'}
                </button>
              </div>
            </form>

            <div className="mt-12 text-center">
              <p className="text-[10px] text-[#cbd5e1]">
                © 2026 SMAN 1 Pamekasan | <a href="#">PENS PSDKU SUMENEP</a>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;