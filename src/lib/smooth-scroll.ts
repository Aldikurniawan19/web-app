import type Lenis from "lenis";

let activeLenisInstance: Lenis | null = null;
let scrollLockCount = 0;

/**
 * Mendaftarkan atau melepas instance Lenis global yang dikelola SmoothScrollProvider.
 */
export function registerLenisInstance(instance: Lenis | null): void {
  activeLenisInstance = instance;
  if (activeLenisInstance && scrollLockCount > 0) {
    activeLenisInstance.stop();
  }
}

/**
 * Mengembalikan instance Lenis aktif jika tersedia.
 */
export function getLenisInstance(): Lenis | null {
  return activeLenisInstance;
}

/**
 * Menghentikan sementara smooth scroll (misalnya saat modal terbuka).
 * Menggunakan penghitung kunci agar beberapa modal bertumpuk tidak saling membuka kunci lebih awal.
 */
export function lockSmoothScroll(): void {
  scrollLockCount += 1;
  activeLenisInstance?.stop();
}

/**
 * Mengaktifkan kembali smooth scroll setelah modal ditutup.
 */
export function unlockSmoothScroll(): void {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    activeLenisInstance?.start();
  }
}

export interface SmoothScrollOptions {
  offset?: number;
  immediate?: boolean;
  duration?: number;
}

/**
 * Helper terpusat untuk menggulir halaman secara halus melalui Lenis jika aktif,
 * dengan fallback aman ke window.scrollTo ketika Lenis tidak aktif (admin / reduced motion).
 */
export function smoothScrollTo(
  target: number | string | HTMLElement,
  options: SmoothScrollOptions = {}
): void {
  if (typeof window === "undefined") return;

  const offset = options.offset ?? 0;
  const immediate = options.immediate ?? false;
  const duration = options.duration ?? 1.05;

  const targetElement =
    typeof target === "string"
      ? target.startsWith("#")
        ? document.getElementById(target.slice(1))
        : document.querySelector<HTMLElement>(target)
      : target instanceof HTMLElement
        ? target
        : null;

  // Lenis otomatis mengurangi scroll-margin-top pada elemen target,
  // sehingga offset negatif perlu diselaraskan agar tidak terjadi double-offset.
  const scrollMarginTop = targetElement
    ? Number.parseFloat(window.getComputedStyle(targetElement).scrollMarginTop) || 0
    : 0;

  if (activeLenisInstance) {
    const adjustedOffset =
      targetElement && offset < 0 && scrollMarginTop > 0
        ? Math.min(0, offset + scrollMarginTop)
        : offset;

    activeLenisInstance.scrollTo(targetElement ?? target, {
      offset: adjustedOffset,
      immediate,
      duration,
    });
    return;
  }

  let top = 0;
  if (typeof target === "number") {
    top = target + offset;
  } else {
    if (!targetElement) return;
    const effectiveOffset =
      offset < 0 ? -Math.max(Math.abs(offset), scrollMarginTop) : offset - scrollMarginTop;
    top = targetElement.getBoundingClientRect().top + window.scrollY + effectiveOffset;
  }

  window.scrollTo({
    top: Math.max(0, top),
    behavior: immediate ? "auto" : "smooth",
  });
}
