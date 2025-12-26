// Company Models
export interface Company {
  _id: string;
  companyName: string;
  companyEmail: string;
  industryType: string;
  companySize: string;
  phoneNumber?: string;
  address?: CompanyAddress;
  logo?: string;
  website?: string;
  subscription: SubscriptionInfo;
  settings: CompanySettings;
  billingInfo?: BillingInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface SubscriptionInfo {
  plan: 'Trial' | 'Basic' | 'Professional' | 'Enterprise';
  status: 'Active' | 'Expired' | 'Cancelled';
  startDate: Date;
  endDate: Date;
  maxEmployees: number;
  features: string[];
}

export interface CompanySettings {
  workingHours: WorkingHours;
  leavePolicy: LeavePolicy;
  attendanceSettings: AttendanceSettings;
  payrollSettings?: PayrollSettings;
  notificationSettings: NotificationSettings;
}

export interface WorkingHours {
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  workingDays: string[]; // ["Monday", "Tuesday", ...]
  timezone: string;
}

export interface LeavePolicy {
  annualLeaveBalance: number;
  sickLeaveBalance: number;
  casualLeaveBalance: number;
  carryForwardAllowed: boolean;
  maxCarryForwardDays: number;
}

export interface AttendanceSettings {
  lateArrivalThreshold: number; // minutes
  earlyDepartureThreshold: number; // minutes
  halfDayHours: number;
  fullDayHours: number;
  overtimeEnabled: boolean;
  weekendOvertimeMultiplier: number;
}

export interface PayrollSettings {
  payrollCycle: 'Monthly' | 'Bi-weekly' | 'Weekly';
  payrollDay: number;
  currency: string;
  taxSettings?: any;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  leaveRequestNotifications: boolean;
  attendanceAlerts: boolean;
  payrollNotifications: boolean;
}

export interface BillingInfo {
  billingEmail: string;
  billingAddress?: CompanyAddress;
  paymentMethod?: PaymentMethod;
  invoices?: Invoice[];
}

export interface PaymentMethod {
  type: 'Credit Card' | 'Bank Transfer' | 'PayPal';
  last4Digits?: string;
  expiryDate?: string;
}

export interface Invoice {
  invoiceNumber: string;
  invoiceDate: Date;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate: Date;
  pdfUrl?: string;
}

export interface UpdateCompanySettingsDto {
  workingHours?: Partial<WorkingHours>;
  leavePolicy?: Partial<LeavePolicy>;
  attendanceSettings?: Partial<AttendanceSettings>;
  payrollSettings?: Partial<PayrollSettings>;
  notificationSettings?: Partial<NotificationSettings>;
}

export interface UpgradeSubscriptionDto {
  plan: 'Basic' | 'Professional' | 'Enterprise';
  billingCycle: 'Monthly' | 'Yearly';
}
