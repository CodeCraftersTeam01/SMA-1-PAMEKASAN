import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.smansa.m-tech.fun";
const API_KEY = import.meta.env.VITE_API_KEY || "smansa-secure-key-2026";

/**
 * Shared hook to fetch the dynamic landing page settings (hero, sambutan,
 * contact/footer) that staff manage from the dashboard.
 */
export default function useLandingSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/landing-settings`, {
          headers: { "x-api-key": API_KEY },
          cache: "no-cache" // Bypass browser cache so updates are instantly visible
        });
        if (res.ok) {
          const json = await res.json();
          if (active) setSettings(json?.data || null);
        }
      } catch (error) {
        console.error("Error fetching landing settings:", error);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchSettings();
    return () => {
      active = false;
    };
  }, []);

  return { settings, loading, API_BASE_URL };
}
