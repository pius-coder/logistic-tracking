export interface AccountSession {
  id: string;
  expiresAt: string;
  lastUsedAt: string;
  createdAt: string;
  current: boolean;
}

export interface AccountSessionsData {
  sessions: AccountSession[];
}

export interface AccountSessionsParams {}
