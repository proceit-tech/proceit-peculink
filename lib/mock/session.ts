"use client";

import type { UserRole } from "@/lib/mock/users";

export type MockSession = {
  name: string;
  company: string;
  email: string;
  role: UserRole;
};

const STORAGE_KEY = "peculink_mock_session";

export function setMockSession(session: MockSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getMockSession(): MockSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as MockSession;
  } catch {
    return null;
  }
}

export function clearMockSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}