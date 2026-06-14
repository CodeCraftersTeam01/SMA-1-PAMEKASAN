import React from 'react';
import { motion } from 'framer-motion';

export default function Sambutan({ fadeUp, staggerContainer }) {
  return (
    <section id="sambutan" className="pt-40 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="w-full lg:w-5/12">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-gray-200">
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop" alt="Kepala Sekolah" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-smansa-navy/80 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="font-bold text-xl">Drs. Moh. Ali, M.Pd</p>
                <p className="text-blue-200 text-sm">Kepala SMAN 1 Pamekasan</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="w-full lg:w-7/12">
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-bold text-smansa-navy mb-6 tracking-tight leading-tight">
              Sambutan Kepala Sekolah<br/><span className="text-smansa-gold">SMAN 1 Pamekasan</span>
            </motion.h2>
            <motion.div variants={fadeUp} className="text-gray-600 text-lg leading-relaxed space-y-6">
              <p>
                Segala puji bagi Allah SWT Tuhan Yang Maha Esa atas rahmat dan karunia-Nya. Selamat datang di portal resmi SMAN 1 Pamekasan.
              </p>
              <p>
                Di era digital yang serba cepat ini, kami berkomitmen tidak hanya mencetak siswa yang unggul secara akademik, namun juga tangguh karakternya, serta memiliki wawasan teknologi yang mumpuni untuk bersaing secara global. Mari bersama mewujudkan masa depan yang cemerlang!
              </p>
              <p className="font-bold text-smansa-navy mt-8 text-xl italic">
                — Drs. Moh. Ali, M.Pd
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
