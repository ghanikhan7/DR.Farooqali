import React from 'react';
import { MapPin, ExternalLink, Heart } from 'lucide-react';
import { CLINIC_CONFIG, TRANSLATIONS, Language } from '../config/clinicConfig';

interface FooterProps {
  lang: Language;
  onToggleLang: () => void;
  clinicName?: string;
  doctorName?: string;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onToggleLang,
  clinicName,
  doctorName,
}) => {
  const t = TRANSLATIONS[lang];

  const currentClinicName = clinicName || CLINIC_CONFIG.clinicName[lang];
  const currentDoctorName = doctorName || CLINIC_CONFIG.doctorName[lang];

  return (
    <footer className="bg-[#F8F7F2] border-t border-[#DCE5E0] text-[#66736D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#DCE5E0]">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#123D35] flex items-center justify-center text-white shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 stroke-current fill-none"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="M12 4.5v15M4.5 12h15" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#123D35]">
                  {currentClinicName}
                </h3>
                <p className="text-sm font-medium text-[#1D5B4A]">
                  {currentDoctorName}
                </p>
              </div>
            </div>
            <p className="text-sm text-[#66736D] max-w-sm leading-relaxed mb-5">
              {t.footer.description}
            </p>
            <button
              type="button"
              onClick={onToggleLang}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#DCE5E0] bg-white hover:border-[#1D5B4A] text-xs font-semibold text-[#123D35] transition-colors"
            >
              <span>{t.nav.switchLang}</span>
            </button>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3">
            <h4 className="eyebrow-text text-xs font-semibold uppercase tracking-[0.14em] text-[#123D35] mb-4">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#home" className="hover:text-[#123D35] transition-colors">
                  {t.nav.home}
                </a>
              </li>
              <li>
                <a href="#doctor" className="hover:text-[#123D35] transition-colors">
                  {t.nav.doctor}
                </a>
              </li>
              <li>
                <a href="#clinic" className="hover:text-[#123D35] transition-colors">
                  {t.nav.clinic}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#123D35] transition-colors">
                  {t.nav.services}
                </a>
              </li>
              <li>
                <a href="#care" className="hover:text-[#123D35] transition-colors">
                  {t.nav.care}
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-[#123D35] transition-colors">
                  {t.nav.location}
                </a>
              </li>
              <li>
                <a href="#enquiry" className="hover:text-[#123D35] transition-colors">
                  {t.nav.enquiry}
                </a>
              </li>
            </ul>
          </div>

          {/* Address & Landmark Column */}
          <div className="md:col-span-4">
            <h4 className="eyebrow-text text-xs font-semibold uppercase tracking-[0.14em] text-[#123D35] mb-4">
              {t.footer.locationHeading}
            </h4>
            <address className="not-italic text-sm space-y-2.5 text-[#182522]/85">
              <p className="leading-relaxed">{CLINIC_CONFIG.address[lang]}</p>
              <p className="inline-flex items-center gap-1.5 text-[#1D5B4A] font-medium">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>
                  {t.footer.landmarkPrefix} {CLINIC_CONFIG.landmark[lang]}
                </span>
              </p>
            </address>

            <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-[#123D35]">
              <a
                href={CLINIC_CONFIG.googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-[#1D5B4A] underline underline-offset-4"
              >
                <span>{t.hero.secondaryCta}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={CLINIC_CONFIG.justdialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-[#1D5B4A] underline underline-offset-4"
              >
                <span>Justdial</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar with AlisTech Credit */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <p>{t.footer.copyright}</p>
            <span aria-hidden="true" className="text-[#DCE5E0]">·</span>
            <a
              href="#admin"
              className="text-xs text-[#66736D]/80 hover:text-[#123D35] transition-colors"
            >
              Admin
            </a>
          </div>
          <p className="inline-flex items-center gap-1.5 text-[#182522]">
            <Heart className="w-3.5 h-3.5 text-[#1D5B4A] fill-[#1D5B4A]" />
            <span>{t.footer.creditPrefix}</span>
            <a
              href={CLINIC_CONFIG.alistechUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#123D35] hover:text-[#1D5B4A] underline underline-offset-4 transition-colors"
            >
              {t.footer.creditBrand}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
