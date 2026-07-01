export interface AdminRequestListItem {
  id: string;
  requestNumber: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    displayName: string | null;
    phoneIdentities: { phoneE164: string }[];
  };
  product: { name: string } | null;
  destinationCountry: { name: string };
}

export interface AdminRequestListData {
  requests: AdminRequestListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminRequestListParams {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}
