import { create } from 'zustand';

export const ADMIN_DEMO_EMAIL = 'admin1234@delivery.local';
export const ADMIN_DEMO_PASSWORD = 'Admin@1234';
export const CUSTOMER_DEMO_EMAIL = 'cliente@delivery.local';
export const CUSTOMER_DEMO_PASSWORD = 'Cliente@1234';

const ADMIN_EMAIL_ALIASES = new Set([
  ADMIN_DEMO_EMAIL,
  'admin@delivery.local',
  'administrador@delivery.local',
  'admin',
]);

export interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  userRole: 'admin' | 'client' | null;
  login: (email: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,16}$/;

function validateAccess(email: string, password: string): string | null {
  if (!emailPattern.test(email)) {
    return 'Informe um email válido.';
  }

  if (password.length > 16) {
    return 'A senha deve ter no máximo 16 caracteres.';
  }

  if (!passwordPattern.test(password)) {
    return 'A senha precisa ter de 8 a 16 caracteres, com letra maiúscula, número e caractere especial.';
  }

  return null;
}

function resolveRole(email: string, password: string): 'admin' | 'client' | null {
  const normalizedEmail = email.trim().toLowerCase();

  if (ADMIN_EMAIL_ALIASES.has(normalizedEmail) && password === ADMIN_DEMO_PASSWORD) {
    return 'admin';
  }

  // Demo fallback: emails contendo "admin" usam a senha administrativa padrão.
  if (normalizedEmail.includes('admin') && password === ADMIN_DEMO_PASSWORD) {
    return 'admin';
  }

  if (normalizedEmail === CUSTOMER_DEMO_EMAIL && password === CUSTOMER_DEMO_PASSWORD) {
    return 'client';
  }

  return null;
}

function validateCredentials(email: string, password: string): string | null {
  // If credentials already match a known role, skip generic format blockers.
  if (resolveRole(email, password)) {
    return null;
  }

  const accessError = validateAccess(email, password);
  if (accessError) {
    return accessError;
  }

  if (!resolveRole(email, password)) {
    return 'Credenciais inválidas.';
  }

  return null;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userEmail: null,
  userRole: null,
  login: (email: string, password: string) => {
    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();
    const validationError = validateCredentials(normalizedEmail, normalizedPassword);
    if (validationError) {
      return { success: false, message: validationError };
    }

    const resolvedRole = resolveRole(normalizedEmail, normalizedPassword);
    if (!resolvedRole) {
      return { success: false, message: 'Credenciais inválidas.' };
    }

    set({
      isAuthenticated: true,
      userEmail: normalizedEmail,
      userRole: resolvedRole,
    });

    return { success: true };
  },
  logout: () => set({ isAuthenticated: false, userEmail: null, userRole: null }),
}));
