import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { CLINIC_CONFIG, Language, SessionId } from '../config/clinicConfig';
import {
  hasSessionEndedInKolkata,
  isDateNotInPast,
  isValidPhoneNumber,
} from '../utils/appointmentTime';

export const APPOINTMENT_COLLECTION = 'appointment_requests';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface AppointmentRequestInput {
  patient_name: string;
  phone_number: string;
  appointment_date: string; // YYYY-MM-DD (requested appointment date, separate from submitted_at)
  preferred_session: SessionId; // 'morning' | 'evening'
  message?: string | null;
  language: Language;
}

export interface AppointmentRecord {
  id: string;
  patient_name: string;
  phone_number: string;
  appointment_date: string;
  preferred_session: SessionId;
  message: string | null;
  status: AppointmentStatus;
  timezone: string;
  language: Language;
  submitted_at: Timestamp | null;
}

export type AppointmentSubmitErrorCode =
  | 'FIREBASE_NOT_CONFIGURED'
  | 'DUPLICATE_SUBMISSION'
  | 'INVALID_PAYLOAD'
  | 'FIRESTORE_ERROR';

export interface AppointmentSubmitResult {
  ok: boolean;
  docId?: string;
  errorCode?: AppointmentSubmitErrorCode;
  errorMessage?: string;
}

// In-memory guard to prevent accidental rapid duplicate submissions
let lastSubmissionKey = '';
let lastSubmissionTimeMs = 0;
const DUPLICATE_COOLDOWN_MS = 60_000;

function mapDocToAppointmentRecord(
  docSnap: QueryDocumentSnapshot<DocumentData>
): AppointmentRecord {
  const d = docSnap.data();
  const session: SessionId = d.preferred_session === 'evening' ? 'evening' : 'morning';
  const status: AppointmentStatus =
    d.status === 'confirmed' || d.status === 'completed' || d.status === 'cancelled'
      ? d.status
      : 'pending';

  return {
    id: docSnap.id,
    patient_name: typeof d.patient_name === 'string' ? d.patient_name : 'Unknown',
    phone_number: typeof d.phone_number === 'string' ? d.phone_number : '',
    appointment_date: typeof d.appointment_date === 'string' ? d.appointment_date : '',
    preferred_session: session,
    message: typeof d.message === 'string' ? d.message : null,
    status,
    timezone: typeof d.timezone === 'string' ? d.timezone : CLINIC_CONFIG.timezone,
    language: d.language === 'ur' ? 'ur' : 'en',
    submitted_at: d.submitted_at instanceof Timestamp ? d.submitted_at : null,
  };
}

/**
 * Validates and submits a new appointment request to Cloud Firestore (`appointment_requests`).
 * Uses `serverTimestamp()` for `submitted_at` to record the exact moment the request is received,
 * keeping `appointment_date` and `preferred_session` strictly separate.
 */
export async function submitAppointmentRequest(
  input: AppointmentRequestInput
): Promise<AppointmentSubmitResult> {
  if (!isFirebaseConfigured || !db) {
    return {
      ok: false,
      errorCode: 'FIREBASE_NOT_CONFIGURED',
    };
  }

  const cleanName = input.patient_name.trim();
  const cleanPhone = input.phone_number.trim();
  const cleanDate = input.appointment_date.trim();
  const cleanSession = input.preferred_session;
  const cleanMessage = input.message?.trim() ? input.message.trim() : null;

  // Defensive validation before writing to Firestore
  if (
    cleanName.length < 2 ||
    cleanName.length > 120 ||
    !isValidPhoneNumber(cleanPhone) ||
    !isDateNotInPast(cleanDate) ||
    (cleanSession !== 'morning' && cleanSession !== 'evening') ||
    hasSessionEndedInKolkata(cleanDate, cleanSession)
  ) {
    return {
      ok: false,
      errorCode: 'INVALID_PAYLOAD',
    };
  }

  // Prevent duplicate submission of the exact same booking within 60 seconds
  const dedupeKey = `${cleanName.toLowerCase()}|${cleanPhone.replace(/\D/g, '')}|${cleanDate}|${cleanSession}`;
  const nowMs = Date.now();
  if (
    dedupeKey === lastSubmissionKey &&
    nowMs - lastSubmissionTimeMs < DUPLICATE_COOLDOWN_MS
  ) {
    return {
      ok: false,
      errorCode: 'DUPLICATE_SUBMISSION',
    };
  }

  try {
    const docRef = await addDoc(collection(db, APPOINTMENT_COLLECTION), {
      patient_name: cleanName,
      phone_number: cleanPhone,
      appointment_date: cleanDate,
      preferred_session: cleanSession,
      message: cleanMessage,
      status: 'pending',
      timezone: CLINIC_CONFIG.timezone, // 'Asia/Kolkata'
      language: input.language,
      // Actual submission timestamp generated on the Firebase server
      submitted_at: serverTimestamp(),
    });

    lastSubmissionKey = dedupeKey;
    lastSubmissionTimeMs = Date.now();

    return {
      ok: true,
      docId: docRef.id,
    };
  } catch (err) {
    return {
      ok: false,
      errorCode: 'FIRESTORE_ERROR',
      errorMessage: err instanceof Error ? err.message : 'Unknown Firestore error',
    };
  }
}

/**
 * Subscribes to appointment requests in Firestore (for the authorized Admin Dashboard).
 */
export function subscribeToAppointments(
  onData: (records: AppointmentRecord[]) => void,
  onError?: (errMessage: string) => void
): () => void {
  if (!isFirebaseConfigured || !db) {
    onData([]);
    return () => {};
  }

  const q = query(
    collection(db, APPOINTMENT_COLLECTION),
    orderBy('submitted_at', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map(mapDocToAppointmentRecord);
      onData(items);
    },
    (err) => {
      if (onError) {
        onError(err.message);
      }
    }
  );
}

/**
 * Fetches appointment requests on-demand (for the Admin Dashboard Refresh button).
 */
export async function fetchAppointmentsOnce(): Promise<{
  ok: boolean;
  records: AppointmentRecord[];
  error?: string;
}> {
  if (!isFirebaseConfigured || !db) {
    return { ok: false, records: [], error: 'Firestore not configured.' };
  }

  try {
    const q = query(
      collection(db, APPOINTMENT_COLLECTION),
      orderBy('submitted_at', 'desc')
    );
    const snap = await getDocs(q);
    return {
      ok: true,
      records: snap.docs.map(mapDocToAppointmentRecord),
    };
  } catch (err) {
    return {
      ok: false,
      records: [],
      error: err instanceof Error ? err.message : 'Failed to refresh appointments.',
    };
  }
}

/**
 * Updates the status of an appointment request in Firestore (restricted to authorized admin).
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  newStatus: AppointmentStatus
): Promise<{ ok: boolean; error?: string }> {
  if (!isFirebaseConfigured || !db) {
    return { ok: false, error: 'Firestore not configured.' };
  }

  try {
    const ref = doc(db, APPOINTMENT_COLLECTION, appointmentId);
    await updateDoc(ref, {
      status: newStatus,
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to update status.',
    };
  }
}
