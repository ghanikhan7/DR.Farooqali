import React, { useState, useEffect, useMemo } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  setPersistence,
  browserLocalPersistence,
  User,
} from 'firebase/auth';
import {
  ShieldCheck,
  LogOut,
  ArrowLeft,
  Save,
  RotateCcw,
  IndianRupee,
  Calendar,
  Clock,
  Sun,
  Moon,
  Phone,
  CheckCircle2,
  AlertCircle,
  Lock,
  Search,
  RefreshCw,
  MessageCircle,
  Eye,
  EyeOff,
  UserCheck,
  Settings,
  CalendarCheck,
  KeyRound,
  X,
  Building2,
  Filter,
} from 'lucide-react';
import { auth, authorizedAdminUid, isFirebaseConfigured } from '../lib/firebase';
import {
  DEFAULT_CONSULTATION_FEE,
  DEFAULT_CURRENCY,
  formatConsultationFee,
  saveConsultationFee,
  subscribeToConsultationFee,
  subscribeToGeneralClinicSettings,
  saveGeneralClinicSettings,
} from '../lib/clinicSettings';
import {
  AppointmentRecord,
  AppointmentStatus,
  fetchAppointmentsOnce,
  subscribeToAppointments,
  updateAppointmentStatus,
} from '../lib/appointments';
import { CLINIC_CONFIG, SessionId } from '../config/clinicConfig';
import { getClinicNow } from '../utils/appointmentTime';

export type AdminSubRoute =
  | 'login'
  | 'forgot-password'
  | 'appointments'
  | 'settings'
  | 'profile';

interface AdminDashboardProps {
  subRoute: AdminSubRoute;
  onNavigateSubRoute: (route: AdminSubRoute) => void;
  onExitAdmin: () => void;
}

function formatWhatsAppPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  return digits;
}

