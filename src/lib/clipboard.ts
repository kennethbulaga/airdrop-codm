/**
 * Triggers light haptic feedback on devices with vibration support.
 */
export function triggerHaptic(durationMs = 12): void {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(durationMs);
    } catch {
      // Ignore vibration errors if disabled or unsupported
    }
  }
}

/**
 * Resilient clipboard utility that uses the async Clipboard API when available
 * and falls back to a temporary textarea element for restricted mobile WebViews
 * (e.g. TikTok, Facebook Gaming, Instagram in-app browsers).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  triggerHaptic(15);

  // 1. Primary: Async Clipboard API
  try {
    if (
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      window.isSecureContext
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Continue to legacy fallback on permission denial or WebView restriction
  }

  // 2. Secondary: Document execCommand fallback
  try {
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, 99999); // Mobile iOS Safari compatibility

      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    }
  } catch {
    return false;
  }

  return false;
}
