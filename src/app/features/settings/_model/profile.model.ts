export interface ProfileModel {
  user_id?: string;
  full_name?: string;
  first_name?: string;      // Derived if needed
  last_name?: string;       // Derived if needed
  gender?: 'Male' | 'Female' | 'Other';
  email?: string;
  phone?: string;
  profileImage?: string;    // full URL or media path

  // Optional Address Info
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;

  // Role/Permissions (future admin dashboard etc.)
  role?: 'user' | 'admin' | string;

  // Preferences (if you ever support notifications, language etc.)
  preferences?: {
    newsletter?: boolean;
    smsAlerts?: boolean;
    preferredLanguage?: string;
  };

  // Meta
  createdAt?: string;
  updatedAt?: string;

  // Cart-related (from backend if included in user object)
  cart_id?: number;

  // Status flags
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isActive?: boolean;
}
