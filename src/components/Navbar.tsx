import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe, Menu, X, Calendar, Navigation } from 'lucide-react';
import { CLINIC_CONFIG, TRANSLATIONS, Language } from '../config/clinicConfig';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  clinicName?: string;
  doctorName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  clinicName,
  doctorName,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ur';

  const currentClinicName = clinicName || CLINIC_CONFIG.clinicName[lang];
  const currentDoctorName = doctorName || CLINIC_CONFIG.doctorName[lang];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '#home', label: t.nav.home },
    { href: '#doctor', label: t.nav.doctor },
    { href: '#clinic', label: t.nav.clinic },
    { href: '#services', label: t.nav.services },
    { href: '#care', label: t.nav.care },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#F8F7F2]/95 backdrop-blur-md border-b border-[#DCE5E0] shadow-clinic-subtle py-3'
          : 'bg-[#F8F7F2]/85 backdrop-blur-sm border-b border-[#DCE5E0]/60 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <a
            href="#home"
            className="group flex items-center gap-3.5 focus:outline-none"
          >
            <div className="w-11 h-11 rounded-xl bg-[#123D35] flex items-center justify-center text-white shadow-sm group-hover:bg-[#1D5B4A] transition-colors shrink-0 border border-[#A7C4B5]/30">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 stroke-current fill-none"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M12 4.5v15M4.5 12h15" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span
                className={`font-serif font-bold tracking-tight text-[#123D35] ${
                  isRtl ? 'text-xl leading-relaxed' : 'text-xl sm:text-2xl leading-none'
                }`}
              >
                {currentClinicName}
              </span>
              <span className="text-xs sm:text-sm text-[#66736D] font-medium mt-0.5">
                {currentDoctorName}
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[15px] font-medium text-[#182522]/85 hover:text-[#123D35] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:inset-x-0 after:h-[1.5px] after:bg-[#1D5B4A] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-center"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions: Language Switcher + CTA + Mobile Menu Button */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onToggleLang}
              aria-label={t.nav.switchLangAria}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#DCE5E0] bg-white hover:border-[#1D5B4A] text-[#123D35] text-sm font-semibold transition-all shadow-sm hover:bg-[#F8F7F2]"
            >
              <Globe className="w-4 h-4 text-[#1D5B4A] shrink-0" />
              <span className={lang === 'en' ? 'font-urdu text-sm leading-none pb-0.5' : 'font-sans text-xs tracking-wide'}>
                {t.nav.switchLang}
              </span>
            </button>

            <a
              href="#enquiry"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#123D35] hover:bg-[#1D5B4A] text-white text-sm font-semibold transition-all shadow-sm hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4 text-[#A7C4B5] shrink-0" />
              <span>{t.nav.bookCta}</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label="Toggle Menu"
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#DCE5E0] bg-white text-[#123D35] hover:bg-[#F8F7F2] transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="lg:hidden overflow-hidden bg-white border-b border-[#DCE5E0] shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-4 pt-3 pb-6 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-3 rounded-lg text-base font-medium text-[#182522] hover:bg-[#F8F7F2] hover:text-[#123D35] transition-colors border-b border-[#F8F7F2] last:border-none"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <a
                  href="#enquiry"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-lg bg-[#123D35] text-white font-semibold text-sm shadow-sm"
                >
                  <Calendar className="w-4 h-4 text-[#A7C4B5]" />
                  <span>{t.nav.bookCta}</span>
                </a>
                <a
                  href={CLINIC_CONFIG.googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-lg border border-[#123D35] text-[#123D35] font-semibold text-sm"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{t.hero.secondaryCta}</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
