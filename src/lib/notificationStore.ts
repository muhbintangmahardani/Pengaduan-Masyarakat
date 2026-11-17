"use client";

// Storage keys - v2 dengan dukungan lifecycle status per pengaduan
const READ_KEY = "jalanbaik_read_notifications_v2";
const CLEARED_KEY = "jalanbaik_cleared_notifications_v2";
const SYNC_EVENT = "jalanbaik-notification-sync";

function getStoredArray(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStoredArray(key: string, arr: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(arr));
  } catch (err) {
    console.warn("Gagal menyimpan ke localStorage:", err);
  }
}

export function getNotificationKey(id: string, status?: string): string {
  return status ? `${id}:${status}` : id;
}

export function isNotificationRead(id: string, status?: string): boolean {
  const readList = getStoredArray(READ_KEY);
  if (status) {
    const statusKey = `${id}:${status}`;
    return readList.includes(statusKey);
  }
  return readList.includes(id);
}

export function isNotificationCleared(id: string): boolean {
  const clearedList = getStoredArray(CLEARED_KEY);
  return clearedList.includes(id);
}

export function markNotificationAsRead(id: string, status?: string): void {
  const readList = getStoredArray(READ_KEY);
  const key = status ? `${id}:${status}` : id;
  if (!readList.includes(key)) {
    readList.push(key);
    setStoredArray(READ_KEY, readList);
    notifySync();
  }
}

export function markAllNotificationsAsRead(
  identifiers: (string | { id: string; status?: string })[]
): void {
  const readList = getStoredArray(READ_KEY);
  const newKeys: string[] = [];

  for (const item of identifiers) {
    if (typeof item === "string") {
      newKeys.push(item);
    } else if (item && item.id) {
      newKeys.push(item.status ? `${item.id}:${item.status}` : item.id);
    }
  }

  const set = new Set([...readList, ...newKeys]);
  setStoredArray(READ_KEY, Array.from(set));
  notifySync();
}

export function clearSingleNotification(id: string): void {
  const clearedList = getStoredArray(CLEARED_KEY);
  if (!clearedList.includes(id)) {
    clearedList.push(id);
    setStoredArray(CLEARED_KEY, clearedList);
    notifySync();
  }
}

export function clearAllNotifications(ids: string[]): void {
  const clearedList = getStoredArray(CLEARED_KEY);
  const set = new Set([...clearedList, ...ids]);
  setStoredArray(CLEARED_KEY, Array.from(set));
  notifySync();
}

export function notifySync(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  }
}

export function subscribeToNotificationSync(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(SYNC_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(SYNC_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
