// Authentication Models
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCompanyDto {
  companyName: string;
  companyType?: string;
  industry: string;
  registrationNumber?: string;
  taxId?: string;
  website?: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  adminUser: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  };
  subscriptionPlan: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  employee?: any; // For registration response
  company?: any; // For registration response
  requires2FA?: boolean;
  expiresIn?: number;
  status?: string;
  message?: string;
  data?: {
    user?: any;
    employee?: any;
    company?: any;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface TokenPayload {
  userId: string;
  companyId: string;
  role: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  status?: string;
  data?: {
    accessToken: string;
    expiresIn: number;
  };
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface TwoFactorSetupResponse {
  status: string;
  data: {
    qrCode: string; // Base64 QR code image
    secret: string;
    manualEntryKey: string;
  };
}

export interface TwoFactorVerifyDto {
  token: string;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  companyId: string;
  profilePicture?: string;
  phoneNumber?: string;
  twoFactorEnabled: boolean;
}
