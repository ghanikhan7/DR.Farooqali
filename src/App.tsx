import React, { useState, useEffect, useCallback } from 'react';
import {
  Language,
  getDisplayClinicName,
  getDisplayDoctorName,
} from './config/clinicConfig';
import {
  subscribeToGeneralClinicSettings,
  GeneralClinicSettingsData,
} from './lib/clinicSettings';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DoctorSection } from './components/DoctorSection';
import { ClinicSection } from './components/ClinicSection';
import { ServicesSection } from './components/ServicesSection';
import { PatientCareSection } from './components/PatientCareSection';
import { LocationSection } from './components/LocationSection';
import { EnquirySection } from './components/EnquirySection';
import { Footer } from './components/Footer';
import { AdminDashboard, AdminSubRoute } from './components/AdminDashboard';

function parseAdminRouteFromWindow(): {
  isAdmin: boolean;
  subRoute: AdminSubRoute;
} {
  if (typeof window === 'undefined') {
    return { isAdmin: false, subRoute: 'appointments' };
  }

  const pathname = window.location.pathname.replace(/\/+$/, '');
  const hash = window.location.hash;

  if (pathname.startsWith('/admin')) {
    const sub = pathname.slice('/admin'.length).replace(/^\/+/, '');
    if (sub === 'login') return { isAdmin: true, subRoute: 'login' };
    if (sub === 'forgot-password')
      return { isAdmin: true, subRoute: 'forgot-password' };
    if (sub === 'settings') return { isAdmin: true, subRoute: 'settings' };
    if (sub === 'profile') return { isAdmin: true, subRoute: 'profile' };
    return { isAdmin: true, subRoute: 'appointments' };
  }

  if (hash.startsWith('#admin')) {
    const sub = hash.slice('#admin'.length).replace(/^\/+/, '');
    if (sub === 'login') return { isAdmin: true, subRoute: 'login' };
    if (sub === 'forgot-password')
      return { isAdmin: true, subRoute: 'forgot-password' };
    if (sub === 'settings') return { isAdmin: true, subRoute: 'settings' };
    if (sub === 'profile') return { isAdmin: true, subRoute: 'profile' };
    return { isAdmin: true, subRoute: 'appointments' };
  }

  return { isAdmin: false, subRoute: 'appointments' };
}

export function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('sudha_clinic_lang');
      return saved === 'ur' ? 'ur' : 'en';
    } catch {
      return 'en';
    }
  });

  const [routeState, setRouteState] = useState(parseAdminRouteFromWindow);

  // Subscribe to saved clinic and doctor settings from Firestore (clinic_settings/general)
  const [generalSettings, setGeneralSettings] = useState<GeneralClinicSettingsData>({
    clinic_name: '',
    doctor_name: '',
  });

  useEffect(() => {
    const unsub = subscribeToGeneralClinicSettings((settings) => {
      setGeneralSettings(settings);
    });
    return () => unsub();
  }, []);

  const displayClinicName = getDisplayClinicName(generalSettings.clinic_name, lang);
  const displayDoctorName = getDisplayDoctorName(generalSettings.doctor_name, lang);

  useEffect(() => {
    const handleLocationChange = () => {
      setRouteState(parseAdminRouteFromWindow());
    };
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    const htmlEl = document.documentElement;
    if (routeState.isAdmin) {
      htmlEl.lang = 'en';
      htmlEl.dir = 'ltr';
      document.title = `Admin Portal — ${displayClinicName} | ${displayDoctorName}`;
      return;
    }

    htmlEl.lang = lang;
    htmlEl.dir = lang === 'ur' ? 'rtl' : 'ltr';
    document.title =
      lang === 'ur'
        ? `${displayDoctorName} — ${displayClinicName} | تالاب کٹہ، حیدرآباد`
        : `${displayDoctorName} — ${displayClinicName} | Talab Katta, Hyderabad`;
    try {
      localStorage.setItem('sudha_clinic_lang', lang);
    } catch {
      // ignore storage errors
    }
  }, [lang, routeState.isAdmin, displayClinicName, displayDoctorName]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const handleNavigateAdminSubRoute = useCallback((subRoute: AdminSubRoute) => {
    const targetPath =
      subRoute === 'appointments' ? '/admin' : `/admin/${subRoute}`;
    if (window.location.pathname !== targetPath || window.location.hash) {
      window.history.pushState({}, '', targetPath);
    }
    setRouteState({ isAdmin: true, subRoute });
  }, []);

  const handleExitAdmin = useCallback(() => {
    window.history.pushState({}, '', '/');
    setRouteState({ isAdmin: false, subRoute: 'appointments' });
  }, []);

  if (routeState.isAdmin) {
    return (
      <AdminDashboard
        subRoute={routeState.subRoute}
        onNavigateSubRoute={handleNavigateAdminSubRoute}
        onExitAdmin={handleExitAdmin}
      />
    );
  }

  return (
    <div
      dir={lang === 'ur' ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col bg-[#F8F7F2] text-[#182522]"
    >
      <Navbar
        lang={lang}
        onToggleLang={toggleLanguage}
        clinicName={displayClinicName}
        doctorName={displayDoctorName}
      />
      <main className="flex-1">
        <HeroSection
          lang={lang}
          clinicName={displayClinicName}
          doctorName={displayDoctorName}
        />
        <DoctorSection
          lang={lang}
          clinicName={displayClinicName}
          doctorName={displayDoctorName}
        />
        <ClinicSection
          lang={lang}
          clinicName={displayClinicName}
          doctorName={displayDoctorName}
        />
        <ServicesSection lang={lang} />
        <PatientCareSection lang={lang} />
        <LocationSection
          lang={lang}
          clinicName={displayClinicName}
          doctorName={displayDoctorName}
        />
        <EnquirySection lang={lang} />
      </main>
      <Footer
        lang={lang}
        onToggleLang={toggleLanguage}
        clinicName={displayClinicName}
        doctorName={displayDoctorName}
      />
    </div>
  );
}

export default App;
