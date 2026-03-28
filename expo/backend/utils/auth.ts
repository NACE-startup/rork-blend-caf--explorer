import { db } from "../db/store";

export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function hashPassword(password: string): string {
  return `$2a$10$mock${password}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  return hash === `$2a$10$mock${password}`;
}

export function createSession(userId: string): { token: string; expiresAt: string } {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  db.sessions.set(token, {
    id: `session-${Date.now()}`,
    user_id: userId,
    token,
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  });

  return { token, expiresAt };
}

export function validateSession(token: string): string | null {
  const session = db.findSessionByToken(token);
  
  if (!session) {
    return null;
  }

  if (new Date(session.expires_at) < new Date()) {
    db.sessions.delete(token);
    return null;
  }

  return session.user_id;
}

export function deleteSession(token: string): void {
  db.sessions.delete(token);
}
