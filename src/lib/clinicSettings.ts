import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { CLINIC_CONFIG } from '../config/clinicConfig';

export const CLINIC_SETTINGS_COLLECTION = 'clinic_settings';
export const CONSULTATION_DOC_ID = 'consultation';
export const GENERAL_SETTINGS_DOC_ID = 'general';

export const DEFAULT_CONSULTATION_FEE = 100;
export const DEFAULT_CURRENCY = 'INR';

export interface ConsultationSettingsData {
  consultation_fee: number;
  currency: string;
  updated_at?: Timestamp | null;
  updated_by?: string | null;
}

export interface GeneralClinicSettingsData {
  clinic_name: string;
  doctor_name: string;
  updated_at?: Timestamp | null;
  updated_by?: string | null;
}

/**
 * Formats a numeric INR amount cleanly (e.g. 100 -> "₹100", 150.5 -> "₹150.50").
 */
export function formatConsultationFee(
  amount: number,
  currency: string = DEFAULT_CURRENCY
): string {
  const safeAmount =
    typeof amount === 'number' && Number.isFinite(amount) && amount >= 0
      ? amount
      : DEFAULT_CONSULTATION_FEE;

  const isWhole = Number.isInteger(safeAmount);
  const formattedNumber = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);

  return currency === 'INR' ? `₹${formattedNumber}` : `${currency} ${formattedNumber}`;
}

/**
 * Fetches the current consultation fee once from `clinic_settings/consultation`,
 * returning a safe fallback of ₹100 if the document does not exist or fails to load.
 */
export async function fetchConsultationSettings(): Promise<ConsultationSettingsData> {
  if (!isFirebaseConfigured || !db) {
    return {
      consultation_fee: DEFAULT_CONSULTATION_FEE,
      currency: DEFAULT_CURRENCY,
    };
  }

  try {
    const ref = doc(db, CLINIC_SETTINGS_COLLECTION, CONSULTATION_DOC_ID);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const fee =
        typeof data.consultation_fee === 'number' &&
        Number.isFinite(data.consultation_fee) &&
        data.consultation_fee >= 0
          ? data.consultation_fee
          : DEFAULT_CONSULTATION_FEE;

      return {
        consultation_fee: fee,
        currency: typeof data.currency === 'string' ? data.currency : DEFAULT_CURRENCY,
        updated_at: data.updated_at || null,
        updated_by: data.updated_by || null,
      };
    }
  } catch {
    // Fall back safely to default fee
  }

  return {
    consultation_fee: DEFAULT_CONSULTATION_FEE,
    currency: DEFAULT_CURRENCY,
  };
}

/**
 * Subscribes in real time to `clinic_settings/consultation`.
 * Safely falls back to ₹100 if the document hasn't been created yet or cannot be read.
 */
export function subscribeToConsultationFee(
  onData: (settings: ConsultationSettingsData) => void
): () => void {
  if (!isFirebaseConfigured || !db) {
    onData({
      consultation_fee: DEFAULT_CONSULTATION_FEE,
      currency: DEFAULT_CURRENCY,
    });
    return () => {};
  }

  const ref = doc(db, CLINIC_SETTINGS_COLLECTION, CONSULTATION_DOC_ID);
  const unsubscribe = onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const fee =
          typeof data.consultation_fee === 'number' &&
          Number.isFinite(data.consultation_fee) &&
          data.consultation_fee >= 0
            ? data.consultation_fee
            : DEFAULT_CONSULTATION_FEE;

        onData({
          consultation_fee: fee,
          currency: typeof data.currency === 'string' ? data.currency : DEFAULT_CURRENCY,
          updated_at: data.updated_at || null,
          updated_by: data.updated_by || null,
        });
      } else {
        onData({
          consultation_fee: DEFAULT_CONSULTATION_FEE,
          currency: DEFAULT_CURRENCY,
        });
      }
    },
    () => {
      // On permission or network error, fall back gracefully to ₹100
      onData({
        consultation_fee: DEFAULT_CONSULTATION_FEE,
        currency: DEFAULT_CURRENCY,
      });
    }
  );

  return unsubscribe;
}

/**
 * Updates `clinic_settings/consultation` in Firestore.
 * Only callable by the authorized administrator.
 */
