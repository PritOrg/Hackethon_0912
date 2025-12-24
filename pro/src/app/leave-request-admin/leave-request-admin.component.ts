import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface LeaveRequest {
  _id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  employeeDepartment: string;
  startDate: Date;
  endDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
  leaveType: 'Half Day' | 'Full Day' | 'Sick Leave' | 'Casual Leave' | 'Maternity Leave' | 'Annual Leave' | 'Privilege Leave';
  approverId?: string;
  approverComment?: string;
  acceptedDate?: Date;
  createdAt: Date;
}

@Component({
  selector: 'app-leave-request-admin',
  standalone: false,
  templateUrl: './leave-request-admin.component.html',
  styleUrls: ['./leave-request-admin.component.scss']
})
export class LeaveRequestAdminComponent implements OnInit {
  leaveRequests: LeaveRequest[] = [];
  filteredLeaveRequests: LeaveRequest[] = [];
  searchControl = new FormControl('');
  statusFilter = new FormControl('All');
  leaveTypeFilter = new FormControl('All');
  dateRangeFilter = new FormControl('All');
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  selectedRequest: LeaveRequest | null = null;
  approverComment = new FormControl('');
  isLoading = true;
  isModalOpen = false;

  leaveTypeOptions = [
    'All',
    'Half Day',
    'Full Day',
    'Sick Leave',
    'Casual Leave',
    'Maternity Leave',
    'Annual Leave',
    'Privilege Leave'
  ];

  statusOptions = ['All', 'Pending', 'Approved', 'Rejected'];
  dateRangeOptions = ['All', 'Today', 'This Week', 'This Month', 'Last Month'];

  constructor() {}

  ngOnInit(): void {
    this.loadLeaveRequests();
    
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(value => {
        this.applyFilters();
      });

    this.statusFilter.valueChanges.subscribe(() => this.applyFilters());
    this.leaveTypeFilter.valueChanges.subscribe(() => this.applyFilters());
    this.dateRangeFilter.valueChanges.subscribe(() => this.applyFilters());
  }

  loadLeaveRequests() {
    // Simulate API call with dummy data
    setTimeout(() => {
      this.leaveRequests = this.generateDummyData();
      this.applyFilters();
      this.isLoading = false;
    }, 1000);
  }

