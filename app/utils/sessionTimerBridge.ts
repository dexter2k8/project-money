// We use a bridge file because interceptors cannot be used in React

let resetSessionTimer: (() => void) | null = null;

export function setResetSessionTimer(callback: () => void) {
  resetSessionTimer = callback;
}

export function triggerSessionReset() {
  if (resetSessionTimer) resetSessionTimer();
}
