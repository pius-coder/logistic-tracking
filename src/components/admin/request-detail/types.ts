export interface AdminRequestUser {
  id: string;
  displayName: string | null;
}

export interface AdminRequestProduct {
  name: string;
  images: { url: string }[];
}

export interface AdminRequestCountry {
  id?: string;
  name: string;
}

export interface AdminRequestPayment {
  id: string;
  amountPaid: number;
  currencyCode: string;
  status: string;
  stage: string;
  createdAt: string;
  screenshotUrl: string;
  reviewNote: string | null;
  paymentMethod: { id: string; name: string; type: string };
}

export interface AdminRequestStatusEvent {
  id: string;
  status: string;
  title: string;
  message: string;
  createdAt: string;
  createdByLabel: string | null;
}

export interface AdminRequestTrajectoryStep {
  id: string;
  locationName: string;
  stepType: string;
  sequence: number;
  reachedAt: string | null;
  country: { id: string; name: string } | null;
  latitude: number | null;
  longitude: number | null;
  timerDurationHours: number | null;
  timerStartedAt: string | null;
  timerEndsAt: string | null;
  isTimerPaused: boolean;
  pausedRemainingMinutes: number | null;
  note: string | null;
}

export interface AdminRequestNotification {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  isRead: boolean;
}

export interface AdminRequestDetail {
  id: string;
  requestNumber: string;
  status: string;
  problemType: string | null;
  type: string;
  createdAt: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  city: string | null;
  region: string | null;
  quantity: number;
  transportMode: string;
  totalCostUsd: number;
  customerNotes: string | null;
  latestStatusMessage: string | null;
  whatsappDiscussionLink: string | null;
  adminNotes: string | null;
  needsRectification: boolean;
  productNameSnapshot: string;
  customProductName: string | null;
  customProductDesc: string | null;
  customWeight: number | null;
  customVolume: number | null;
  user: AdminRequestUser;
  product: AdminRequestProduct | null;
  originCountry: AdminRequestCountry | null;
  destinationCountry: AdminRequestCountry;
  originCountryId: string | null;
  destinationCountryId: string;
  trajectorySteps: AdminRequestTrajectoryStep[];
  statusEvents: AdminRequestStatusEvent[];
  payments: AdminRequestPayment[];
  jcNotifications: AdminRequestNotification[];
  allowedPaymentMethods: Array<{ id: string; name: string; type: string }>;
  termsCurrencyCode: string | null;
  termsTotalAmount: number | null;
  termsDepositAmount: number | null;
  termsInstructions: string | null;
  termsDefinedAt: string | null;
}

export interface AdminRequestCountryOption {
  id: string;
  name: string;
  iso2: string | null;
  latitude: number | null;
  longitude: number | null;
}