  generateDummyData(): LeaveRequest[] {
    const departments = ['Engineering', 'Marketing', 'HR', 'Sales', 'Finance', 'Product'];
    const names = [
      'John Smith', 'Mary Johnson', 'Robert Williams', 'Patricia Brown', 'Michael Jones',
      'Linda Davis', 'James Miller', 'Elizabeth Wilson', 'David Moore', 'Jennifer Taylor',
      'Richard Anderson', 'Susan Thomas', 'Joseph Jackson', 'Margaret White', 'Charles Harris'
    ];
    
    const leaveTypes: Array<LeaveRequest['leaveType']> = [
      'Half Day', 'Full Day', 'Sick Leave', 'Casual Leave', 'Maternity Leave', 'Annual Leave', 'Privilege Leave'
    ];
    
    const statuses: Array<LeaveRequest['status']> = ['Pending', 'Approved', 'Rejected'];
    
    const reasons = [
      'Personal emergency', 'Medical appointment', 'Family event', 'Doctor\'s appointment', 
      'Family vacation', 'Home repairs', 'Child\'s school event', 'Feeling unwell',
      'Dentist appointment', 'Moving houses', 'Wedding preparations', 'Court appearance'
    ];

    return Array(30).fill(null).map((_, index) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30) - 15);
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 5));
      
      const createdAt = new Date(startDate);
      createdAt.setDate(startDate.getDate() - Math.floor(Math.random() * 10) - 1);
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const acceptedDate = status !== 'Pending' ? new Date() : undefined;
      const approverComment = status !== 'Pending' ? 
        status === 'Approved' ? 'Approved as requested' : 'Request conflicts with department schedule' : 
        undefined;

      const employeeName = names[Math.floor(Math.random() * names.length)];
      const firstName = employeeName.split(' ')[0];
      const lastName = employeeName.split(' ')[1];
      
      return {
        _id: `req${index + 1000}`,
        employeeId: `emp${index + 100}`,
        employeeName: employeeName,
        employeeAvatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
        employeeDepartment: departments[Math.floor(Math.random() * departments.length)],
        startDate,
        endDate,
        status,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        leaveType: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
        approverId: status !== 'Pending' ? 'admin123' : undefined,
        approverComment,
        acceptedDate,
        createdAt
      };
    });
  }

  applyFilters() {
    let filtered = [...this.leaveRequests];
    
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.employeeName.toLowerCase().includes(searchTerm) ||
        request.employeeDepartment.toLowerCase().includes(searchTerm) ||
        request.reason.toLowerCase().includes(searchTerm) ||
        request._id.toLowerCase().includes(searchTerm)
      );
    }
    
    const statusFilter = this.statusFilter.value;
    if (statusFilter && statusFilter !== 'All') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }
    
    const leaveTypeFilter = this.leaveTypeFilter.value;
    if (leaveTypeFilter && leaveTypeFilter !== 'All') {
      filtered = filtered.filter(request => request.leaveType === leaveTypeFilter);
    }
    
    const dateRangeFilter = this.dateRangeFilter.value;
    if (dateRangeFilter && dateRangeFilter !== 'All') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      
      switch (dateRangeFilter) {
        case 'Today':
          filtered = filtered.filter(request => {
            const requestDate = new Date(request.startDate);
            requestDate.setHours(0, 0, 0, 0);
            return requestDate.getTime() === today.getTime();
          });
          break;
        case 'This Week':
          filtered = filtered.filter(request => {
            const requestDate = new Date(request.startDate);
            return requestDate >= startOfWeek && requestDate <= today;
          });
          break;
        case 'This Month':
          filtered = filtered.filter(request => {
            const requestDate = new Date(request.startDate);
            return requestDate >= startOfMonth && requestDate <= today;
          });
          break;
        case 'Last Month':
          filtered = filtered.filter(request => {
            const requestDate = new Date(request.startDate);
            return requestDate >= startOfLastMonth && requestDate <= endOfLastMonth;
          });
          break;
      }
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    this.filteredLeaveRequests = filtered;
    this.totalPages = Math.ceil(this.filteredLeaveRequests.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  openModal(request: LeaveRequest) {
    this.selectedRequest = request;
    this.approverComment.setValue(request.approverComment || '');
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedRequest = null;
    this.approverComment.setValue('');
  }

  updateRequestStatus(status: 'Approved' | 'Rejected') {
    if (this.selectedRequest) {
      // In a real app, you would make an API call here
      const index = this.leaveRequests.findIndex(r => r._id === this.selectedRequest!._id);
      if (index !== -1) {
        this.leaveRequests[index] = {
          ...this.leaveRequests[index],
          status,
          approverComment: this.approverComment.value || '',
          approverId: 'admin123', // In a real app, this would be the actual admin's ID
          acceptedDate: new Date()
        };
        
        // Update filtered list too
        this.applyFilters();
        
        // Show toast notification (you would implement this using a proper notification service)
        console.log(`Leave request ${status.toLowerCase()} successfully`);
        
        this.closeModal();
      }
    }
  }

  resetFilters() {
    this.searchControl.setValue('');
    this.statusFilter.setValue('All');
    this.leaveTypeFilter.setValue('All');
    this.dateRangeFilter.setValue('All');
  }

  get paginatedLeaveRequests(): LeaveRequest[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredLeaveRequests.slice(startIndex, startIndex + this.itemsPerPage);
  }

  calculateDuration(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  }

  getStatusDotColor(status: string): string {
    switch (status) {
      case 'Approved':
        return 'text-green-500';
      case 'Rejected':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  }

  getLeaveTypeColor(leaveType: string): string {
    switch (leaveType) {
      case 'Sick Leave':
        return 'bg-red-100 text-red-800';
      case 'Casual Leave':
        return 'bg-blue-100 text-blue-800';
      case 'Maternity Leave':
        return 'bg-pink-100 text-pink-800';
      case 'Annual Leave':
        return 'bg-purple-100 text-purple-800';
      case 'Privilege Leave':
        return 'bg-indigo-100 text-indigo-800';
      case 'Half Day':
        return 'bg-teal-100 text-teal-800';
      case 'Full Day':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}