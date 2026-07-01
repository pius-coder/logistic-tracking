export interface CompteUser {
  id: string;
  phoneE164: string;
  phoneVerifiedAt: string | null;
  displayName: string | null;
  businessName: string | null;
  email: string | null;
  isAdmin: boolean;
  countryId: string | null;
  currencyCode: string | null;
  onboardingCompleted: boolean;
}

export interface CompteData {
  user: CompteUser;
}

export interface CompteParams {}
