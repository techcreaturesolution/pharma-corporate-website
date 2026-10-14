import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../lib/hooks.js';
import { assetUrl } from '../lib/api.js';
import './preloader.css';

const normalizeUrl = (raw) => {
  if (!raw) return '';
  if (raw.includes('/uploads/')) {
    return `/uploads/${raw.split('/uploads/')[1]}`;
  }
  return assetUrl(raw);
};

export default function Preloader({ company: propCompany }) {
  const { data: settingsData } = useSettings();
  const settingsCompany = settingsData?.data?.company || {};
  const company = (propCompany?.navTitle || propCompany?.logo?.url) ? propCompany : settingsCompany;

  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const animRef = useRef(null);
  const hasFinishedRef = useRef(false);

  // Instantly initialize from cache if available so there is ZERO delay or flash on frame 0
  const [logoUrl, setLogoUrl] = useState(() => {
    const raw = company?.logo?.url;
    if (raw) return normalizeUrl(raw);
    try {
      const cached = localStorage.getItem('pharma_cached_logo');
      if (cached) return cached;
    } catch {}
    return '';
  });

  const [brandTitle, setBrandTitle] = useState(() => {
    const t = company?.navTitle || company?.name;
    if (t) return t;
    try {
      const cached = localStorage.getItem('pharma_cached_title');
      if (cached) return cached;
    } catch {}
    return 'BioPharma Care';
  });

  const [brandSubtitle, setBrandSubtitle] = useState(() => {
    const s = company?.navSmallText || company?.tagline;
    if (s) return s;
    try {
      const cached = localStorage.getItem('pharma_cached_subtitle');
      if (cached) return cached;
    } catch {}
    return 'FARMA SUITICALS';
  });

  // Sync settings when loaded from API and update cache
  useEffect(() => {
    const raw = company?.logo?.url;
    if (raw) {
      const n = normalizeUrl(raw);
      setLogoUrl(n);
      try {
        localStorage.setItem('pharma_cached_logo', n);
      } catch {}
    }

    const t = company?.navTitle || company?.name;
    if (t) {
      setBrandTitle(t);
      try {
        localStorage.setItem('pharma_cached_title', t);
      } catch {}
    }

    const s = company?.navSmallText || company?.tagline;
    if (s) {
      setBrandSubtitle(s);
      try {
        localStorage.setItem('pharma_cached_subtitle', s);
      } catch {}
    }
  }, [company?.logo?.url, company?.navTitle, company?.name, company?.navSmallText, company?.tagline]);

  useEffect(() => {
    // Lock scroll during preloader
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Hold at specific progress if requested in URL for design verification
    const searchParams = new URLSearchParams(window.location.search);
    const holdVal = searchParams.get('preloader_hold');
    if (holdVal !== null) {
      setProgress(Number(holdVal) || 50);
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }

    let lastTime = performance.now();
    const startTime = performance.now();
    const duration = 2500; // 2.5s smooth natural wave rise

    const tick = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);

      // Smooth easeInOut curve: starts gently, flows with momentum, eases into top
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const currentVal = ease * 100;

      setProgress(currentVal);

      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        finishPreloader();
      }
    };

    animRef.current = requestAnimationFrame(tick);

    // Development helper to inspect wave animation at any progress
    window.__pausePreloader = (val = 50) => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setProgress(val);
      setIsMounted(true);
      setIsExiting(false);
    };

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      delete window.__pausePreloader;
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const finishPreloader = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    // Brief pause at 100% to let user see fully filled glowing logo
    setTimeout(() => {
      setIsExiting(true);

      // Unmount after smooth exit fade
      setTimeout(() => {
        document.body.style.overflow = '';
        setIsMounted(false);
      }, 700);
    }, 450);
  };

  if (!isMounted) return null;

  return (
    <aside
      className={`preloader-overlay ${isExiting ? 'preloader-overlay--exiting' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading website"
    >
      {/* Ambient background glow ring */}
      <div className="preloader-ambient" />

      <div className="preloader-stage">
        {/* Logo Icon with Genuine Green Liquid Waves (#20BF55) Filling Animation */}
        <div 
          className="preloader-icon-stage"
          style={{ opacity: logoUrl ? 1 : 0, transition: 'opacity 0.2s ease' }}
        >
          {logoUrl && (
            <>
              {/* Layer 1: Empty Silhouette (Faint base outline of the icon) */}
              <img
                src={logoUrl}
                alt="Base Silhouette"
                className="preloader-icon-base"
              />

              {/* Layer 2: Masked Liquid Wave Tank rising inside the logo */}
              <div
                className="preloader-wave-tank"
                style={{
                  WebkitMaskImage: `url("${logoUrl}")`,
                  maskImage: `url("${logoUrl}")`,
                }}
              >
                <div
                  className="preloader-liquid-level"
                  style={{
                    transform: `translateY(${102 - (progress * 1.14)}%)`,
                  }}
                >
                  <div className="preloader-waves-wrap">
                    {/* Deep Back Liquid Wave (rolling left) */}
                    <svg
                      className="preloader-wave-svg wave--back"
                      viewBox="0 0 1200 500"
                      preserveAspectRatio="none"
                    >
                      <path d="M 0,25 C 14,44 36,44 50,25 C 64,6 86,6 100,25 C 114,44 136,44 150,25 C 164,6 186,6 200,25 C 214,44 236,44 250,25 C 264,6 286,6 300,25 C 314,44 336,44 350,25 C 364,6 386,6 400,25 C 414,44 436,44 450,25 C 464,6 486,6 500,25 C 514,44 536,44 550,25 C 564,6 586,6 600,25 C 614,44 636,44 650,25 C 664,6 686,6 700,25 C 714,44 736,44 750,25 C 764,6 786,6 800,25 C 814,44 836,44 850,25 C 864,6 886,6 900,25 C 914,44 936,44 950,25 C 964,6 986,6 1000,25 C 1014,44 1036,44 1050,25 C 1064,6 1086,6 1100,25 C 1114,44 1136,44 1150,25 C 1164,6 1186,6 1200,25 V 500 H 0 Z" />
                    </svg>

                    {/* Front Main Liquid Wave (rolling right) with liquid body */}
                    <svg
                      className="preloader-wave-svg wave--front"
                      viewBox="0 0 1200 500"
                      preserveAspectRatio="none"
                    >
                      <path d="M 0,25 C 14,6 36,6 50,25 C 64,44 86,44 100,25 C 114,6 136,6 150,25 C 164,44 186,44 200,25 C 214,6 236,6 250,25 C 264,44 286,44 300,25 C 314,6 336,6 350,25 C 364,44 386,44 400,25 C 414,6 436,6 450,25 C 464,44 486,44 500,25 C 514,6 536,6 550,25 C 564,44 586,44 600,25 C 614,6 636,6 650,25 C 664,44 686,44 700,25 C 714,6 736,6 750,25 C 764,44 786,44 800,25 C 814,6 836,6 850,25 C 864,44 886,44 900,25 C 914,6 936,6 950,25 C 964,44 986,44 1000,25 C 1014,6 1036,6 1050,25 C 1064,44 1086,44 1100,25 C 1114,6 1136,6 1150,25 C 1164,44 1186,44 1200,25 V 500 H 0 Z" />
                    </svg>

                    {/* Luminous Liquid Surface Line (moving with front wave) */}
                    <svg
                      className="preloader-wave-svg wave--crest-glow"
                      viewBox="0 0 1200 500"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M 0,25 C 14,6 36,6 50,25 C 64,44 86,44 100,25 C 114,6 136,6 150,25 C 164,44 186,44 200,25 C 214,6 236,6 250,25 C 264,44 286,44 300,25 C 314,6 336,6 350,25 C 364,44 386,44 400,25 C 414,6 436,6 450,25 C 464,44 486,44 500,25 C 514,6 536,6 550,25 C 564,44 586,44 600,25 C 614,6 636,6 650,25 C 664,44 686,44 700,25 C 714,6 736,6 750,25 C 764,44 786,44 800,25 C 814,6 836,6 850,25 C 864,44 886,44 900,25 C 914,6 936,6 950,25 C 964,44 986,44 1000,25 C 1014,6 1036,6 1050,25 C 1064,44 1086,44 1100,25 C 1114,6 1136,6 1150,25 C 1164,44 1186,44 1200,25"
                        fill="none"
                        stroke="#6aff9b"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Rising Effervescent Liquid Bubbles */}
                    <span className="preloader-bubble bubble-1" />
                    <span className="preloader-bubble bubble-2" />
                    <span className="preloader-bubble bubble-3" />
                    <span className="preloader-bubble bubble-4" />
                  </div>
                </div>
              </div>

              {/* Layer 3: Completed Logo revealed smoothly as wave finishes */}
              <img
                src={logoUrl}
                alt={brandTitle}
                className={`preloader-icon-complete ${progress >= 96 ? 'is-complete' : ''}`}
              />

              {/* Layer 4: Final glowing burst when complete */}
              <div className={`preloader-glow-ring ${progress >= 96 ? 'is-active' : ''}`} />
            </>
          )}
        </div>

        {/* Brand Text Liquid Filling */}
        <div className="preloader-brand">
          <div className="preloader-title-wrap">
            <span className="preloader-title preloader-title--base">
              {brandTitle}
            </span>
            <span
              className="preloader-title preloader-title--fill"
              style={{
                clipPath: `inset(${100 - progress}% 0 0 0)`,
              }}
            >
              {brandTitle}
            </span>
          </div>

          {brandSubtitle && (
            <div className="preloader-subtitle-wrap">
              <span className="preloader-subtitle preloader-subtitle--base">
                {brandSubtitle}
              </span>
              <span
                className="preloader-subtitle preloader-subtitle--fill"
                style={{
                  clipPath: `inset(${100 - progress}% 0 0 0)`,
                }}
              >
                {brandSubtitle}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
