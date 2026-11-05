import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  MessageCircle,
  Navigation,
  Send,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Clock,
  CalendarDays,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import {
  CLINIC_CONFIG,
  TRANSLATIONS,
  Language,
  SessionId,
} from '../config/clinicConfig';
import {
  getClinicNow,
  hasSessionEndedInKolkata,
  isDateNotInPast,
  isValidPhoneNumber,
} from '../utils/appointmentTime';
import { submitAppointmentRequest } from '../lib/appointments';
import {
  DEFAULT_CONSULTATION_FEE,
  DEFAULT_CURRENCY,
  formatConsultationFee,
  subscribeToConsultationFee,
} from '../lib/clinicSettings';

interface EnquirySectionProps {
  lang: Language;
}

interface SubmittedReceipt {
  patientName: string;
  phoneNumber: string;
  appointmentDate: string;
  session: SessionId;
}

export const EnquirySection: React.FC<EnquirySectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ur';

  const { dateISO: todayISO } = useMemo(() => getClinicNow(), []);

  const [patientName, setPatientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(todayISO);
  const [preferredSession, setPreferredSession] = useState<SessionId>(() =>
    hasSessionEndedInKolkata(todayISO, 'morning') ? 'evening' : 'morning'
  );
  const [message, setMessage] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [receipt, setReceipt] = useState<SubmittedReceipt | null>(null);

  const [consultationFee, setConsultationFee] = useState<number>(DEFAULT_CONSULTATION_FEE);
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);

  useEffect(() => {
    const unsubscribe = subscribeToConsultationFee((settings) => {
      setConsultationFee(settings.consultation_fee);
      setCurrency(settings.currency);
    });
    return () => unsubscribe();
  }, []);

  const formattedFee = useMemo(
    () => formatConsultationFee(consultationFee, currency),
    [consultationFee, currency]
  );

  const morningEndedForSelectedDate = useMemo(
    () => hasSessionEndedInKolkata(appointmentDate, 'morning'),
    [appointmentDate]
  );

  const eveningEndedForSelectedDate = useMemo(
    () => hasSessionEndedInKolkata(appointmentDate, 'evening'),
    [appointmentDate]
  );

  // If the user selects today and the currently selected session has already ended, switch to an active session
  useEffect(() => {
    if (preferredSession === 'morning' && morningEndedForSelectedDate && !eveningEndedForSelectedDate) {
      setPreferredSession('evening');
    } else if (preferredSession === 'evening' && eveningEndedForSelectedDate && !morningEndedForSelectedDate) {
      setPreferredSession('morning');
    }
  }, [appointmentDate, preferredSession, morningEndedForSelectedDate, eveningEndedForSelectedDate]);

  const hasPhone = Boolean(CLINIC_CONFIG.phone.trim());
  const hasWhatsapp = Boolean(CLINIC_CONFIG.whatsapp.trim());

  const whatsappUrl = hasWhatsapp
    ? `https://wa.me/${CLINIC_CONFIG.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
        t.enquiry.whatsappDefaultMsg
      )}`
    : '';

  const telUrl = hasPhone
    ? `tel:${CLINIC_CONFIG.phone.replace(/[^\d+]/g, '')}`
    : '';

  const handleSessionChange = (newSession: SessionId) => {
    if (hasSessionEndedInKolkata(appointmentDate, newSession)) {
      return;
    }
    setPreferredSession(newSession);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;
    setErrorMsg(null);

    // 1. Validate required patient name
    const trimmedName = patientName.trim();
    if (trimmedName.length < 2) {
      setErrorMsg(t.enquiry.validation.nameRequired);
      return;
    }

    // 2. Validate phone number format
    const trimmedPhone = phoneNumber.trim();
    if (!trimmedPhone || !isValidPhoneNumber(trimmedPhone)) {
      setErrorMsg(t.enquiry.validation.phoneRequired);
      return;
    }

    // 3. Validate that the selected date is present and not in the past (in Asia/Kolkata)
    if (!appointmentDate) {
      setErrorMsg(t.enquiry.validation.dateRequired);
      return;
    }
    if (!isDateNotInPast(appointmentDate)) {
      setErrorMsg(t.enquiry.validation.datePast);
      return;
    }

    // 4. Validate the session against the clinic's operating hours
    if (
      preferredSession !== 'morning' &&
      preferredSession !== 'evening'
    ) {
      setErrorMsg(t.enquiry.validation.sessionRequired);
      return;
    }

    // 5. If today is selected, ensure the chosen session has not already ended in Asia/Kolkata
    if (hasSessionEndedInKolkata(appointmentDate, preferredSession)) {
      setErrorMsg(t.enquiry.validation.sessionEndedToday);
      return;
    }

    // 6. Submit appointment request securely to Firebase Cloud Firestore
    setStatus('submitting');

    const result = await submitAppointmentRequest({
      patient_name: trimmedName,
      phone_number: trimmedPhone,
      appointment_date: appointmentDate,
      preferred_session: preferredSession,
      message: message.trim() || null,
      language: lang,
    });

    if (!result.ok) {
      setStatus('idle');
      if (result.errorMessage) {
        console.error('Appointment submission failed:', result.errorMessage);
      }
      if (result.errorCode === 'FIREBASE_NOT_CONFIGURED') {
        setErrorMsg(t.enquiry.validation.firebaseNotConfigured);
      } else if (result.errorCode === 'DUPLICATE_SUBMISSION') {
        setErrorMsg(t.enquiry.validation.duplicateSubmission);
      } else {
        setErrorMsg(t.enquiry.validation.submissionError);
      }
      return;
    }

    // 7. Store receipt details & display professional success message
    setReceipt({
      patientName: trimmedName,
      phoneNumber: trimmedPhone,
      appointmentDate,
      session: preferredSession,
    });
    setStatus('success');
    setPatientName('');
    setPhoneNumber('');
    setMessage('');
  };

  return (
    <section
      id="enquiry"
      className="py-20 sm:py-28 bg-[#123D35] bg-architectural-grid text-white relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Left Column: Clinic Sessions, Direct Actions & Walk-In Info */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <p className="eyebrow-text text-xs font-semibold uppercase tracking-[0.16em] text-[#A7C4B5] mb-3">
              {t.enquiry.eyebrow}
            </p>
            <h2
              className={`font-serif font-semibold text-white mb-4 ${
                isRtl ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-4xl lg:text-[2.65rem]'
              }`}
            >
              {t.enquiry.title}
            </h2>
            <p className="text-base sm:text-lg text-[#A7C4B5]/90 leading-relaxed mb-8">
              {t.enquiry.subtitle}
            </p>

            {/* Daily Clinic Sessions Card (Morning 10:00–13:00 & Evening 21:00–00:00) */}
            <div className="rounded-2xl bg-[#1D5B4A]/70 border border-[#A7C4B5]/30 p-6 mb-7 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 text-[#A7C4B5] text-xs font-semibold uppercase tracking-wider eyebrow-text mb-4">
                <Clock className="w-4 h-4 shrink-0" />
                <span>{t.enquiry.timingsCardTitle}</span>
              </div>

              <div className="space-y-3.5">
                {/* Morning Session */}
                <div className="rounded-xl bg-[#123D35]/75 border border-[#A7C4B5]/20 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#A7C4B5]/15 text-[#A7C4B5] flex items-center justify-center shrink-0">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {t.enquiry.morningLabel}
                      </p>
                      <p className="text-xs text-[#A7C4B5]">
                        {t.enquiry.morningHours}
                      </p>
                    </div>
                  </div>
                  <span
                    dir="ltr"
                    className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-white/10 text-[#F8F7F2]"
                  >
                    {t.enquiry.morning24h}
                  </span>
                </div>

                {/* Evening Session */}
                <div className="rounded-xl bg-[#123D35]/75 border border-[#A7C4B5]/20 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#A7C4B5]/15 text-[#A7C4B5] flex items-center justify-center shrink-0">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {t.enquiry.eveningLabel}
                      </p>
                      <p className="text-xs text-[#A7C4B5]">
                        {t.enquiry.eveningHours}
                      </p>
                    </div>
                  </div>
                  <span
                    dir="ltr"
                    className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-white/10 text-[#F8F7F2]"
                  >
                    {t.enquiry.evening24h}
                  </span>
                </div>

                {/* Consultation Fee Display inside Clinic Timings Card */}
                <div className="rounded-xl bg-white/10 border border-[#A7C4B5]/35 p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-white">
                      {t.enquiry.consultationFeeLabel}:{' '}
                      <span dir="ltr" className="text-[#A7C4B5] font-extrabold">
                        {formattedFee}
                      </span>
                    </p>
                    <p className="text-xs text-[#F8F7F2]/80 mt-0.5">
                      {t.enquiry.consultationFeeNote}
                    </p>
                  </div>
                  <span
                    dir="ltr"
                    className="text-base font-bold px-3.5 py-1.5 rounded-lg bg-[#F8F7F2] text-[#123D35] shadow-sm shrink-0"
                  >
                    {formattedFee}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-7">
              {hasWhatsapp && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#123D35] hover:bg-[#F8F7F2] font-semibold text-sm transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 text-[#1D5B4A]" />
                  <span>{t.enquiry.whatsappBtn}</span>
                </a>
              )}

              {hasPhone && (
                <a
                  href={telUrl}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#123D35] hover:bg-[#F8F7F2] font-semibold text-sm transition-all shadow-sm"
                >
                  <Phone className="w-4 h-4 text-[#1D5B4A]" />
                  <span>{t.enquiry.callBtn}</span>
                </a>
              )}

              <a
                href={CLINIC_CONFIG.googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1D5B4A] hover:bg-[#1D5B4A]/80 text-white border border-[#A7C4B5]/40 font-semibold text-sm transition-all"
              >
                <Navigation className="w-4 h-4 text-[#A7C4B5]" />
                <span>{t.enquiry.directionsBtn}</span>
              </a>

              <a
                href={CLINIC_CONFIG.justdialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-transparent hover:bg-white/5 text-[#A7C4B5] border border-[#A7C4B5]/35 font-semibold text-sm transition-all"
              >
                <span>{t.enquiry.justdialBtn}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Walk-in Card */}
            <div className="rounded-2xl bg-[#1D5B4A]/55 border border-[#A7C4B5]/25 p-5 backdrop-blur-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#A7C4B5]/20 text-[#A7C4B5] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white mb-1">
                    {t.enquiry.visitInPersonTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#F8F7F2]/85 leading-relaxed">
                    {t.enquiry.visitInPersonText}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Premium Appointment Request Form */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div className="rounded-3xl bg-[#F8F7F2] text-[#182522] p-7 sm:p-10 shadow-clinic-lg border border-[#A7C4B5]/40">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#123D35]">
                  {t.enquiry.formTitle}
                </h3>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#E6EFEA] border border-[#A7C4B5]/60 text-[#123D35] text-sm font-bold shadow-clinic-subtle">
                  <span>{t.enquiry.consultationFeeLabel}:</span>
                  <span dir="ltr" className="text-[#1D5B4A] text-base font-extrabold">
                    {formattedFee}
                  </span>
                </div>
              </div>
              <p className="text-sm sm:text-base text-[#66736D] mb-7">
                {t.enquiry.formSubtitle}
              </p>

              {status === 'success' && receipt ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  role="status"
                  className="rounded-2xl bg-white border border-[#1D5B4A]/35 p-6 sm:p-8 shadow-clinic-subtle space-y-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#123D35] text-[#A7C4B5] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-semibold text-[#123D35] leading-relaxed">
                        {t.enquiry.successMsg}
                      </p>
                    </div>
                  </div>

                  {/* Submitted Request Details Summary */}
                  <div className="rounded-xl bg-[#F8F7F2] border border-[#DCE5E0] p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-[#66736D] block">
                        {t.enquiry.nameLabel}
                      </span>
                      <strong className="text-[#182522]">{receipt.patientName}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-[#66736D] block">
                        {t.enquiry.phoneLabel}
                      </span>
                      <strong dir="ltr" className="text-[#182522] inline-block">
                        {receipt.phoneNumber}
                      </strong>
                    </div>
                    <div>
                      <span className="text-xs text-[#66736D] block">
                        {t.enquiry.dateLabel}
                      </span>
                      <strong dir="ltr" className="text-[#182522] inline-block">
                        {receipt.appointmentDate}
                      </strong>
                    </div>
                    <div>
                      <span className="text-xs text-[#66736D] block">
                        {t.enquiry.sessionLabel}
                      </span>
                      <strong className="text-[#123D35]">
                        {CLINIC_CONFIG.sessions[receipt.session].label[lang]} ·{' '}
                        <span dir="ltr" className="inline-block">
                          {CLINIC_CONFIG.sessions[receipt.session].displayRange.en}
                        </span>
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStatus('idle');
                      setReceipt(null);
                      setErrorMsg(null);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#123D35] hover:bg-[#1D5B4A] text-white font-semibold text-sm transition-colors"
                  >
                    <span>{t.enquiry.bookAnotherBtn}</span>
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  {/* Validation Error Banner */}
                  {errorMsg && (
                    <div
                      role="alert"
                      className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* 1. Patient Full Name & 2. Phone Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="patient-name"
                        className="block text-xs sm:text-sm font-semibold text-[#123D35] mb-2"
                      >
                        {t.enquiry.nameLabel} <span className="text-[#1D5B4A]">*</span>
                      </label>
                      <input
                        id="patient-name"
                        name="patientName"
                        type="text"
                        required
                        autoComplete="name"
                        value={patientName}
                        onChange={(e) => {
                          setPatientName(e.target.value);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        placeholder={t.enquiry.namePlaceholder}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCE5E0] focus:border-[#1D5B4A] focus:outline-none focus:ring-2 focus:ring-[#1D5B4A]/20 text-[#182522] text-sm sm:text-base transition-all"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="patient-phone"
                        className="block text-xs sm:text-sm font-semibold text-[#123D35] mb-2"
                      >
                        {t.enquiry.phoneLabel} <span className="text-[#1D5B4A]">*</span>
                      </label>
                      <input
                        id="patient-phone"
                        name="phoneNumber"
                        type="tel"
                        required
                        dir="ltr"
                        autoComplete="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        placeholder={t.enquiry.phonePlaceholder}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCE5E0] focus:border-[#1D5B4A] focus:outline-none focus:ring-2 focus:ring-[#1D5B4A]/20 text-[#182522] text-sm sm:text-base transition-all text-start"
                      />
                    </div>
                  </div>

                  {/* 3. Appointment Date & 4. Preferred Session */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="appointment-date"
                        className="block text-xs sm:text-sm font-semibold text-[#123D35] mb-2"
                      >
                        {t.enquiry.dateLabel} <span className="text-[#1D5B4A]">*</span>
                      </label>
                      <input
                        id="appointment-date"
                        name="appointmentDate"
                        type="date"
                        required
                        min={todayISO}
                        value={appointmentDate}
                        onChange={(e) => {
                          setAppointmentDate(e.target.value);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCE5E0] focus:border-[#1D5B4A] focus:outline-none focus:ring-2 focus:ring-[#1D5B4A]/20 text-[#182522] text-sm sm:text-base transition-all"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="preferred-session"
                        className="block text-xs sm:text-sm font-semibold text-[#123D35] mb-2"
                      >
                        {t.enquiry.sessionLabel} <span className="text-[#1D5B4A]">*</span>
                      </label>
                      <select
                        id="preferred-session"
                        name="preferredSession"
                        required
                        value={preferredSession}
                        onChange={(e) => handleSessionChange(e.target.value as SessionId)}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCE5E0] focus:border-[#1D5B4A] focus:outline-none focus:ring-2 focus:ring-[#1D5B4A]/20 text-[#182522] text-sm sm:text-base transition-all"
                      >
                        <option value="morning" disabled={morningEndedForSelectedDate}>
                          {t.enquiry.sessionMorningOption}
                          {morningEndedForSelectedDate ? ` — ${t.enquiry.sessionEndedBadge}` : ''}
                        </option>
                        <option value="evening" disabled={eveningEndedForSelectedDate}>
                          {t.enquiry.sessionEveningOption}
                          {eveningEndedForSelectedDate ? ` — ${t.enquiry.sessionEndedBadge}` : ''}
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Interactive Session Cards (Morning 10:00 AM – 1:00 PM / Evening 9:00 PM – 12:00 AM) */}
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        disabled={morningEndedForSelectedDate}
                        onClick={() => handleSessionChange('morning')}
                        className={`flex items-center justify-between gap-3 py-3.5 px-4 rounded-xl border text-start transition-all ${
                          morningEndedForSelectedDate
                            ? 'bg-[#F1EFE7] text-[#66736D]/50 border-[#DCE5E0] cursor-not-allowed'
                            : preferredSession === 'morning'
                            ? 'bg-[#123D35] text-white border-[#123D35] shadow-sm ring-2 ring-[#1D5B4A]/25'
                            : 'bg-white text-[#182522] border-[#DCE5E0] hover:border-[#1D5B4A]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Sun className="w-4 h-4 shrink-0 text-[#A7C4B5]" />
                          <div>
                            <span className="block text-xs sm:text-sm font-semibold">
                              {t.enquiry.morningLabel}
                            </span>
                            <span
                              dir="ltr"
                              className={`block text-xs ${
                                preferredSession === 'morning' && !morningEndedForSelectedDate
                                  ? 'text-[#A7C4B5]'
                                  : 'text-[#66736D]'
                              }`}
                            >
                              10:00 AM – 1:00 PM
                            </span>
                          </div>
                        </div>
                        {morningEndedForSelectedDate && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#DCE5E0]/70 text-[#66736D]">
                            {t.enquiry.sessionEndedBadge}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={eveningEndedForSelectedDate}
                        onClick={() => handleSessionChange('evening')}
                        className={`flex items-center justify-between gap-3 py-3.5 px-4 rounded-xl border text-start transition-all ${
                          eveningEndedForSelectedDate
                            ? 'bg-[#F1EFE7] text-[#66736D]/50 border-[#DCE5E0] cursor-not-allowed'
                            : preferredSession === 'evening'
                            ? 'bg-[#123D35] text-white border-[#123D35] shadow-sm ring-2 ring-[#1D5B4A]/25'
                            : 'bg-white text-[#182522] border-[#DCE5E0] hover:border-[#1D5B4A]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Moon className="w-4 h-4 shrink-0 text-[#A7C4B5]" />
                          <div>
                            <span className="block text-xs sm:text-sm font-semibold">
                              {t.enquiry.eveningLabel}
                            </span>
                            <span
                              dir="ltr"
                              className={`block text-xs ${
                                preferredSession === 'evening' && !eveningEndedForSelectedDate
                                  ? 'text-[#A7C4B5]'
                                  : 'text-[#66736D]'
                              }`}
                            >
                              9:00 PM – 12:00 AM
                            </span>
                          </div>
                        </div>
                        {eveningEndedForSelectedDate && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#DCE5E0]/70 text-[#66736D]">
                            {t.enquiry.sessionEndedBadge}
                          </span>
                        )}
                      </button>
                    </div>

                    <p className="mt-2.5 flex items-start gap-2 text-xs text-[#66736D]">
                      <Info className="w-4 h-4 text-[#1D5B4A] shrink-0 mt-0.5" />
                      <span>{t.enquiry.sessionVisitNote}</span>
                    </p>
                  </div>

                  {/* 5. Optional Short Message */}
                  <div>
                    <label
                      htmlFor="enquiry-message"
                      className="block text-xs sm:text-sm font-semibold text-[#123D35] mb-2"
                    >
                      {t.enquiry.messageLabel}
                    </label>
                    <textarea
                      id="enquiry-message"
                      name="message"
                      rows={3}
                      maxLength={500}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t.enquiry.messagePlaceholder}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCE5E0] focus:border-[#1D5B4A] focus:outline-none focus:ring-2 focus:ring-[#1D5B4A]/20 text-[#182522] text-sm sm:text-base transition-all resize-y"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-xl bg-[#123D35] hover:bg-[#1D5B4A] disabled:opacity-60 text-white font-semibold text-base transition-all shadow-sm"
                  >
                    <Send className="w-4 h-4 text-[#A7C4B5] shrink-0" />
                    <span>
                      {status === 'submitting'
                        ? t.enquiry.submittingBtn
                        : t.enquiry.submitBtn}
                    </span>
                  </button>

                  <div className="pt-1 flex items-start gap-2.5 text-xs text-[#66736D]">
                    <ShieldCheck className="w-4 h-4 text-[#1D5B4A] shrink-0 mt-0.5" />
                    <p>{t.enquiry.privacyNote}</p>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
