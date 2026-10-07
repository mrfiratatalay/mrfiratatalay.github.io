/**
 * Pencere sınır hesapları (saf fonksiyonlar, DOM kullanmaz).
 *
 * Kurallar:
 * - Pencere çalışma alanından büyük olamaz; ekran daralınca boyut yeniden sınırlanır.
 * - Başlık çubuğu her zaman ulaşılabilir kalır: üstten dışarı çıkamaz, alttan en az
 *   başlık çubuğu yüksekliği kadar görünür; soldaki pencere kontrolleri kaybolmaz.
 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface WindowLimits {
  minWidth: number;
  minHeight: number;
  titlebarHeight: number;
  minVisibleX: number;
  margin: number;
}

export const WINDOW_LIMITS: WindowLimits = {
  minWidth: 360,
  minHeight: 240,
  titlebarHeight: 58,
  minVisibleX: 120,
  margin: 8,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function clampSize(rect: Rect, area: Size, limits: WindowLimits = WINDOW_LIMITS): Rect {
  const minWidth = Math.min(limits.minWidth, area.width);
  const minHeight = Math.min(limits.minHeight, area.height);
  return {
    ...rect,
    width: clamp(Math.round(rect.width), minWidth, Math.max(minWidth, area.width)),
    height: clamp(Math.round(rect.height), minHeight, Math.max(minHeight, area.height)),
  };
}

export function clampPosition(rect: Rect, area: Size, limits: WindowLimits = WINDOW_LIMITS): Rect {
  const visible = Math.min(limits.minVisibleX, rect.width);
  const maxX = Math.max(0, area.width - visible);
  const maxY = Math.max(0, area.height - limits.titlebarHeight);
  return {
    ...rect,
    x: clamp(Math.round(rect.x), 0, maxX),
    y: clamp(Math.round(rect.y), 0, maxY),
  };
}

export function clampRect(rect: Rect, area: Size, limits: WindowLimits = WINDOW_LIMITS): Rect {
  return clampPosition(clampSize(rect, area, limits), area, limits);
}

export function moveRect(rect: Rect, dx: number, dy: number, area: Size, limits: WindowLimits = WINDOW_LIMITS): Rect {
  return clampPosition({ ...rect, x: rect.x + dx, y: rect.y + dy }, area, limits);
}

/** Sağ alt köşeden boyutlandırma: pencere çalışma alanının dışına taşamaz. */
export function resizeRect(rect: Rect, dw: number, dh: number, area: Size, limits: WindowLimits = WINDOW_LIMITS): Rect {
  const minWidth = Math.min(limits.minWidth, area.width);
  const minHeight = Math.min(limits.minHeight, area.height);
  const x = clamp(rect.x, 0, Math.max(0, area.width - minWidth));
  const y = clamp(rect.y, 0, Math.max(0, area.height - minHeight));
  const maxWidth = Math.max(minWidth, area.width - x);
  const maxHeight = Math.max(minHeight, area.height - y);
  return {
    ...rect,
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(clamp(rect.width + dw, minWidth, maxWidth)),
    height: Math.round(clamp(rect.height + dh, minHeight, maxHeight)),
  };
}

export function maximizedRect(area: Size, margin = WINDOW_LIMITS.margin): Rect {
  return {
    x: margin,
    y: margin,
    width: Math.max(0, area.width - margin * 2),
    height: Math.max(0, area.height - margin * 2),
  };
}

/** Saklanan geometri gerçekten sayı mı? (Bozuk veya eski kayıtlar yok sayılır.) */
export function isRect(value: unknown): value is Rect {
  if (!value || typeof value !== 'object') return false;
  const rect = value as Record<string, unknown>;
  return ['x', 'y', 'width', 'height'].every((key) => Number.isFinite(rect[key]));
}
