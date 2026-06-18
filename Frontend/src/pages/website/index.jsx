import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Announcement from "./components/Announcement";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";

import StatisticsSection from "./sections/StatisticsSection";
import SambutanSection from "./sections/SambutanSection";
import ProgramsSection from "./sections/ProgramsSection";
import AchievementsSection from "./sections/AchievementsSection";
import FacilitiesSection from "./sections/FacilitiesSection";
import TeachersSection from "./sections/TeachersSection";

import useLoginModal from "./hooks/useLoginModal";

import "./assets/styles/website.css";

export default function WebsiteHome() {
  const { isLoginOpen, openLogin, closeLogin } = useLoginModal();
  const [isScrolled, setIsScrolled] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    total_siswa: 0,
    total_pendaftar: 0,
    total_admin: 0,
    tahun_ajaran: '-',
  });

  // Handle scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle Reveal animations on scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Optionally unobserve if you only want it to animate once
          // observer.unobserve(entry.target);
        } else {
          // Keep it commented if you want it to trigger only once
          // entry.target.classList.remove('active');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('[class*="reveal"]');
    revealElements.forEach(el => observer.observe(el));

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  // Fetch Dashboard Data for live stats on homepage (polling every 30s)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.smansa.m-tech.fun";
        const res = await fetch(`${API_BASE_URL}/api/dashboard`, {
          headers: {
            'x-api-key': import.meta.env.VITE_API_KEY || 'smansa-secure-key-2026'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardStats(data.stats);
        }
      } catch (error) {
        console.error("Error fetching homepage stats:", error);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load Bootstrap ONLY for the website page
  useEffect(() => {
    const addLink = (id, href) => {
      if (!document.getElementById(id)) {
        const el = document.createElement("link");
        el.id = id;
        el.rel = "stylesheet";
        el.href = href;
        document.head.appendChild(el);
      }
    };

    const addScript = (id, src) => {
      if (!document.getElementById(id)) {
        const el = document.createElement("script");
        el.id = id;
        el.src = src;
        el.defer = true;
        document.body.appendChild(el);
      }
    };

    addLink("bootstrap-css", "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css");
    addLink("bootstrap-icons-css", "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");
    addScript("bootstrap-js", "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js");

    return () => {
      document.getElementById("bootstrap-css")?.remove();
      document.getElementById("bootstrap-icons-css")?.remove();
      document.getElementById("bootstrap-js")?.remove();
    };
  }, []);

  return (
    <div className="website-page">
      <Navbar onLoginClick={openLogin} isScrolled={isScrolled} isLoginOpen={isLoginOpen} />

      <main>
        <Hero onLoginClick={openLogin} stats={dashboardStats} />
        <StatisticsSection stats={dashboardStats} />
        <SambutanSection />
        <Features />
        <ProgramsSection />
        <AchievementsSection />
        <FacilitiesSection />
        <TeachersSection />
        <Announcement />
      </main>

      <Footer />

      <LoginModal open={isLoginOpen} onClose={closeLogin} />
    </div>
  );
}
