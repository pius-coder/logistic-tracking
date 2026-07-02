export interface AdminClientsCountry {
  name: string;
  iso2: string;
}

export interface AdminClientsUser {
  id: string;
  displayName: string | null;
  businessName: string | null;
  isAdmin: boolean;
  isBlocked: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  country: AdminClientsCountry | null;
  _count: { requests: number };
}

export interface AdminClientsData {
  users: AdminClientsUser[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminClientsParams {
  page: number;
  limit: number;
  search?: string;
}
