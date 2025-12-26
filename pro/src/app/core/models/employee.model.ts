// Employee Models
export interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  address?: Address;
  department: string;
  designation: string;
  role: 'admin' | 'hr' | 'manager' | 'employee';
  joiningDate: Date;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  workLocation: 'Office' | 'Remote' | 'Hybrid';
  reportingManager?: string;
  salary?: SalaryInfo;
  bankDetails?: BankDetails;
  documents?: EmployeeDocument[];
  profilePicture?: string;
  emergencyContact?: EmergencyContact;
  skills?: string[];
  certifications?: Certification[];
  twoFactorEnabled: boolean;
  status: 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface SalaryInfo {
  amount: number;
  currency: string;
  paymentFrequency: 'Monthly' | 'Bi-weekly' | 'Weekly';
  effectiveDate: Date;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
}

export interface EmployeeDocument {
  documentType: string;
  documentName: string;
  documentUrl: string;
  uploadDate: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  department: string;
  designation: string;
  role: 'admin' | 'hr' | 'manager' | 'employee';
  joiningDate: Date;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  workLocation: 'Office' | 'Remote' | 'Hybrid';
  reportingManager?: string;
}

export interface UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
  designation?: string;
  role?: 'admin' | 'hr' | 'manager' | 'employee';
  reportingManager?: string;
  status?: 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
}
