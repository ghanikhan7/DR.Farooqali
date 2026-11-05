import { CLINIC_CONFIG, SessionId } from '../config/clinicConfig';

/**
 * Returns the current date (YYYY-MM-DD) and current time in minutes from 00:00
 * evaluated strictly in the clinic's timezone (Asia/Kolkata).
 */
export function getClinicNow(timezone: string = CLINIC_CONFIG.timezone): {
  dateISO: string;
  minutesNow: number;
} {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = part.value;
    }
  }

  const year = map.year || String(now.getFullYear());
  const month = map.month || String(now.getMonth() + 1).padStart(2, '0');
  const day = map.day || String(now.getDate()).padStart(2, '0');
  const hour = parseInt(map.hour || '0', 10);
  const minute = parseInt(map.minute || '0', 10);

  return {
    dateISO: `${year}-${month}-${day}`,
    minutesNow: hour * 60 + minute,
  };
}

/**
 * Converts a 24-hour "HH:MM" string to minutes since midnight.
 * When `isEndOfSession` is true and time is "00:00", treats it as 24:00 (1440 minutes = midnight at the end of the day).
 */
export function parse24hToMinutes(time24h: string, isEndOfSession = false): number {
  const [hStr, mStr] = time24h.split(':');
  const hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return -1;
  }

  if (isEndOfSession && hours === 0 && minutes === 0) {
    return 24 * 60; // 1440 minutes (midnight at the end of the same calendar day)
  }

  return hours * 60 + minutes;
}

/**
 * Validates whether a phone number is a valid Indian or international phone number.
 */
export function isValidPhoneNumber(rawPhone: string): boolean {
  const trimmed = rawPhone.trim();
  if (!/^[0-9+\-\s()]{10,20}$/.test(trimmed)) {
    return false;
  }
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length === 10) {
    return /^[6-9]\d{9}$/.test(digitsOnly);
  }
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return /^0[6-9]\d{9}$/.test(digitsOnly);
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return /^91[6-9]\d{9}$/.test(digitsOnly);
  }
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

/**
 * Validates that a selected date (YYYY-MM-DD) is today or in the future in Asia/Kolkata.
 */
export function isDateNotInPast(dateISO: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) return false;
  const { dateISO: todayISO } = getClinicNow();
  return dateISO >= todayISO;
}

/**
 * Checks whether a clinic session ('morning' | 'evening') has already ended
 * for the selected date in Asia/Kolkata time.
 * - Morning ends at 13:00 (1:00 PM = 780 minutes).
 * - Evening ends at 00:00 midnight (24:00 = 1440 minutes at the end of the calendar day).
 */
export function hasSessionEndedInKolkata(
  dateISO: string,
  sessionId: SessionId
): boolean {
  const sessionConfig = CLINIC_CONFIG.sessions[sessionId];
  if (!sessionConfig) return true;

  const { dateISO: todayISO, minutesNow } = getClinicNow();
  if (dateISO < todayISO) return true;
  if (dateISO > todayISO) return false;

  const sessionEndMinutes = parse24hToMinutes(sessionConfig.end24h, true);
  return minutesNow >= sessionEndMinutes;
}
