import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, ExternalLink, Clock, MapPin, Building } from 'lucide-react';
import { CLINIC_CONFIG, TRANSLATIONS, Language } from '../config/clinicConfig';

interface ClinicSectionProps {
  lang: Language;
  clinicName?: string;
  doctorName?: string;
}

export const ClinicSection: React.FC<ClinicSectionProps> = ({
  lang,
  clinicName,
  doctorName,
}) => {
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ur';
  const verifiedHours = CLINIC_CONFIG.hours[lang] || CLINIC_CONFIG.hours.en;

  const currentClinicName = clinicName || CLINIC_CONFIG.clinicName[lang];
  const currentDoctorName = doctorName || CLINIC_CONFIG.doctorName[lang];

  return (
    <section
      id="clinic"
      className="py-20 sm:py-28 bg-[#F8F7F2] border-b border-[#DCE5E0]/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Left Narrative + Real Clinic Photograph */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <p className="eyebrow-text text-xs font-semibold uppercase tracking-[0.16em] text-[#1D5B4A] mb-3">
              {t.clinic.eyebrow}
            </p>

            <h2
              className={`font-serif font-semibold text-[#123D35] mb-6 ${
                isRtl ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-4xl lg:text-[2.65rem]'
              }`}
            >
              {t.clinic.title}
            </h2>

            <div className="space-y-4 text-[#66736D] text-base sm:text-[17px] leading-relaxed mb-8">
              <p>{t.clinic.description1}</p>
              <p>{t.clinic.description2}</p>
            </div>

            {/* Real Clinic Photograph */}
            <figure className="rounded-2xl overflow-hidden bg-white border border-[#DCE5E0] shadow-clinic p-3 sm:p-4">
              <div className="rounded-xl overflow-hidden bg-[#182522]">
                <img
                  src={CLINIC_CONFIG.images.clinic}
                  alt={t.clinic.imageAlt}
                  loading="lazy"
                  className="w-full h-auto max-h-[430px] object-cover block"
                />
              </div>
              <figcaption className="pt-3 px-2 text-xs sm:text-sm text-[#66736D] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1D5B4A] shrink-0" />
                <span>{t.clinic.imageCaption}</span>
              </figcaption>
            </figure>
          </motion.div>

          {/* Right Official Clinic Directory Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="lg:col-span-5 lg:sticky lg:top-28"
          >
            <div className="rounded-3xl bg-white border border-[#DCE5E0] shadow-clinic p-7 sm:p-9">
              <div className="flex items-center gap-3 pb-6 mb-6 border-b border-[#DCE5E0]">
                <div className="w-11 h-11 rounded-xl bg-[#123D35] text-white flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5 text-[#A7C4B5]" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#1D5B4A] font-semibold eyebrow-text block">
                    {CLINIC_CONFIG.locationShort[lang]}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#123D35]">
                    {t.clinic.detailsTitle}
                  </h3>
                </div>
              </div>

              <dl className="space-y-5 text-sm sm:text-base">
                <div className="pb-4 border-b border-[#F8F7F2]">
                  <dt className="eyebrow-text text-xs font-semibold uppercase tracking-[0.14em] text-[#1D5B4A] mb-1">
                    {t.clinic.clinicLabel}
                  </dt>
                  <dd className="font-semibold text-[#182522] text-lg">
                    {currentClinicName}
                  </dd>
                </div>

                <div className="pb-4 border-b border-[#F8F7F2]">
                  <dt className="eyebrow-text text-xs font-semibold uppercase tracking-[0.14em] text-[#1D5B4A] mb-1">
                    {t.clinic.doctorLabel}
                  </dt>
                  <dd className="font-semibold text-[#182522]">
                    {currentDoctorName}
                  </dd>
                </div>

                <div className="pb-4 border-b border-[#F8F7F2]">
                  <dt className="eyebrow-text text-xs font-semibold uppercase tracking-[0.14em] text-[#1D5B4A] mb-1">
                    {t.clinic.addressLabel}
                  </dt>
                  <dd className="text-[#182522] leading-relaxed">
                    {CLINIC_CONFIG.address[lang]}
                  </dd>
                </div>

                <div className="pb-4 border-b border-[#F8F7F2]">
                  <dt className="eyebrow-text text-xs font-semibold uppercase tracking-[0.14em] text-[#1D5B4A] mb-1">
                    {t.clinic.landmarkLabel}
                  </dt>
                  <dd className="inline-flex items-center gap-2 font-medium text-[#123D35] bg-[#E6EFEA] px-3 py-1 rounded-lg text-sm mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#1D5B4A] shrink-0" />
                    <span>{CLINIC_CONFIG.landmark[lang]}</span>
                  </dd>
                </div>

                <div>
                  <dt className="eyebrow-text text-xs font-semibold uppercase tracking-[0.14em] text-[#1D5B4A] mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t.clinic.hoursLabel}</span>
                  </dt>
                  <dd className="text-sm text-[#66736D]">
                    {verifiedHours ? (
                      <span className="font-semibold text-[#182522]">{verifiedHours}</span>
                    ) : (
                      t.clinic.hoursPending
                    )}
                  </dd>
                </div>
              </dl>

              <div className="mt-8 pt-6 border-t border-[#DCE5E0] flex flex-col gap-3">
                <a
                  href={CLINIC_CONFIG.googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl bg-[#123D35] hover:bg-[#1D5B4A] text-white font-semibold text-sm transition-all shadow-sm"
                >
                  <Navigation className="w-4 h-4 text-[#A7C4B5] shrink-0" />
                  <span>{t.clinic.directionsBtn}</span>
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="#enquiry"
                    className="inline-flex items-center justify-center px-4 py-3 rounded-xl border border-[#DCE5E0] hover:border-[#123D35] text-[#123D35] font-semibold text-xs sm:text-sm transition-colors text-center"
                  >
                    {t.clinic.enquireBtn}
                  </a>
                  <a
                    href={CLINIC_CONFIG.justdialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-[#DCE5E0] hover:border-[#123D35] text-[#1D5B4A] font-semibold text-xs sm:text-sm transition-colors text-center"
                  >
                    <span>{t.clinic.justdialBtn}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
