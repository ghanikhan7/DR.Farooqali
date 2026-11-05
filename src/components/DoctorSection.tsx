import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, MapPin, Building2, Award } from 'lucide-react';
import { CLINIC_CONFIG, TRANSLATIONS, Language } from '../config/clinicConfig';

interface DoctorSectionProps {
  lang: Language;
  clinicName?: string;
  doctorName?: string;
}

export const DoctorSection: React.FC<DoctorSectionProps> = ({
  lang,
  clinicName,
  doctorName,
}) => {
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ur';

  const currentClinicName = clinicName || CLINIC_CONFIG.clinicName[lang];
  const currentDoctorName = doctorName || CLINIC_CONFIG.doctorName[lang];

  const optionalFacts = [
    {
      label: t.doctor.labelQualifications,
      value: CLINIC_CONFIG.qualifications[lang] || CLINIC_CONFIG.qualifications.en,
    },
    {
      label: t.doctor.labelExperience,
      value: CLINIC_CONFIG.experience[lang] || CLINIC_CONFIG.experience.en,
    },
    {
      label: t.doctor.labelRegistration,
      value: CLINIC_CONFIG.registration[lang] || CLINIC_CONFIG.registration.en,
    },
  ].filter((item) => Boolean(item.value && item.value.trim()));

  return (
    <section id="doctor" className="py-20 sm:py-28 bg-white border-b border-[#DCE5E0]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Framed Doctor Portrait Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="relative mx-auto max-w-md">
              {/* Warm Ivory Offset Backdrop */}
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-3xl bg-[#F8F7F2] border border-[#DCE5E0] -z-10"
              />

              <div className="rounded-2xl overflow-hidden bg-[#F8F7F2] border border-[#DCE5E0] shadow-clinic p-4 sm:p-5">
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[#123D35]">
                  <img
                    src={CLINIC_CONFIG.images.doctor}
                    alt={currentDoctorName}
                    loading="lazy"
                    className="w-full h-full object-cover object-[50%_15%]"
                  />
                </div>

                <div className="pt-4 pb-1 px-1 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#123D35]">
                      {currentDoctorName}
                    </h3>
                    <p className="text-sm text-[#66736D]">
                      {currentClinicName} · {CLINIC_CONFIG.locationShort[lang]}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#E6EFEA] flex items-center justify-center text-[#1D5B4A] shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Editorial Biography Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <p className="eyebrow-text text-xs font-semibold uppercase tracking-[0.16em] text-[#1D5B4A] mb-3">
              {t.doctor.eyebrow}
            </p>

            <h2
              className={`font-serif font-semibold text-[#123D35] mb-3 ${
                isRtl ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-4xl lg:text-[2.65rem]'
              }`}
            >
              {t.doctor.title}
            </h2>

            <p className="text-base sm:text-lg font-medium text-[#1D5B4A] mb-6">
              {t.doctor.subtitle}
            </p>

            <div className="space-y-4 text-[#66736D] text-base sm:text-[17px] leading-relaxed mb-8">
              <p>{t.doctor.paragraph1}</p>
              <p>{t.doctor.paragraph2}</p>
            </div>

            {/* Editorial Quote Box */}
            <blockquote className="p-6 rounded-2xl bg-[#F8F7F2] border-s-4 border-[#1D5B4A] text-[#182522] font-serif italic text-lg sm:text-xl leading-relaxed mb-8">
              {t.doctor.quote}
            </blockquote>

            {/* Verified Practice Summary Grid */}
            <div className="rounded-2xl border border-[#DCE5E0] bg-[#F8F7F2]/60 p-5 sm:p-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1D5B4A] eyebrow-text mb-4">
                {t.doctor.credentialsHeading}
              </h3>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <UserCheck className="w-4 h-4 text-[#1D5B4A] shrink-0 mt-1" />
                  <div>
                    <dt className="text-xs text-[#66736D]">{t.doctor.labelDoctor}</dt>
                    <dd className="font-semibold text-[#182522]">
                      {currentDoctorName}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-[#1D5B4A] shrink-0 mt-1" />
                  <div>
                    <dt className="text-xs text-[#66736D]">{t.doctor.labelClinic}</dt>
                    <dd className="font-semibold text-[#182522]">
                      {currentClinicName}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#1D5B4A] shrink-0 mt-1" />
                  <div>
                    <dt className="text-xs text-[#66736D]">{t.doctor.labelLocation}</dt>
                    <dd className="font-semibold text-[#182522]">
                      {CLINIC_CONFIG.locationShort[lang]}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#1D5B4A] shrink-0 mt-1" />
                  <div>
                    <dt className="text-xs text-[#66736D]">{t.doctor.labelLandmark}</dt>
                    <dd className="font-semibold text-[#182522]">
                      {CLINIC_CONFIG.landmark[lang]}
                    </dd>
                  </div>
                </div>

                {optionalFacts.map((fact) => (
                  <div key={fact.label} className="flex items-start gap-3 sm:col-span-2">
                    <Award className="w-4 h-4 text-[#1D5B4A] shrink-0 mt-1" />
                    <div>
                      <dt className="text-xs text-[#66736D]">{fact.label}</dt>
                      <dd className="font-semibold text-[#182522]">{fact.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
