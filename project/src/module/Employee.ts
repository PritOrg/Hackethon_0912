import { AnyCatcher } from "rxjs/internal/AnyCatcher";

class LeaveRequest {
    // Define the structure of the LeaveRequest object
    // You can add more properties based on your schema
    _id!: string;
    startDate!: string;
    endDate!: string;
    status!: string;
    reason!: string;
    createdAt!: Date;
  }
  
  class LeaveBalance {
    // Define the structure of the LeaveBalance object
    // You can add more properties based on your schema
    // For example: vacationBalance: number;
  }
  
  export class EmployeeDetails {
    // Define the structure of the EmployeeDetails object
    employeeId!: string;
    employeeName: string;
    email: string;
    password: string;
    role: string;
    leaveRequests: LeaveRequest[];
    leaveBalance: LeaveBalance;
    employeeRole!: string;
  
    // You can add more properties based on your schema
  
    constructor(data: any) {
      // Initialize the properties based on the provided data
      this.employeeId = data.employeeId;
      this.employeeRole = data.employeeRole
      this.employeeName = data.employeeName;
      this.email = data.email;
      this.password = data.password;
      this.role = data.role;
      this.leaveRequests = data.leaveRequests;
      this.leaveBalance = data.leaveBalance;
      // You can add more properties initialization based on your schema
    }

  }
  