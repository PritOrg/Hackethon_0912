import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LeaveApiService } from '../services/leave-api.service';
import { LeaveRequest } from '../core/models/leave.model';

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

  constructor(private leaveService: LeaveApiService) {}

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
    this.isLoading = true;
    this.leaveService.getAllLeaveRequests().subscribe({
      next: (response) => {
        this.leaveRequests = response.data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load leave requests', err);
        this.isLoading = false;
      }
    });
  }



  applyFilters() {
    let filtered = [...this.leaveRequests];
    
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(request => 
        this.getEmployeeName(request).toLowerCase().includes(searchTerm) ||
        this.getEmployeeDepartment(request).toLowerCase().includes(searchTerm) ||
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

  getEmployeeName(request: LeaveRequest): string {
    if (typeof request.employeeId === 'object' && request.employeeId !== null) {
      return `${request.employeeId.firstName} ${request.employeeId.lastName}`;
    }
    return 'Unknown Employee';
  }

  getEmployeeDepartment(request: LeaveRequest): string {
    if (typeof request.employeeId === 'object' && request.employeeId !== null) {
      return request.employeeId.department || 'N/A';
    }
    return 'N/A';
  }

  getEmployeeAvatar(request: LeaveRequest): string {
    const name = this.getEmployeeName(request);
    return `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`;
  }

  getEmployeeIdString(request: LeaveRequest): string {
    if (typeof request.employeeId === 'object' && request.employeeId !== null) {
      return request.employeeId.empCode || request.employeeId._id;
    }
    return request.employeeId as string;
  }

  getLatestComment(request: LeaveRequest): string {
    if (request.workflow && request.workflow.length > 0) {
      const lastEntry = request.workflow[request.workflow.length - 1];
      return lastEntry.comment || '';
    }
    return '';
  }

  getAcceptedDate(request: LeaveRequest): Date | undefined {
    if (request.workflow && request.workflow.length > 0) {
       const lastEntry = request.workflow[request.workflow.length - 1];
       if (lastEntry.status !== 'Pending') {
         return lastEntry.actionDate;
       }
    }
    return undefined;
  }

  openDrawer(request: LeaveRequest) {
    this.selectedRequest = request;
    this.approverComment.setValue(this.getLatestComment(request));
    this.isModalOpen = true;
  }

  closeDrawer() {
    this.isModalOpen = false;
    this.selectedRequest = null;
    this.approverComment.setValue('');
  }

  updateRequestStatus(status: 'Approved' | 'Rejected') {
    if (this.selectedRequest) {
      const updateData = {
        status,
        approverComment: this.approverComment.value || ''
      };

      this.leaveService.updateLeaveRequest(this.selectedRequest._id, updateData).subscribe({
        next: (response) => {
          // Update local state
          const index = this.leaveRequests.findIndex(r => r._id === this.selectedRequest!._id);
          if (index !== -1 && response.data) {
            this.leaveRequests[index] = response.data;
            this.applyFilters();
          }
          this.closeDrawer();
        },
        error: (err) => console.error('Failed to update request status', err)
      });
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