export async function saveConsultationFee(
  newFee: number,
  adminUid: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isFirebaseConfigured || !db) {
    return {
      ok: false,
      error: 'Firebase Cloud Firestore is not configured.',
    };
  }

  if (typeof newFee !== 'number' || !Number.isFinite(newFee) || newFee < 0) {
    return {
      ok: false,
      error: 'Please enter a valid non-negative consultation fee amount (0 or greater).',
    };
  }

  if (!adminUid || !adminUid.trim()) {
    return {
      ok: false,
      error: 'Authorized administrator session is required.',
    };
  }

  const normalizedFee = Math.round(newFee * 100) / 100;

  try {
    const ref = doc(db, CLINIC_SETTINGS_COLLECTION, CONSULTATION_DOC_ID);
    await setDoc(ref, {
      consultation_fee: normalizedFee,
      currency: DEFAULT_CURRENCY,
      updated_at: serverTimestamp(),
      updated_by: adminUid.trim(),
    });
    return { ok: true };
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    if (rawMsg.includes('permission') || rawMsg.includes('Permission')) {
      return {
        ok: false,
        error:
          'Missing or insufficient permissions. Verify that your Admin UID is set in firestore.rules and published in Firebase Console -> Firestore Database -> Rules.',
      };
    }
    return {
      ok: false,
      error: rawMsg || 'Failed to update consultation fee in Firestore.',
    };
  }
}

/**
 * Subscribes to general clinic settings (`clinic_settings/general`).
 * Publicly readable by public visitors and administrator.
 */
export function subscribeToGeneralClinicSettings(
  onData: (settings: GeneralClinicSettingsData) => void
): () => void {
  const defaultGeneral: GeneralClinicSettingsData = {
    clinic_name: CLINIC_CONFIG.clinicName.en,
    doctor_name: CLINIC_CONFIG.doctorName.en,
  };

  if (!isFirebaseConfigured || !db) {
    onData(defaultGeneral);
    return () => {};
  }

  const ref = doc(db, CLINIC_SETTINGS_COLLECTION, GENERAL_SETTINGS_DOC_ID);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        onData({
          clinic_name:
            typeof d.clinic_name === 'string' && d.clinic_name.trim()
              ? d.clinic_name.trim()
              : defaultGeneral.clinic_name,
          doctor_name:
            typeof d.doctor_name === 'string' && d.doctor_name.trim()
              ? d.doctor_name.trim()
              : defaultGeneral.doctor_name,
          updated_at: d.updated_at || null,
          updated_by: d.updated_by || null,
        });
      } else {
        onData(defaultGeneral);
      }
    },
    () => {
      onData(defaultGeneral);
    }
  );
}

/**
 * Saves general clinic settings (`clinic_settings/general`).
 */
export async function saveGeneralClinicSettings(
  clinicName: string,
  doctorName: string,
  adminUid: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isFirebaseConfigured || !db) {
    return {
      ok: false,
      error: 'Firebase Cloud Firestore is not configured.',
    };
  }

  const cleanClinic = clinicName.trim();
  const cleanDoctor = doctorName.trim();

  if (cleanClinic.length < 2 || cleanClinic.length > 120) {
    return {
      ok: false,
      error: 'Clinic name must be between 2 and 120 characters.',
    };
  }

  if (cleanDoctor.length < 2 || cleanDoctor.length > 120) {
    return {
      ok: false,
      error: 'Doctor name must be between 2 and 120 characters.',
    };
  }

  if (!adminUid || !adminUid.trim()) {
    return {
      ok: false,
      error: 'Authorized administrator session is required.',
    };
  }

  try {
    const ref = doc(db, CLINIC_SETTINGS_COLLECTION, GENERAL_SETTINGS_DOC_ID);
    await setDoc(ref, {
      clinic_name: cleanClinic,
      doctor_name: cleanDoctor,
      updated_at: serverTimestamp(),
      updated_by: adminUid.trim(),
    });
    return { ok: true };
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    if (rawMsg.includes('permission') || rawMsg.includes('Permission')) {
      return {
        ok: false,
        error:
          'Missing or insufficient permissions. Verify that your Admin UID is set in firestore.rules and published in Firebase Console -> Firestore Database -> Rules.',
      };
    }
    return {
      ok: false,
      error: rawMsg || 'Failed to save clinic settings in Firestore.',
    };
  }
}
