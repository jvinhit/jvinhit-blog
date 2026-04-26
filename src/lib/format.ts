/**
 * Format helpers — giữ logic tách khỏi UI để dễ test và reuse.
 */

/** `2024-11-18` — theo phong cách timestamp ở design */
export function formatDateISO(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** `NOV 18, 2024` — dạng verbose cho header article */
export function formatDateLong(date: Date): string {
  return date
    .toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    })
    .toUpperCase();
}

/** Slugify cơ bản — chỉ cho tag links, không cho post slug (post slug lấy từ filename) */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Ước tính thời gian đọc dựa trên số từ (WPM mặc định 220 — trung bình tiếng Anh kỹ thuật).
 * Dùng thay cho package `reading-time` khi chỉ có plain text.
 */
export function estimateReadingMinutes(
  text: string,
  wordsPerMinute = 220
): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}
