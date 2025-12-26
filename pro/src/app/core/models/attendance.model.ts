// Attendance Models
export interface Attendance {
  _id: string;
  employeeId: string;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: 'Present' | 'Absent' | 'Half Day' | 'On Leave' | 'Holiday' | 'Weekend';
  workingHours?: number;
  overtimeHours?: number;
  lateArrival: boolean;
  earlyDeparture: boolean;
  location?: AttendanceLocation;
  notes?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface CheckInDto {
  location?: AttendanceLocation;
  notes?: string;
}

export interface CheckOutDto {
  location?: AttendanceLocation;
  notes?: string;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  holidays: number;
  totalWorkingHours: number;
  averageWorkingHours: number;
  lateArrivals: number;
  earlyDepartures: number;
}

export interface AttendanceReport {
  employeeId: string;
  employeeName: string;
  department: string;
  month: number;
  year: number;
  stats: AttendanceStats;
  records: Attendance[];
}
