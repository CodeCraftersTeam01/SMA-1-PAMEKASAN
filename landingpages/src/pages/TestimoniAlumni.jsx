import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import TestimonialForm from '../components/TestimonialForm';
import SEO from '../components/SEO';

export default function TestimoniAlumni() {
  const [testimonialDone, setTestimonialDone] = useState(false);

  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24 font-sans text-gray-800">
      <SEO 
        title="Kirim Testimoni Alumni"
        description="Berikan kesan dan pesan Anda selama menuntut ilmu di SMAN 1 Pamekasan. Testimoni Anda sangat berarti bagi pengembangan sekolah."
        keywords="testimoni alumni SMAN 1 Pamekasan, alumni SMANSA, kesan pesan SMANSA"
      />
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Kembali ke Beranda
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          {!testimonialDone ? (
            <>
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold text-smansa-navy mb-4 tracking-tight">Kirim Testimoni</h1>
                <p className="text-gray-600 text-lg max-w-xl mx-auto">
                  Silakan isi form di bawah untuk mengirimkan testimoni Anda. Kami sangat menghargai setiap masukan dan pengalaman Anda.
                </p>
              </div>

              <TestimonialForm 
                onSuccessCallback={() => setTestimonialDone(true)}
              />
            </>
          ) : (
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-blue-400 to-blue-600"></div>
              
              <h2 className="text-3xl font-bold text-smansa-navy mb-4 tracking-tight">Terima Kasih!</h2>
              <p className="text-gray-500 leading-relaxed max-w-sm mx-auto mb-10 text-base">
                Testimoni Anda telah berhasil dikirimkan dan menunggu persetujuan Admin sebelum ditampilkan ke publik.
              </p>
              
              <Link
                to="/"
                className="inline-block px-10 py-4 bg-smansa-navy text-white hover:bg-blue-900 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-xl hover:shadow-2xl cursor-pointer"
              >
                Kembali ke Beranda
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

