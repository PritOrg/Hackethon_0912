// Shift & Roster Models
export interface Shift {
  _id: string;
  shiftCode: string;
  shiftName: string;
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  workingDays: string[]; // ["Monday", "Tuesday", ...]
  breakDuration: number; // minutes
  graceArrivalTime: number; // minutes
  graceDepartureTime: number; // minutes
  isDefault: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Roster {
  _id: string;
  employeeId: string;
  shiftId: string;
  startDate: Date;
  endDate?: Date;
  isRecurring: boolean;
  recurringPattern?: 'Daily' | 'Weekly' | 'Monthly';
  notes?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShiftSwapRequest {
  _id: string;
  requesterId: string;
  targetEmployeeId: string;
  requesterShiftDate: Date;
  targetShiftDate: Date;
  reason: string;
  status: 'Pending' | 'Approved by Target' | 'Approved by Manager' | 'Rejected' | 'Cancelled';
  approvedBy?: string;
  approvalDate?: Date;
  rejectionReason?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateShiftDto {
  shiftName: string;
  startTime: string;
  endTime: string;
  workingDays: string[];
  breakDuration: number;
  graceArrivalTime?: number;
  graceDepartureTime?: number;
  isDefault?: boolean;
}

export interface AssignShiftDto {
  employeeId: string;
  shiftId: string;
  startDate: Date;
  endDate?: Date;
  isRecurring: boolean;
  recurringPattern?: 'Daily' | 'Weekly' | 'Monthly';
  notes?: string;
}

export interface ShiftSwapRequestDto {
  targetEmployeeId: string;
  requesterShiftDate: Date;
  targetShiftDate: Date;
  reason: string;
}