function mapFirebaseAuthError(err: unknown, fallbackMsg: string): string {
  if (!(err instanceof Error)) return fallbackMsg;
  const code = (err as { code?: string }).code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or current password. Please verify your credentials and try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 8 characters.';
    case 'auth/email-already-in-use':
      return 'This email address is already registered to another account.';
    case 'auth/requires-recent-login':
      return 'For security, please re-enter your current password or sign in again before making this change.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes before trying again.';
    case 'auth/operation-not-allowed':
      return 'This operation is not enabled in the Firebase Console Authentication settings.';
    default:
      return err.message || fallbackMsg;
  }
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  subRoute,
  onNavigateSubRoute,
  onExitAdmin,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Consultation fee state
  const [currentFee, setCurrentFee] = useState<number>(DEFAULT_CONSULTATION_FEE);
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [lastUpdatedText, setLastUpdatedText] = useState<string | null>(null);
  const [feeInput, setFeeInput] = useState<string>(String(DEFAULT_CONSULTATION_FEE));
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [savingFee, setSavingFee] = useState(false);
  const [feeFeedback, setFeeFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // General clinic settings state (Clinic Name & Doctor Name)
  const [savedClinicName, setSavedClinicName] = useState<string>(
    CLINIC_CONFIG.clinicName.en
  );
  const [savedDoctorName, setSavedDoctorName] = useState<string>(
    CLINIC_CONFIG.doctorName.en
  );
  const [clinicNameInput, setClinicNameInput] = useState<string>(
    CLINIC_CONFIG.clinicName.en
  );
  const [doctorNameInput, setDoctorNameInput] = useState<string>(
    CLINIC_CONFIG.doctorName.en
  );
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [generalFeedback, setGeneralFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Appointments state & filters
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');
  const [sessionFilter, setSessionFilter] = useState<'all' | SessionId>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentRecord | null>(null);

  // Change Password state (Admin Profile)
  const [currentPasswordForPwd, setCurrentPasswordForPwd] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const { dateISO: todayISO } = useMemo(() => getClinicNow(), []);

  // Monitor Firebase Auth state
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Redirect logic for protected admin routes
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      if (subRoute !== 'login' && subRoute !== 'forgot-password') {
        onNavigateSubRoute('login');
      }
    } else {
      if (subRoute === 'login' || subRoute === 'forgot-password') {
        onNavigateSubRoute('appointments');
      }
    }
  }, [user, authLoading, subRoute, onNavigateSubRoute]);

  const isStrictAdminConfigured = Boolean(
    authorizedAdminUid &&
      !authorizedAdminUid.includes('your-authorized-admin-firebase-uid')
  );

  const isAuthorizedUser = useMemo(() => {
    if (!user) return false;
    if (isStrictAdminConfigured) {
      return user.uid === authorizedAdminUid;
    }
    return true;
  }, [user, isStrictAdminConfigured]);

  // Subscribe to live consultation fee
  useEffect(() => {
    const unsub = subscribeToConsultationFee((settings) => {
      setCurrentFee(settings.consultation_fee);
      setCurrency(settings.currency);
      if (!isEditingFee) {
        setFeeInput(String(settings.consultation_fee));
      }
      if (settings.updated_at) {
        try {
          setLastUpdatedText(
            settings.updated_at.toDate().toLocaleString('en-IN', {
              timeZone: CLINIC_CONFIG.timezone,
              dateStyle: 'medium',
              timeStyle: 'short',
            })
          );
        } catch {
          setLastUpdatedText(null);
        }
      }
    });
    return () => unsub();
  }, [isEditingFee]);

  // Subscribe to general clinic settings when admin is signed in
  useEffect(() => {
    if (!user || !isAuthorizedUser) return;
    const unsub = subscribeToGeneralClinicSettings((settings) => {
      setSavedClinicName(settings.clinic_name);
      setSavedDoctorName(settings.doctor_name);
      if (!isEditingGeneral) {
        setClinicNameInput(settings.clinic_name);
        setDoctorNameInput(settings.doctor_name);
      }
    });
    return () => unsub();
  }, [user, isAuthorizedUser, isEditingGeneral]);

  // Subscribe to appointments when authorized admin is signed in
  useEffect(() => {
    if (!user || !isAuthorizedUser) {
      setAppointments([]);
      return;
    }
    setAppointmentsError(null);
    const unsub = subscribeToAppointments(
      (records) => {
        setAppointments(records);
        setAppointmentsError(null);
      },
      (errMsg) => {
        setAppointmentsError(errMsg);
      }
    );
    return () => unsub();
  }, [user, isAuthorizedUser]);

  // Keep selectedAppointment in sync with live updates
  useEffect(() => {
    if (!selectedAppointment) return;
    const updated = appointments.find((a) => a.id === selectedAppointment.id);
    if (updated) {
      setSelectedAppointment(updated);
    }
  }, [appointments, selectedAppointment]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return appointments.filter((apt) => {
      if (statusFilter !== 'all' && apt.status !== statusFilter) return false;
      if (sessionFilter !== 'all' && apt.preferred_session !== sessionFilter)
        return false;
      if (dateFilter && apt.appointment_date !== dateFilter) return false;
      if (q) {
        const matchesName = apt.patient_name.toLowerCase().includes(q);
        const matchesPhone = apt.phone_number.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone) return false;
      }
      return true;
    });
  }, [appointments, searchQuery, statusFilter, sessionFilter, dateFilter]);

  // Status counts
  const statusCounts = useMemo(() => {
    return appointments.reduce(
      (acc, apt) => {
        acc.total += 1;
        acc[apt.status] += 1;
        return acc;
      },
      { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
    );
  }, [appointments]);

  // Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setLoginError('Firebase Authentication is not configured.');
      return;
    }
    setLoginError(null);
    setSigningIn(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      setLoginPassword('');
      onNavigateSubRoute('appointments');
    } catch (err) {
      setLoginError(
        mapFirebaseAuthError(
          err,
          'Invalid admin email or password. Please try again.'
        )
      );
    } finally {
      setSigningIn(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setResetFeedback({
        type: 'error',
        message: 'Firebase Authentication is not configured.',
      });
      return;
    }
    const cleanEmail = resetEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setResetFeedback({
        type: 'error',
        message: 'Please enter a valid administrator email address.',
      });
      return;
    }

    setResetLoading(true);
    setResetFeedback(null);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setResetFeedback({
        type: 'success',
        message:
          'Password reset link sent! Please check your email inbox (and spam folder) to set a new password.',
      });
    } catch (err) {
      setResetFeedback({
        type: 'error',
        message: mapFirebaseAuthError(
          err,
          'Could not send password reset email. Please verify the address.'
        ),
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    setFeeFeedback(null);
    setGeneralFeedback(null);
    setPasswordFeedback(null);
    onNavigateSubRoute('login');
  };

  const handleManualRefresh = async () => {
    if (!user || !isAuthorizedUser || refreshing) return;
    setRefreshing(true);
    const res = await fetchAppointmentsOnce();
    if (res.ok) {
      setAppointments(res.records);
      setAppointmentsError(null);
    } else if (res.error) {
      setAppointmentsError(res.error);
    }
    setTimeout(() => setRefreshing(false), 450);
  };

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    if (!user || !isAuthorizedUser) return;
    setUpdatingId(id);
    await updateAppointmentStatus(id, newStatus);
    setUpdatingId(null);
  };

  const handleSaveFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeeFeedback(null);

    if (!user || !isAuthorizedUser) {
      setFeeFeedback({
        type: 'error',
        message:
          'Only the authorized clinic administrator can update the consultation fee.',
      });
      return;
    }

    const trimmed = feeInput.trim();
    if (trimmed === '') {
      setFeeFeedback({
        type: 'error',
        message: 'Please enter a consultation fee amount.',
      });
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setFeeFeedback({
        type: 'error',
        message: 'Please enter a valid non-negative INR amount (0 or greater).',
      });
      return;
    }

    setSavingFee(true);
    const res = await saveConsultationFee(parsed, user.uid);
    setSavingFee(false);

    if (res.ok) {
      const normalized = Math.round(parsed * 100) / 100;
      setFeeInput(String(normalized));
      setIsEditingFee(false);
      setFeeFeedback({
        type: 'success',
        message: `Consultation fee updated to ${formatConsultationFee(normalized, currency)} successfully.`,
      });
    } else {
      setFeeFeedback({
        type: 'error',
        message:
          res.error ||
          'Failed to update consultation fee. Please publish firestore.rules in Firebase Console.',
      });
    }
  };

  const handleResetFeeEdit = () => {
    setFeeInput(String(currentFee));
    setIsEditingFee(false);
    setFeeFeedback(null);
  };

  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralFeedback(null);

    if (!user || !isAuthorizedUser) {
      setGeneralFeedback({
        type: 'error',
        message: 'Only the authorized administrator can update clinic settings.',
      });
      return;
    }

    setSavingGeneral(true);
    const res = await saveGeneralClinicSettings(
      clinicNameInput,
      doctorNameInput,
      user.uid
    );
    setSavingGeneral(false);

    if (res.ok) {
      setIsEditingGeneral(false);
      setGeneralFeedback({
        type: 'success',
        message: 'Clinic and Doctor names saved to Firestore successfully.',
      });
    } else {
      setGeneralFeedback({
        type: 'error',
        message:
          res.error ||
          'Could not save clinic settings. Please publish firestore.rules in Firebase Console.',
      });
    }
  };

  const handleResetGeneralEdit = () => {
    setClinicNameInput(savedClinicName);
    setDoctorNameInput(savedDoctorName);
    setIsEditingGeneral(false);
    setGeneralFeedback(null);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!user || !user.email) {
      setPasswordFeedback({
        type: 'error',
        message: 'You must be signed in to change your password.',
      });
      return;
    }

    if (!currentPasswordForPwd) {
      setPasswordFeedback({
        type: 'error',
        message: 'Please enter your current password to verify your identity.',
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordFeedback({
        type: 'error',
        message: 'New password must be at least 8 characters long.',
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordFeedback({
        type: 'error',
        message: 'New password and password confirmation do not match.',
      });
      return;
    }

    if (newPassword === currentPasswordForPwd) {
      setPasswordFeedback({
        type: 'error',
        message: 'New password must be different from your current password.',
      });
      return;
    }

    setChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPasswordForPwd
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setCurrentPasswordForPwd('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordFeedback({
        type: 'success',
        message: 'Your administrator password has been updated successfully.',
      });
    } catch (err) {
      setPasswordFeedback({
        type: 'error',
        message: mapFirebaseAuthError(
          err,
          'Failed to change password. Please verify your current password.'
        ),
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const buildWhatsAppLinkForAppointment = (apt: AppointmentRecord): string => {
    const phoneDigits = formatWhatsAppPhone(apt.phone_number);
    const sessionLabel = CLINIC_CONFIG.sessions[apt.preferred_session].label.en;
    const sessionRange =
      CLINIC_CONFIG.sessions[apt.preferred_session].displayRange.en;
    const msg = `Assalamu Alaikum / Hello ${apt.patient_name}, this is Sudha Clinic (Dr. Syed Farooq Ali, Talab Katta). Your appointment request for ${apt.appointment_date} during the ${sessionLabel} (${sessionRange}) is confirmed.`;
    return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div
      dir="ltr"
      className="min-h-screen bg-[#F8F7F2] text-[#182522] flex flex-col font-sans"
    >
      {/* Top Admin Header */}
      <header className="bg-[#123D35] text-white border-b border-[#1D5B4A] py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#1D5B4A] border border-[#A7C4B5]/35 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#A7C4B5]" />
            </div>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-white leading-none">
                {savedClinicName} · Admin Portal
              </h1>
              <p className="text-xs text-[#A7C4B5] mt-1">{savedDoctorName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onExitAdmin}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-[#A7C4B5]/30 text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#A7C4B5]" />
              <span>Public Website</span>
            </button>

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#123D35] hover:bg-[#F8F7F2] text-xs sm:text-sm font-semibold transition-colors shadow-sm"
              >
                <LogOut className="w-4 h-4 text-[#1D5B4A]" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isFirebaseConfigured ? (
          <div className="max-w-xl mx-auto rounded-2xl bg-white border border-[#DCE5E0] p-8 shadow-clinic">
            <h2 className="font-serif text-2xl font-bold text-[#123D35] mb-2">
              Firebase Not Configured
            </h2>
            <p className="text-sm text-[#66736D]">
              Please add your <code>VITE_FIREBASE_*</code> configuration keys in{' '}
              <code>.env</code>.
            </p>
          </div>
        ) : authLoading ? (
          <div className="max-w-md mx-auto text-center py-20 text-[#66736D] text-sm font-medium">
            Verifying administrator session...
          </div>
        ) : !user ? (
          /* Unauthenticated Views: /admin/login or /admin/forgot-password */
          subRoute === 'forgot-password' ? (
            <div className="max-w-md mx-auto rounded-3xl bg-white border border-[#DCE5E0] p-7 sm:p-9 shadow-clinic my-6">
              <div className="w-12 h-12 rounded-2xl bg-[#E6EFEA] text-[#1D5B4A] flex items-center justify-center mb-5">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#123D35] mb-2">
                Reset Admin Password
              </h2>
              <p className="text-sm text-[#66736D] mb-6">
                Enter your administrator email address and we will send a secure Firebase password reset link.
              </p>

              {resetFeedback && (
                <div
                  role="alert"
                  className={`mb-5 p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${
                    resetFeedback.type === 'success'
                      ? 'bg-[#E6EFEA] border-[#1D5B4A]/35 text-[#123D35]'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  {resetFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#1D5B4A] shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  )}
                  <span>{resetFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-xs sm:text-sm font-semibold text-[#123D35] mb-1.5"
                  >
                    Administrator Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="admin@sudhaclinic.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#F8F7F2] border border-[#DCE5E0] focus:border-[#1D5B4A] focus:bg-white focus:outline-none text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#123D35] hover:bg-[#1D5B4A] disabled:opacity-60 text-white font-semibold text-sm transition-colors shadow-sm"
                >
                  {resetLoading ? 'Sending Reset Email...' : 'Send Password Reset Email'}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[#DCE5E0] text-center">
                <button
                  type="button"
                  onClick={() => {
                    setResetFeedback(null);
                    onNavigateSubRoute('login');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1D5B4A] hover:text-[#123D35]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Administrator Login</span>
                </button>
              </div>
            </div>
          ) : (
            /* /admin/login */
            <div className="max-w-md mx-auto rounded-3xl bg-white border border-[#DCE5E0] p-7 sm:p-9 shadow-clinic my-6">
              <div className="w-12 h-12 rounded-2xl bg-[#E6EFEA] text-[#1D5B4A] flex items-center justify-center mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#123D35] mb-2">
                Administrator Sign In
              </h2>
              <p className="text-sm text-[#66736D] mb-6">
                Sign in with your authorized Sudha Clinic administrator credentials.
              </p>

              {loginError && (
                <div
                  role="alert"
                  className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label
                    htmlFor="admin-email"
                    className="block text-xs sm:text-sm font-semibold text-[#123D35] mb-1.5"
                  >
                    Admin Email
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter administrator email"
                    className="w-full px-4 py-3 rounded-xl bg-[#F8F7F2] border border-[#DCE5E0] focus:border-[#1D5B4A] focus:bg-white focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="admin-password"
                      className="block text-xs sm:text-sm font-semibold text-[#123D35]"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(loginEmail);
                        setLoginError(null);
                        onNavigateSubRoute('forgot-password');
                      }}
                      className="text-xs font-semibold text-[#1D5B4A] hover:text-[#123D35] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="admin-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#F8F7F2] border border-[#DCE5E0] focus:border-[#1D5B4A] focus:bg-white focus:outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((v) => !v)}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#66736D] hover:text-[#123D35]"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={signingIn}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#123D35] hover:bg-[#1D5B4A] disabled:opacity-60 text-white font-semibold text-sm transition-colors shadow-sm"
                >
                  {signingIn ? 'Signing in...' : 'Sign In to Dashboard'}
                </button>
              </form>
            </div>
          )
        ) : !isAuthorizedUser ? (
          /* Signed in with a non-admin account */
          <div className="max-w-xl mx-auto rounded-3xl bg-white border border-red-200 p-8 shadow-clinic space-y-4 my-6">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#123D35]">
              Unauthorized Account
            </h2>
            <p className="text-sm text-[#66736D] leading-relaxed">
              You are signed in as <strong>{user.email}</strong>, which does not match
              the authorized clinic administrator account configured for Sudha Clinic.
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#123D35] text-white text-sm font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          /* Authorized Admin Layout with Sidebar + Main View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-3 rounded-3xl bg-white border border-[#DCE5E0] p-5 shadow-clinic space-y-6 lg:sticky lg:top-24">
              <div className="pb-4 border-b border-[#DCE5E0]">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#1D5B4A] block mb-1">
                  Signed In Administrator
                </span>
                <p className="text-sm font-bold text-[#123D35] truncate">
                  {user.email}
                </p>
              </div>

              <nav aria-label="Admin Navigation" className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => onNavigateSubRoute('appointments')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    subRoute === 'appointments'
                      ? 'bg-[#123D35] text-white shadow-sm'
                      : 'text-[#182522] hover:bg-[#F8F7F2]'
                  }`}
                >
                  <span className="inline-flex items-center gap-2.5">
                    <CalendarCheck className="w-4 h-4 text-[#A7C4B5]" />
                    <span>Appointments</span>
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      subRoute === 'appointments'
                        ? 'bg-white/15 text-white'
                        : 'bg-[#E6EFEA] text-[#123D35]'
                    }`}
                  >
                    {statusCounts.pending}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateSubRoute('settings')}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    subRoute === 'settings'
                      ? 'bg-[#123D35] text-white shadow-sm'
                      : 'text-[#182522] hover:bg-[#F8F7F2]'
                  }`}
                >
                  <Settings className="w-4 h-4 text-[#A7C4B5]" />
                  <span>Clinic Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateSubRoute('profile')}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    subRoute === 'profile'
                      ? 'bg-[#123D35] text-white shadow-sm'
                      : 'text-[#182522] hover:bg-[#F8F7F2]'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-[#A7C4B5]" />
                  <span>Admin Profile</span>
                </button>
              </nav>

              <div className="pt-4 border-t border-[#DCE5E0]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#DCE5E0] hover:border-red-300 hover:bg-red-50/50 text-xs sm:text-sm font-semibold text-[#182522] hover:text-red-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Admin</span>
                </button>
              </div>
            </aside>

            {/* Active Admin Page Content */}
            <div className="lg:col-span-9 space-y-8">
              {/* ============================================================
                  TAB 1: APPOINTMENTS MANAGEMENT (/admin or /admin/appointments)
                 ============================================================ */}
              {subRoute === 'appointments' && (
                <div className="space-y-6">
                  {/* Status Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {(
                      [
                        { id: 'all', label: 'All Requests', count: statusCounts.total },
                        { id: 'pending', label: 'Pending', count: statusCounts.pending },
                        { id: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed },
                        { id: 'completed', label: 'Completed', count: statusCounts.completed },
                        { id: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
                      ] as const
                    ).map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setStatusFilter(card.id)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          statusFilter === card.id
                            ? 'bg-[#123D35] text-white border-[#123D35] shadow-sm'
                            : 'bg-white text-[#182522] border-[#DCE5E0] hover:border-[#1D5B4A]'
                        }`}
                      >
                        <span
                          className={`text-xs font-semibold block ${
                            statusFilter === card.id ? 'text-[#A7C4B5]' : 'text-[#66736D]'
                          }`}
                        >
                          {card.label}
                        </span>
                        <span className="font-serif text-2xl sm:text-3xl font-bold mt-1 block">
                          {card.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Appointments Card */}
                  <section className="rounded-3xl bg-white border border-[#DCE5E0] shadow-clinic p-6 sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#123D35]">
                          Appointment Requests
                        </h2>
                        <p className="text-xs sm:text-sm text-[#66736D]">
                          Morning: 10:00 AM – 1:00 PM · Evening: 9:00 PM – 12:00 AM (Asia/Kolkata)
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleManualRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F8F7F2] hover:bg-[#E6EFEA] border border-[#DCE5E0] text-xs sm:text-sm font-semibold text-[#123D35] transition-colors"
                      >
                        <RefreshCw
                          className={`w-4 h-4 text-[#1D5B4A] ${
                            refreshing ? 'animate-spin' : ''
                          }`}
                        />
                        <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                      </button>
                    </div>

                    {/* Search & Filters Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-6 p-4 rounded-2xl bg-[#F8F7F2] border border-[#DCE5E0]">
                      {/* Search by name or phone */}
                      <div className="sm:col-span-5 relative">
                        <Search className="w-4 h-4 text-[#66736D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by patient name or phone..."
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#DCE5E0] focus:border-[#1D5B4A] focus:outline-none text-xs sm:text-sm"
                        />
                      </div>

                      {/* Date Filter */}
                      <div className="sm:col-span-3 flex items-center gap-1.5">
                        <input
                          type="date"
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          aria-label="Filter by appointment date"
                          className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#DCE5E0] focus:border-[#1D5B4A] focus:outline-none text-xs sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDateFilter((prev) => (prev === todayISO ? '' : todayISO))
                          }
                          className={`px-2.5 py-2.5 rounded-xl border text-xs font-semibold shrink-0 ${
                            dateFilter === todayISO
                              ? 'bg-[#123D35] text-white border-[#123D35]'
                              : 'bg-white text-[#123D35] border-[#DCE5E0]'
                          }`}
                        >
                          Today
                        </button>
                      </div>

                      {/* Session Filter */}
                      <div className="sm:col-span-2">
                        <select
                          value={sessionFilter}
                          onChange={(e) =>
                            setSessionFilter(e.target.value as 'all' | SessionId)
                          }
                          aria-label="Filter by session"
                          className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#DCE5E0] focus:border-[#1D5B4A] focus:outline-none text-xs sm:text-sm font-medium"
                        >
                          <option value="all">All Sessions</option>
                          <option value="morning">Morning</option>
                          <option value="evening">Evening</option>
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div className="sm:col-span-2">
                        <select
                          value={statusFilter}
                          onChange={(e) =>
                            setStatusFilter(e.target.value as 'all' | AppointmentStatus)
                          }
                          aria-label="Filter by status"
                          className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#DCE5E0] focus:border-[#1D5B4A] focus:outline-none text-xs sm:text-sm font-medium"
                        >
                          <option value="all">All Statuses</option>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      {(searchQuery ||
                        dateFilter ||
                        sessionFilter !== 'all' ||
                        statusFilter !== 'all') && (
                        <div className="sm:col-span-12 flex items-center justify-between pt-1 text-xs text-[#66736D]">
                          <span className="inline-flex items-center gap-1.5">
                            <Filter className="w-3.5 h-3.5 text-[#1D5B4A]" />
                            Showing {filteredAppointments.length} of {appointments.length}{' '}
                            appointments
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery('');
                              setDateFilter('');
                              setSessionFilter('all');
                              setStatusFilter('all');
                            }}
                            className="font-semibold text-[#1D5B4A] hover:underline"
                          >
                            Reset All Filters
                          </button>
                        </div>
                      )}
                    </div>

                    {appointmentsError && (
                      <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm">
                        <strong>Notice:</strong> {appointmentsError}. Please verify that the updated{' '}
                        <code>firestore.rules</code> are published in your Firebase Console.
                      </div>
                    )}

                    {filteredAppointments.length === 0 ? (
                      <div className="rounded-2xl bg-[#F8F7F2] border border-[#DCE5E0] p-12 text-center text-sm text-[#66736D]">
                        No matching appointment requests found.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredAppointments.map((apt) => {
                          const sessionCfg =
                            CLINIC_CONFIG.sessions[apt.preferred_session];
                          const submittedStr = apt.submitted_at
                            ? apt.submitted_at.toDate().toLocaleString('en-IN', {
                                timeZone: CLINIC_CONFIG.timezone,
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })
                            : 'Pending timestamp';

                          return (
                            <div
                              key={apt.id}
                              className="rounded-2xl bg-[#F8F7F2] border border-[#DCE5E0] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:border-[#A7C4B5] transition-colors"
                            >
                              <div className="space-y-2.5 flex-1">
                                <div className="flex flex-wrap items-center gap-2.5">
                                  <h3 className="font-serif text-xl font-bold text-[#123D35]">
                                    {apt.patient_name}
                                  </h3>
                                  <span
                                    className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                                      apt.status === 'confirmed'
                                        ? 'bg-emerald-100 text-emerald-900'
                                        : apt.status === 'completed'
                                        ? 'bg-blue-100 text-blue-900'
                                        : apt.status === 'cancelled'
                                        ? 'bg-red-100 text-red-900'
                                        : 'bg-amber-100 text-amber-900'
                                    }`}
                                  >
                                    {apt.status}
                                  </span>
                                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white border border-[#DCE5E0] text-[#66736D]">
                                    {apt.language === 'ur' ? 'Urdu' : 'English'}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-[#182522]">
                                  <span className="inline-flex items-center gap-1.5 font-semibold">
                                    <Phone className="w-3.5 h-3.5 text-[#1D5B4A]" />
                                    <a
                                      href={`tel:${apt.phone_number}`}
                                      className="hover:underline"
                                    >
                                      {apt.phone_number}
                                    </a>
                                  </span>

                                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#123D35]">
                                    <Calendar className="w-3.5 h-3.5 text-[#1D5B4A]" />
                                    <span>Appointment Date: {apt.appointment_date}</span>
                                  </span>

                                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#1D5B4A]">
                                    {apt.preferred_session === 'morning' ? (
                                      <Sun className="w-3.5 h-3.5" />
                                    ) : (
                                      <Moon className="w-3.5 h-3.5" />
                                    )}
                                    <span>
                                      {sessionCfg.label.en} ({sessionCfg.displayRange.en})
                                    </span>
                                  </span>
                                </div>

                                {apt.message && (
                                  <p className="text-xs sm:text-sm text-[#66736D] bg-white px-3.5 py-2 rounded-xl border border-[#DCE5E0]">
                                    {apt.message}
                                  </p>
                                )}

                                <p className="text-xs text-[#66736D] flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-[#1D5B4A]" />
                                  <span>Submitted: {submittedStr} (Asia/Kolkata)</span>
                                </p>
                              </div>

                              {/* Actions: WhatsApp Shortcut, Detail View, Status Selector */}
                              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                                <a
                                  href={buildWhatsAppLinkForAppointment(apt)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Contact patient on WhatsApp"
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E6EFEA] hover:bg-[#1D5B4A] text-[#123D35] hover:text-white text-xs font-semibold transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </a>

                                <button
                                  type="button"
                                  onClick={() => setSelectedAppointment(apt)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#E6EFEA]/60 border border-[#DCE5E0] text-xs font-semibold text-[#123D35] transition-colors"
                                >
                                  <span>View Details</span>
                                </button>

                                <select
                                  aria-label={`Change status for ${apt.patient_name}`}
                                  disabled={updatingId === apt.id}
                                  value={apt.status}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      apt.id,
                                      e.target.value as AppointmentStatus
                                    )
                                  }
                                  className="px-3.5 py-2 rounded-xl bg-white border border-[#DCE5E0] text-xs sm:text-sm font-semibold text-[#123D35] focus:border-[#1D5B4A] focus:outline-none"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* ============================================================
                  TAB 2: CLINIC SETTINGS (/admin/settings)
                 ============================================================ */}
              {subRoute === 'settings' && (
                <div className="space-y-8">
                  {/* A. Consultation Fee Settings Card */}
                  <section
                    aria-labelledby="consultation-fee-heading"
                    className="rounded-3xl bg-white border border-[#DCE5E0] shadow-clinic p-7 sm:p-9"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      <div className="lg:col-span-5 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6EFEA] text-[#1D5B4A] text-xs font-semibold uppercase tracking-wider">
                          <IndianRupee className="w-3.5 h-3.5" />
                          <span>Public Fee Setting</span>
                        </div>
                        <h2
                          id="consultation-fee-heading"
                          className="font-serif text-2xl sm:text-3xl font-bold text-[#123D35]"
                        >
                          Consultation Fee
                        </h2>
                        <p className="text-sm text-[#66736D] leading-relaxed">
                          Displayed publicly on the appointment booking section in both English and Urdu. Initially ₹100.
                        </p>

                        <div className="rounded-2xl bg-[#123D35] text-white p-6 border border-[#1D5B4A] shadow-sm">
                          <span className="text-xs uppercase tracking-widest text-[#A7C4B5] font-semibold block mb-1">
                            Current Public Consultation Fee
                          </span>
                          <div className="font-serif text-4xl sm:text-5xl font-bold text-white">
                            {formatConsultationFee(currentFee, currency)}
                          </div>
                          <p className="text-xs text-[#A7C4B5] mt-2">
                            Document: <code>clinic_settings/consultation</code>
                            {lastUpdatedText ? ` · Updated ${lastUpdatedText}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="lg:col-span-7 rounded-2xl bg-[#F8F7F2] border border-[#DCE5E0] p-6 sm:p-7">
                        <h3 className="font-serif text-xl font-bold text-[#123D35] mb-1">
                          Update Consultation Fee (INR)
                        </h3>
                        <p className="text-xs sm:text-sm text-[#66736D] mb-5">
                          Enter any valid non-negative INR amount (whole rupees or decimal amounts).
                        </p>

                        {feeFeedback && (
                          <div
                            role="status"
                            className={`mb-5 p-4 rounded-xl border text-sm flex items-start gap-3 ${
                              feeFeedback.type === 'success'
                                ? 'bg-[#E6EFEA] border-[#1D5B4A]/35 text-[#123D35]'
                                : 'bg-red-50 border-red-200 text-red-900'
                            }`}
                          >
                            {feeFeedback.type === 'success' ? (
                              <CheckCircle2 className="w-5 h-5 text-[#1D5B4A] shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                            )}
                            <span>{feeFeedback.message}</span>
                          </div>
                        )}

                        <form onSubmit={handleSaveFee} className="space-y-5">
                          <div>
                            <label
                              htmlFor="consultation-fee-input"
                              className="block text-xs sm:text-sm font-semibold text-[#123D35] mb-2"
                            >
                              Consultation Fee Amount (₹ INR)
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#1D5B4A] font-bold">
                                ₹
                              </span>
                              <input
                                id="consultation-fee-input"
                                type="number"
                                min="0"
                                step="any"
                                required
                                value={feeInput}
                                onChange={(e) => {
                                  setFeeInput(e.target.value);
                                  setIsEditingFee(true);
                                  if (feeFeedback) setFeeFeedback(null);
                                }}
                                placeholder="100"
                                className="w-full pl-9 pr-4 py-3.5 rounded-xl bg-white border border-[#DCE5E0] focus:border-[#1D5B4A] focus:outline-none focus:ring-2 focus:ring-[#1D5B4A]/20 text-[#182522] text-base font-semibold"
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="submit"
                              disabled={savingFee}
                              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#123D35] hover:bg-[#1D5B4A] disabled:opacity-60 text-white font-semibold text-sm transition-colors shadow-sm"
                            >
                              <Save className="w-4 h-4 text-[#A7C4B5]" />
                              <span>
                                {savingFee ? 'Saving Changes...' : 'Save Changes'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={handleResetFeeEdit}
                              disabled={savingFee}
                              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-[#E6EFEA]/50 border border-[#DCE5E0] text-[#123D35] font-semibold text-sm transition-colors"
                            >
                              <RotateCcw className="w-4 h-4 text-[#1D5B4A]" />
                              <span>Cancel / Reset</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </section>

                  {/* B. Clinic Name, Doctor Name & Read-Only Clinic Timings */}
                  <section className="rounded-3xl bg-white border border-[#DCE5E0] shadow-clinic p-7 sm:p-9">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      <div className="lg:col-span-5 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6EFEA] text-[#1D5B4A] text-xs font-semibold uppercase tracking-wider">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Practice Details</span>
                        </div>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#123D35]">
                          Clinic &amp; Doctor Settings
                        </h2>
                        <p className="text-sm text-[#66736D] leading-relaxed">
                          Manage the clinic name and doctor name stored in Firestore (<code>clinic_settings/general</code>). Clinic session timings remain fixed in <code>Asia/Kolkata</code>.
                        </p>

                        {/* Read-Only Clinic Timings Card */}
                        <div className="rounded-2xl bg-[#F8F7F2] border border-[#DCE5E0] p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#1D5B4A]">
                              Daily Clinic Timings (Read-Only)
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#E6EFEA] text-[#123D35]">
                              Asia/Kolkata
                            </span>
                          </div>
                          <div className="text-sm space-y-1.5">
                            <p className="flex items-center justify-between text-[#182522]">
                              <span className="font-semibold">Morning Session:</span>
                              <span>10:00 AM – 1:00 PM</span>
                            </p>
                            <p className="flex items-center justify-between text-[#182522]">
                              <span className="font-semibold">Evening Session:</span>
                              <span>9:00 PM – 12:00 AM</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-7 rounded-2xl bg-[#F8F7F2] border border-[#DCE5E0] p-6 sm:p-7">
                        <h3 className="font-serif text-xl font-bold text-[#123D35] mb-1">
                          Edit Clinic &amp; Doctor Name
                        </h3>
                        <p className="text-xs sm:text-sm text-[#66736D] mb-5">
                          Only the authorized administrator can view and update these settings.
                        </p>

                        {generalFeedback && (
                          <div
                            role="status"
                            className={`mb-5 p-4 rounded-xl border text-sm flex items-start gap-3 ${
                              generalFeedback.type === 'success'
                                ? 'bg-[#E6EFEA] border-[#1D5B4A]/35 text-[#123D35]'
                                : 'bg-red-50 border-red-200 text-red-900'
                            }`}
                          >
                            {generalFeedback.type === 'success' ? (
                              <CheckCircle2 className="w-5 h-5 text-[#1D5B4A] shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                            )}
                            <span>{generalFeedback.message}</span>
                          </div>
                        )}

                        <form onSubmit={handleSaveGeneralSettings} className="space-y-4">
                          <div>
                            <label
                              htmlFor="clinic-name-input"
                              className="block text-xs sm:text-sm font-semibold text-[#123D35] mb-1.5"
                            >
                              Clinic Name
                            </label>
                            <input
                              id="clinic-name-input"
                              type="text"
                              required
                              value={clinicNameInput}
                              onChange={(e) => {
                                setClinicNameInput(e.target.value);
                                setIsEditingGeneral(true);
                                if (generalFeedback) setGeneralFeedback(null);
                              }}
                              className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCE5E0] focus:border-[#1D5B4A] focus:outline-none text-sm font-medium"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="doctor-name-input"
                              className="block text-xs sm:text-sm font-semibold text-[#123D35] mb-1.5"
                            >
                              Doctor Name
                            </label>
                            <input
                              id="doctor-name-input"
                              type="text"
                              required
                              value={doctorNameInput}
                              onChange={(e) => {
                                setDoctorNameInput(e.target.value);
                                setIsEditingGeneral(true);
                                if (generalFeedback) setGeneralFeedback(null);
                              }}
                              className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCE5E0] focus:border-[#1D5B4A] focus:outline-none text-sm font-medium"
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pt-2">
                            <button
                              type="submit"
                              disabled={savingGeneral}
                              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#123D35] hover:bg-[#1D5B4A] disabled:opacity-60 text-white font-semibold text-sm transition-colors shadow-sm"
                            >
                              <Save className="w-4 h-4 text-[#A7C4B5]" />
                              <span>
                                {savingGeneral ? 'Saving...' : 'Save Clinic Settings'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={handleResetGeneralEdit}
                              disabled={savingGeneral}
                              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-[#E6EFEA]/50 border border-[#DCE5E0] text-[#123D35] font-semibold text-sm transition-colors"
                            >
                              <RotateCcw className="w-4 h-4 text-[#1D5B4A]" />
                              <span>Reset</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* ============================================================
                  TAB 3: ADMIN PROFILE & SECURITY (/admin/profile)
                 ============================================================ */}
              {subRoute === 'profile' && (
                <div className="space-y-8">
                  {/* A. Admin Profile Overview Card */}
                  <section className="rounded-3xl bg-white border border-[#DCE5E0] shadow-clinic p-7 sm:p-9">
                    <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-[#DCE5E0]">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6EFEA] text-[#1D5B4A] text-xs font-semibold uppercase tracking-wider mb-2">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Administrator Account</span>
                        </div>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#123D35]">
                          Admin Profile &amp; Security
                        </h2>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Active · Authorized Admin</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 text-sm">
                      <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#DCE5E0]">
                        <span className="text-xs text-[#66736D] block mb-1">
                          Admin Login Email
                        </span>
                        <strong className="text-[#123D35] break-all">
                          {user.email}
                        </strong>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#DCE5E0]">
                        <span className="text-xs text-[#66736D] block mb-1">
                          Account Status
                        </span>
                        <strong className="text-[#1D5B4A]">
                          Authenticated (Firebase Auth)
                        </strong>
                      </div>
                    </div>
                  </section>

                  {/* B. Change Password Card */}
                  <section className="rounded-3xl bg-white border border-[#DCE5E0] shadow-clinic p-7 sm:p-9">
                    <div className="max-w-2xl">
                      <div className="flex items-center gap-2.5 text-[#1D5B4A] text-xs font-semibold uppercase tracking-wider mb-2">
                        <KeyRound className="w-4 h-4" />
                        <span>Password Management</span>
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-[#123D35] mb-1">
                        Change Administrator Password
                      </h3>
                      <p className="text-xs sm:text-sm text-[#66736D] mb-6">
                        For your security, please enter your current password to reauthenticate before setting a new password.
                      </p>

                      {passwordFeedback && (
                        <div
                          role="alert"
                          className={`mb-5 p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${
                            passwordFeedback.type === 'success'
                              ? 'bg-[#E6EFEA] border-[#1D5B4A]/35 text-[#123D35]'
                              : 'bg-red-50 border-red-200 text-red-900'
                          }`}
                        >
                          {passwordFeedback.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-[#1D5B4A] shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                          )}
                          <span>{passwordFeedback.message}</span>
                        </div>
                      )}

                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                          <label
                            htmlFor="current-password-pwd"
                            className="block text-xs sm:text-sm font-semibold text-[#123D35] mb-1.5"
                          >
                            Current Password *
                          </label>
                          <div className="relative">
                            <input
                              id="current-password-pwd"
                              type={showCurrentPwd ? 'text' : 'password'}
                              required
                              autoComplete="current-password"
                              value={currentPasswordForPwd}
                              onChange={(e) => setCurrentPasswordForPwd(e.target.value)}
                              placeholder="Enter your current password"
                              className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#F8F7F2] border border-[#DCE5E0] focus:border-[#1D5B4A] focus:bg-white focus:outline-none text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPwd((v) => !v)}
                              aria-label={
                                showCurrentPwd ? 'Hide password' : 'Show password'
                              }
                              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#66736D] hover:text-[#123D35]"
                            >
                              {showCurrentPwd ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="new-password"
                              className="block text-xs sm:text-sm font-semibold text-[#123D35] mb-1.5"
                            >
                              New Password (min 8 chars) *
                            </label>
                            <div className="relative">
                              <input
                                id="new-password"
                                type={showNewPwd ? 'text' : 'password'}
                                required
                                minLength={8}
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#F8F7F2] border border-[#DCE5E0] focus:border-[#1D5B4A] focus:bg-white focus:outline-none text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPwd((v) => !v)}
                                aria-label={
                                  showNewPwd ? 'Hide password' : 'Show password'
                                }
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#66736D] hover:text-[#123D35]"
                              >
                                {showNewPwd ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="confirm-new-password"
                              className="block text-xs sm:text-sm font-semibold text-[#123D35] mb-1.5"
                            >
                              Confirm New Password *
                            </label>
                            <div className="relative">
                              <input
                                id="confirm-new-password"
                                type={showConfirmPwd ? 'text' : 'password'}
                                required
                                minLength={8}
                                autoComplete="new-password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#F8F7F2] border border-[#DCE5E0] focus:border-[#1D5B4A] focus:bg-white focus:outline-none text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPwd((v) => !v)}
                                aria-label={
                                  showConfirmPwd ? 'Hide password' : 'Show password'
                                }
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#66736D] hover:text-[#123D35]"
                              >
                                {showConfirmPwd ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={changingPassword}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#123D35] hover:bg-[#1D5B4A] disabled:opacity-60 text-white font-semibold text-sm transition-colors shadow-sm"
                        >
                          <Save className="w-4 h-4 text-[#A7C4B5]" />
                          <span>
                            {changingPassword
                              ? 'Updating Password...'
                              : 'Update Password'}
                          </span>
                        </button>
                      </form>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl border border-[#DCE5E0] max-w-lg w-full p-6 sm:p-8 shadow-clinic-lg space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-[#DCE5E0] pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1D5B4A] block">
                  Appointment Request Detail
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#123D35] mt-0.5">
                  {selectedAppointment.patient_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                aria-label="Close detail view"
                className="w-9 h-9 rounded-xl bg-[#F8F7F2] hover:bg-[#E6EFEA] flex items-center justify-center text-[#123D35]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3.5 rounded-xl bg-[#F8F7F2] border border-[#DCE5E0]">
                <dt className="text-xs text-[#66736D]">Phone Number</dt>
                <dd className="font-bold text-[#123D35] mt-0.5">
                  <a
                    href={`tel:${selectedAppointment.phone_number}`}
                    className="hover:underline"
                  >
                    {selectedAppointment.phone_number}
                  </a>
                </dd>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F7F2] border border-[#DCE5E0]">
                <dt className="text-xs text-[#66736D]">Current Status</dt>
                <dd className="font-bold uppercase text-[#1D5B4A] mt-0.5">
                  {selectedAppointment.status}
                </dd>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F7F2] border border-[#DCE5E0]">
                <dt className="text-xs text-[#66736D]">Appointment Date</dt>
                <dd className="font-bold text-[#123D35] mt-0.5">
                  {selectedAppointment.appointment_date}
                </dd>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F7F2] border border-[#DCE5E0]">
                <dt className="text-xs text-[#66736D]">Preferred Session</dt>
                <dd className="font-bold text-[#123D35] mt-0.5">
                  {
                    CLINIC_CONFIG.sessions[selectedAppointment.preferred_session]
                      .label.en
                  }{' '}
                  (
                  {
                    CLINIC_CONFIG.sessions[selectedAppointment.preferred_session]
                      .displayRange.en
                  }
                  )
                </dd>
              </div>

              <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#F8F7F2] border border-[#DCE5E0]">
                <dt className="text-xs text-[#66736D]">
                  Submitted Timestamp (Asia/Kolkata)
                </dt>
                <dd className="font-semibold text-[#182522] mt-0.5">
                  {selectedAppointment.submitted_at
                    ? selectedAppointment.submitted_at
                        .toDate()
                        .toLocaleString('en-IN', {
                          timeZone: CLINIC_CONFIG.timezone,
                          dateStyle: 'full',
                          timeStyle: 'medium',
                        })
                    : 'Pending server timestamp'}
                </dd>
              </div>

              {selectedAppointment.message && (
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#F8F7F2] border border-[#DCE5E0]">
                  <dt className="text-xs text-[#66736D]">Patient Message</dt>
                  <dd className="text-[#182522] mt-1 whitespace-pre-wrap">
                    {selectedAppointment.message}
                  </dd>
                </div>
              )}
            </dl>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#DCE5E0]">
              <div className="flex items-center gap-2">
                <a
                  href={buildWhatsAppLinkForAppointment(selectedAppointment)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#123D35] hover:bg-[#1D5B4A] text-white text-xs sm:text-sm font-semibold"
                >
                  <MessageCircle className="w-4 h-4 text-[#A7C4B5]" />
                  <span>WhatsApp Patient</span>
                </a>
                <a
                  href={`tel:${selectedAppointment.phone_number}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DCE5E0] text-[#123D35] text-xs sm:text-sm font-semibold"
                >
                  <Phone className="w-4 h-4 text-[#1D5B4A]" />
                  <span>Call</span>
                </a>
              </div>

              <select
                aria-label="Update appointment status"
                value={selectedAppointment.status}
                onChange={(e) =>
                  handleStatusChange(
                    selectedAppointment.id,
                    e.target.value as AppointmentStatus
                  )
                }
                className="px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#DCE5E0] text-xs sm:text-sm font-semibold text-[#123D35]"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
