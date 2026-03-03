/**
 * 시간 유틸리티
 * - API는 항상 UTC 기준 시간을 받고 반환합니다.
 * - 프론트엔드는 현지 시간(local)으로 표시하고 입력합니다.
 */

/** 오늘 날짜를 YYYY-MM-DD 형식으로 반환 (로컬 기준) */
export function getTodayDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 현재 로컬 시각을 HH:MM 형식으로 반환 */
export function getCurrentLocalTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

/**
 * 로컬 날짜(YYYY-MM-DD) + 로컬 시각(HH:MM) → UTC 시각 HH:MM:SS
 * API 전송 전에 호출합니다.
 */
export function localToUtcTime(localDate: string, localTime: string): string {
  const dt = new Date(`${localDate}T${localTime}:00`);
  const h = String(dt.getUTCHours()).padStart(2, "0");
  const m = String(dt.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}:00`;
}

/**
 * UTC 날짜(YYYY-MM-DD) + UTC 시각(HH:MM:SS) → 로컬 시각 HH:MM
 * API 응답 표시 시 호출합니다.
 */
export function utcToLocalTime(utcDate: string, utcTime: string): string {
  const dt = new Date(`${utcDate}T${utcTime}Z`);
  return `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
}

/**
 * UTC 날짜(YYYY-MM-DD) + UTC 시각(HH:MM:SS) → 로컬 날짜 YYYY-MM-DD
 * 시차로 날짜가 바뀌는 경우를 처리합니다.
 */
export function utcToLocalDate(utcDate: string, utcTime: string): string {
  const dt = new Date(`${utcDate}T${utcTime}Z`);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
