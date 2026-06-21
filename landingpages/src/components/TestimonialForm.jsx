import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function TestimonialForm({ 
  lockedRole = null, 
  defaultName = "", 
  defaultGraduationYear = "", 
  defaultOccupation = "",
  onSuccessCallback = null 
}) {
  const [formData, setFormData] = useState({
    name: defaultName,
    role: lockedRole || "alumni",
    graduation_year: defaultGraduationYear,
    current_occupation: defaultOccupation,
    message: "",
    imageFile: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, imageFile: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setIsSuccess(false);

    const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const API_BASE_URL = rawApiUrl.replace(/\/$/, "");
    const apiKey = import.meta.env.VITE_API_KEY || "smansa-secure-key-2026";

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("role", formData.role);
    payload.append("message", formData.message);
    if (formData.graduation_year) payload.append("graduation_year", formData.graduation_year);
    if (formData.current_occupation) payload.append("current_occupation", formData.current_occupation);
    if (formData.imageFile) payload.append("image", formData.imageFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/public/testimonials`, payload, {
        headers: {
          "x-api-key": import.meta.env.VITE_API_KEY,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201 || response.data?.success) {
        setIsSuccess(true);
        setFormData({
          name: defaultName,
          role: lockedRole || "alumni",
          graduation_year: defaultGraduationYear,
          current_occupation: defaultOccupation,
          message: "",
          imageFile: null,
        });
        const fileInput = document.getElementById('testimonial-image');
        if (fileInput) fileInput.value = '';
        
        if (onSuccessCallback) {
          onSuccessCallback();
        }
      }
    } catch (err) {
      console.error("Failed to submit testimonial:", err);
      setErrorMsg(err.response?.data?.message || "Terjadi kesalahan saat mengirim testimoni. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
    >
      <div className="p-8 md:p-12">
        <h3 className="text-2xl font-bold text-smansa-navy mb-2 tracking-tight">Kirim Testimoni Anda</h3>
        <p className="text-gray-500 mb-8">
          Ceritakan pengalaman Anda bersama SMAN 1 Pamekasan. Testimoni Anda akan sangat berarti bagi kami.
        </p>

        {isSuccess && (
          <div className="mb-8 p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl flex items-start gap-3">
            <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-bold">Berhasil Dikirim!</h4>
              <p className="text-sm mt-1">Terima kasih! Testimoni Anda telah dikirim dan sedang menunggu persetujuan Admin.</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                readOnly={!!lockedRole}
                className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-smansa-navy/20 focus:border-smansa-navy outline-none transition-all ${!!lockedRole ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:bg-white'}`}
                placeholder="Masukkan nama lengkap Anda"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Peran *</label>
              {lockedRole ? (
                <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed capitalize">
                  {lockedRole}
                </div>
              ) : (
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-smansa-navy/20 focus:border-smansa-navy outline-none transition-all"
                >
                  <option value="alumni">Alumni</option>
                  <option value="siswa">Siswa Aktif</option>
                  <option value="orangtua">Orang Tua / Wali</option>
                </select>
              )}
            </div>
          </div>

          {formData.role === "alumni" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tahun Lulus</label>
                <input
                  type="number"
                  name="graduation_year"
                  value={formData.graduation_year}
                  onChange={handleChange}
                  readOnly={!!lockedRole && !!defaultGraduationYear}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-smansa-navy/20 focus:border-smansa-navy outline-none transition-all ${!!lockedRole && !!defaultGraduationYear ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:bg-white'}`}
                  placeholder="Contoh: 2024"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pekerjaan/Kampus Saat Ini</label>
                <input
                  type="text"
                  name="current_occupation"
                  value={formData.current_occupation}
                  onChange={handleChange}
                  readOnly={!!lockedRole && !!defaultOccupation}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-smansa-navy/20 focus:border-smansa-navy outline-none transition-all ${!!lockedRole && !!defaultOccupation ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:bg-white'}`}
                  placeholder="Contoh: Mahasiswa ITS / Software Engineer"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Pesan Testimoni *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-smansa-navy/20 focus:border-smansa-navy outline-none transition-all resize-y"
              placeholder="Ceritakan pengalaman berkesan Anda..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Foto / Avatar (Opsional)</label>
            <div className="flex items-center gap-4">
              {formData.imageFile && (
                <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
                  <img src={URL.createObjectURL(formData.imageFile)} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <input
                id="testimonial-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3.5 bg-smansa-gold hover:bg-yellow-500 text-smansa-navy font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(250,204,21,0.4)] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-smansa-navy/30 border-t-smansa-navy rounded-full animate-spin"></div>
                  Mengirim...
                </>
              ) : (
                <>
                  Kirim Testimoni
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
