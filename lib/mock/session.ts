"use client";

import type { UserRole } from "@/lib/mock/users";

export type MockSession = {
  id?: string;
  name: string;
  company: string;
  email: string;
  role: UserRole;

  tenantId?: string;
  permissions?: string[];
};

const STORAGE_KEY = "peculink_mock_session";

export function setMockSession(session: MockSession) {
  if (typeof window === "undefined") return;

  const payload: Required<Pick<MockSession, "id">> & Omit<MockSession, "id"> = {
    ...session,
    id: session.id ?? crypto.randomUUID(),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function getMockSession(): MockSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as MockSession;

    return {
      ...parsed,
      id: parsed.id ?? "mock-user",
    };
  } catch {
    return null;
  }
}

export function clearMockSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function switchMockRole(role: UserRole) {
  const current = getMockSession();
  if (!current) return;

  setMockSession({
    ...current,
    role,
  });
}