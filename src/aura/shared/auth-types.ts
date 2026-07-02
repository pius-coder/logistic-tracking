export interface AuthUserSafe {
  id: string;
  username: string;
  displayName: string | null;
  businessName: string | null;
  email: string | null;
  isAdmin: boolean;
  countryId: string | null;
  currencyCode: string | null;
  onboardingCompleted: boolean;
}

export interface AuthSessionResult {
  user: AuthUserSafe;
}

export interface AuthSessionListItem {
  id: string;
  expiresAt: string;
  lastUsedAt: string;
  createdAt: string;
  current: boolean;
}

export interface AuthSessionListResult {
  sessions: AuthSessionListItem[];
}
