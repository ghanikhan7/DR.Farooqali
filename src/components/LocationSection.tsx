import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Copy, Check, ExternalLink, Compass } from 'lucide-react';
import { CLINIC_CONFIG, TRANSLATIONS, Language } from '../config/clinicConfig';

interface LocationSectionProps {
  lang: Language;
  clinicName?: string;
  doctorName?: string;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  lang,
  clinicName,
  doctorName,
}) => {
  const [copied, setCopied] = useState(false);
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ur';

  const currentClinicName = clinicName || CLINIC_CONFIG.clinicName[lang];
  const currentDoctorName = doctorName || CLINIC_CONFIG.doctorName[lang];

  const handleCopyAddress = async () => {
    const fullText = `${currentClinicName} — ${currentDoctorName}, ${CLINIC_CONFIG.address[lang]} (${CLINIC_CONFIG.landmark[lang]})`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback ignored
    }
  };

  return (
    <section id="location" className="py-20 sm:py-28 bg-white border-b border-[#DCE5E0]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <p className="eyebrow-text text-xs font-semibold uppercase tracking-[0.16em] text-[#1D5B4A] mb-3">
            {t.location.eyebrow}
          </p>
          <h2
            className={`font-serif font-semibold text-[#123D35] mb-4 ${
              isRtl ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-4xl lg:text-[2.65rem]'
            }`}
          >
            {t.location.title}
          </h2>
          <p className="text-base sm:text-lg text-[#66736D] leading-relaxed">
            {t.location.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Address & Landmark Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-5 rounded-3xl bg-[#F8F7F2] border border-[#DCE5E0] p-7 sm:p-9 flex flex-col justify-between"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#123D35] text-white text-xs font-semibold mb-6">
                <Compass className="w-4 h-4 text-[#A7C4B5]" />
                <span>{t.location.addressCardTitle}</span>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="eyebrow-text text-xs font-semibold uppercase tracking-[0.14em] text-[#1D5B4A] block mb-1.5">
                    {t.location.addressLabel}
                  </span>
                  <p className="font-serif text-xl sm:text-2xl font-bold text-[#123D35] leading-snug">
                    {currentClinicName}
                  </p>
                  <p className="text-base text-[#182522] mt-1 leading-relaxed">
                    {CLINIC_CONFIG.address[lang]}
                  </p>
                </div>

                <div>
                  <span className="eyebrow-text text-xs font-semibold uppercase tracking-[0.14em] text-[#1D5B4A] block mb-1.5">
                    {t.location.landmarkLabel}
                  </span>
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#DCE5E0] text-[#123D35] font-semibold text-sm shadow-clinic-subtle">
                    <MapPin className="w-4 h-4 text-[#1D5B4A] shrink-0" />
                    <span>{CLINIC_CONFIG.landmark[lang]}</span>
                  </div>
                </div>

                <div>
                  <span className="eyebrow-text text-xs font-semibold uppercase tracking-[0.14em] text-[#1D5B4A] block mb-1">
                    {t.location.areaLabel}
                  </span>
                  <p className="text-sm font-medium text-[#66736D]">
                    {t.location.areaValue}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#DCE5E0] space-y-3">
              <a
                href={CLINIC_CONFIG.googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 w-full px-5 py-3.5 rounded-xl bg-[#123D35] hover:bg-[#1D5B4A] text-white font-semibold text-sm transition-all shadow-sm"
              >
                <Navigation className="w-4 h-4 text-[#A7C4B5] shrink-0" />
                <span>{t.location.openMapsBtn}</span>
              </a>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="inline-flex items-center justify-center gap-2 flex-1 px-4 py-3 rounded-xl bg-white hover:bg-[#E6EFEA]/50 border border-[#DCE5E0] text-[#123D35] font-semibold text-xs sm:text-sm transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#1D5B4A]" />
                      <span>{t.location.copiedAddressBtn}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#1D5B4A]" />
                      <span>{t.location.copyAddressBtn}</span>
                    </>
                  )}
                </button>

                <a
                  href={CLINIC_CONFIG.justdialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 flex-1 px-4 py-3 rounded-xl bg-white hover:bg-[#E6EFEA]/50 border border-[#DCE5E0] text-[#1D5B4A] font-semibold text-xs sm:text-sm transition-colors"
                >
                  <span>{t.location.justdialLinkText}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Interactive Google Map Embed */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="lg:col-span-7 rounded-3xl overflow-hidden border border-[#DCE5E0] bg-white shadow-clinic flex flex-col"
          >
            <div className="relative flex-1 min-h-[360px] sm:min-h-[440px] w-full bg-[#E6EFEA]">
              <iframe
                title={t.location.mapTitle}
                src={CLINIC_CONFIG.googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
