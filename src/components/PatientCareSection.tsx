import React from 'react';
import { motion } from 'framer-motion';
import { HeartHandshake, MessageCircle, Sparkles, Clock4 } from 'lucide-react';
import { TRANSLATIONS, Language } from '../config/clinicConfig';

interface PatientCareSectionProps {
  lang: Language;
}

export const PatientCareSection: React.FC<PatientCareSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ur';
  const icons = [HeartHandshake, MessageCircle, Sparkles, Clock4];

  return (
    <section
      id="care"
      className="py-20 sm:py-28 bg-[#F8F7F2] border-b border-[#DCE5E0]/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <p className="eyebrow-text text-xs font-semibold uppercase tracking-[0.16em] text-[#1D5B4A] mb-3">
            {t.care.eyebrow}
          </p>
          <h2
            className={`font-serif font-semibold text-[#123D35] mb-4 ${
              isRtl ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-4xl lg:text-[2.65rem]'
            }`}
          >
            {t.care.title}
          </h2>
          <p className="text-base sm:text-lg text-[#66736D] leading-relaxed">
            {t.care.subtitle}
          </p>
        </div>

        {/* Architectural 4-Pillar Editorial Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white rounded-3xl border border-[#DCE5E0] shadow-clinic overflow-hidden divide-y sm:divide-y-0 sm:divide-x rtl:sm:divide-x-reverse divide-[#DCE5E0]">
          {t.care.items.map((item, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <motion.div
                key={item.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="p-7 sm:p-8 flex flex-col justify-between hover:bg-[#F8F7F2]/60 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-serif text-3xl font-bold text-[#A7C4B5]">
                      {item.number}
                    </span>
                    <div className="w-11 h-11 rounded-xl bg-[#E6EFEA] text-[#1D5B4A] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#123D35] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-[15px] text-[#66736D] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

