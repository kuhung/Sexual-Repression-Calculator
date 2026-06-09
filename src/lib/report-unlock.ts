const UNLOCK_STORAGE_PREFIX = "sri_full_report_unlock_v1:";

export interface ReportUnlockRecord {
  sessionId: string;
  checkoutSessionId?: string;
  unlockedAt: string;
  amountTotal?: number;
  currency?: string;
}

function getStorageKey(sessionId: string) {
  return `${UNLOCK_STORAGE_PREFIX}${sessionId}`;
}

export function getReportUnlock(sessionId: string): ReportUnlockRecord | null {
  if (typeof window === "undefined" || !sessionId) return null;

  try {
    const raw = window.localStorage.getItem(getStorageKey(sessionId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isReportUnlocked(sessionId: string) {
  return Boolean(getReportUnlock(sessionId));
}

export function markReportUnlocked(
  sessionId: string,
  details: Partial<Omit<ReportUnlockRecord, "sessionId" | "unlockedAt">> = {},
) {
  const record: ReportUnlockRecord = {
    sessionId,
    unlockedAt: new Date().toISOString(),
    ...details,
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(getStorageKey(sessionId), JSON.stringify(record));
  }

  return record;
}
