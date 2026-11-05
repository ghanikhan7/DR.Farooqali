import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, MessageSquareHeart, Compass, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { CLINIC_CONFIG, TRANSLATIONS, Language } from '../config/clinicConfig';

interface ServicesSectionProps {
  lang: Language;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ur';
  const approvedServices = CLINIC_CONFIG.approvedServices;

  const pillarIcons = [Stethoscope, MessageSquareHeart, Compass];

  return (
    <section id="services" className="py-20 sm:py-28 bg-white border-b border-[#DCE5E0]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-14">
          <p className="eyebrow-text text-xs font-semibold uppercase tracking-[0.16em] text-[#1D5B4A] mb-3">
            {t.services.eyebrow}
          </p>
          <h2
            className={`font-serif font-semibold text-[#123D35] mb-4 ${
              isRtl ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-4xl lg:text-[2.65rem]'
            }`}
          >
            {t.services.title}
          </h2>
          <p className="text-base sm:text-lg text-[#66736D] leading-relaxed">
            {t.services.subtitle}
          </p>
        </div>

        {/* Core Consultation Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {t.services.pillars.map((pillar, index) => {
            const Icon = pillarIcons[index % pillarIcons.length];
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="rounded-2xl bg-[#F8F7F2] border border-[#DCE5E0] p-7 sm:p-8 flex flex-col justify-between hover:border-[#A7C4B5] transition-colors"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#123D35] text-[#A7C4B5] flex items-center justify-center mb-6 shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#123D35] mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#66736D] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Doctor-Approved Services List (shown when configured in CLINIC_CONFIG) */}
        {approvedServices.length > 0 && (
          <div className="mb-12">
            <h3 className="font-serif text-2xl font-semibold text-[#123D35] mb-6">
              {t.services.approvedHeading}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedServices.map((svc) => (
                <div
                  key={svc.id}
                  className="rounded-xl bg-white border border-[#DCE5E0] p-5 flex items-start gap-3.5 shadow-clinic-subtle"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#1D5B4A] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[#182522] text-base">
                      {svc.title[lang] || svc.title.en}
                    </h4>
                    {(svc.description[lang] || svc.description.en) && (
                      <p className="text-sm text-[#66736D] mt-1">
                        {svc.description[lang] || svc.description.en}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medical Accuracy & Transparency Banner */}
        <div className="rounded-2xl bg-[#E6EFEA]/70 border border-[#A7C4B5]/70 p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#1D5B4A] text-white flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#123D35] mb-1">
              {t.services.accuracyNoticeTitle}
            </h3>
            <p className="text-sm text-[#182522]/80 leading-relaxed">
              {t.services.accuracyNoticeText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

