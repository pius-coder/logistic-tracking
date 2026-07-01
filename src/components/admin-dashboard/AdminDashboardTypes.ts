export interface AdminDashboardStats {
  totalRequests: number;
  pendingRequests: number;
  activeRequests: number;
  completedRequests: number;
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalCountries: number;
  monthlyRevenue: number;
  lastMonthRevenue: number;
}

export interface AdminDashboardRecentPayment {
  id: string;
  amountPaid: number;
  currencyCode: string;
  requestNumber: string | null;
  userName: string | null;
  paymentMethodName: string | null;
  createdAt: string;
}

export interface AdminDashboardRecentRequest {
  id: string;
  requestNumber: string;
  status: string;
  userName: string | null;
  productName: string | null;
  destination: string | null;
  createdAt: string;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  recentPayments: AdminDashboardRecentPayment[];
  recentRequests: AdminDashboardRecentRequest[];
}

export interface AdminDashboardParams {}
