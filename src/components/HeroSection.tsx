import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Navigation, MapPin, ShieldCheck, ExternalLink } from 'lucide-react';
import { CLINIC_CONFIG, TRANSLATIONS, Language } from '../config/clinicConfig';

interface HeroSectionProps {
  lang: Language;
  clinicName?: string;
  doctorName?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  lang,
  clinicName,
  doctorName,
}) => {
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ur';

  const currentDoctorName = doctorName || CLINIC_CONFIG.doctorName[lang];

  return (
    <section
      id="home"
      className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden bg-gradient-to-b from-[#F8F7F2] via-[#F8F7F2] to-white border-b border-[#DCE5E0]/70"
    >
      {/* Subtle architectural background accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-[520px] bg-[radial-gradient(ellipse_at_top_right,_rgba(167,196,181,0.22),_transparent_65%)]"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#E6EFEA] border border-[#A7C4B5]/60 text-[#1D5B4A] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#1D5B4A]" />
            <span className="eyebrow-text text-xs font-semibold tracking-[0.14em] uppercase">
              {t.hero.eyebrow}
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className={`font-serif font-semibold text-[#123D35] tracking-tight mb-6 ${
              isRtl
                ? 'text-3xl sm:text-5xl leading-[1.85]'
                : 'text-4xl sm:text-5xl lg:text-[3.65rem] leading-[1.1]'
            }`}
          >
            {t.hero.title}
          </h1>

          {/* Lead Subtitle */}
          <p className="text-base sm:text-lg text-[#66736D] max-w-2xl leading-relaxed mb-8">
            {t.hero.subtitle}
          </p>

          {/* Doctor & Landmark Attribution Callout */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 py-4 px-5 rounded-2xl bg-white border border-[#DCE5E0] shadow-clinic-subtle mb-9 max-w-2xl">
            <div className="flex items-center gap-3.5">
              <img
                src={CLINIC_CONFIG.images.doctor}
                alt={currentDoctorName}
                className="w-12 h-12 rounded-xl object-cover object-top border border-[#A7C4B5]"
              />
              <div>
                <span className="block text-xs uppercase tracking-wider text-[#1D5B4A] font-semibold eyebrow-text">
                  {t.hero.doctorLabel}
                </span>
                <strong className="text-base sm:text-lg font-bold text-[#123D35]">
                  {currentDoctorName}
                </strong>
              </div>
            </div>

            <div className="hidden sm:block w-px h-10 bg-[#DCE5E0]" />

            <div className="flex items-start gap-2.5 text-sm text-[#66736D]">
              <MapPin className="w-4 h-4 text-[#1D5B4A] shrink-0 mt-1" />
              <div>
                <span className="font-semibold text-[#182522] block">
                  {CLINIC_CONFIG.locationShort[lang]}
                </span>
                <span className="text-xs text-[#66736D]">
                  {t.hero.landmarkLabel}
                </span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3.5">
            <a
              href="#enquiry"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#123D35] hover:bg-[#1D5B4A] text-white font-semibold text-[15px] transition-all shadow-clinic hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4 text-[#A7C4B5] shrink-0" />
              <span>{t.hero.primaryCta}</span>
            </a>

            <a
              href={CLINIC_CONFIG.googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-[#F8F7F2] text-[#123D35] border border-[#123D35]/25 hover:border-[#123D35] font-semibold text-[15px] transition-all"
            >
              <Navigation className="w-4 h-4 text-[#1D5B4A] shrink-0" />
              <span>{t.hero.secondaryCta}</span>
            </a>

            <a
              href={CLINIC_CONFIG.justdialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-[#1D5B4A] hover:text-[#123D35] underline-offset-4 hover:underline transition-colors"
            >
              <span>{t.hero.justdialCta}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>

          {/* Subtle Trust Pillars */}
          <div className="mt-10 pt-7 border-t border-[#DCE5E0]/80 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs sm:text-sm text-[#66736D] font-medium">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1D5B4A]" />
              {t.hero.trustBadge1}
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1D5B4A]" />
              {t.hero.trustBadge2}
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1D5B4A]" />
              {t.hero.trustBadge3}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
