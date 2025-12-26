// Leave Request Models
export interface LeaveRequest {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    empCode: string;
    email: string;
    department: string;
    position?: string;
  } | string;
  leaveType: 'Annual' | 'Sick' | 'Casual' | 'Maternity' | 'Paternity' | 'Unpaid';
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  appliedDate: Date;
  approvedBy?: string;
  approvalDate?: Date;
  rejectionReason?: string;
  attachments?: string[];
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  workflow?: {
    approverId: string | any;
    approverName?: string;
    status: string;
    comment?: string;
    actionDate: Date;
  }[];
}

export interface CreateLeaveRequestDto {
  leaveType: 'Annual' | 'Sick' | 'Casual' | 'Maternity' | 'Paternity' | 'Unpaid';
  startDate: Date;
  endDate: Date;
  reason: string;
  attachments?: string[];
}

export interface UpdateLeaveRequestDto {
  status?: 'Approved' | 'Rejected' | 'Cancelled';
  rejectionReason?: string;
}

export interface LeaveBalance {
  _id: string;
  employeeId: string;
  annual: number;
  sick: number;
  casual: number;
  maternity: number;
  paternity: number;
  unpaid: number;
  year: number;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveStats {
  totalLeaves: number;
  approvedLeaves: number;
  pendingLeaves: number;
  rejectedLeaves: number;
  balance: LeaveBalance;
}
