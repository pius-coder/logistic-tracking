export interface DashboardUser {
  isAdmin: boolean;
  displayName: string | null;
}

export interface DashboardData {
  user: DashboardUser;
}

export interface DashboardParams {}
