import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../core/services/base-api.service';
import {
  LeaveRequest,
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  LeaveBalance,
  LeaveStats
} from '../core/models/leave.model';
import {
  ApiResponse,
  PaginatedResponse,
  QueryParams
} from '../core/models/api.model';

/**
 * Leave API Service - Handles all leave-related API calls
 */
@Injectable({
  providedIn: 'root'
})
export class LeaveApiService extends BaseApiService {
  private endpoint = '/leave-requests';
  private balanceEndpoint = '/leave-balance';

  /**
   * Get all leave requests with pagination
   */
  getAllLeaveRequests(params?: QueryParams): Observable<PaginatedResponse<LeaveRequest>> {
    return this.getPaginated<LeaveRequest>(this.endpoint, params);
  }

  /**
   * Get my leave requests
   */
  getMyLeaveRequests(params?: QueryParams): Observable<PaginatedResponse<LeaveRequest>> {
    return this.getPaginated<LeaveRequest>(`${this.endpoint}/my-requests`, params);
  }

  /**
   * Get leave request by ID
   */
  getLeaveRequestById(id: string): Observable<ApiResponse<LeaveRequest>> {
    return this.getWithResponse<LeaveRequest>(`${this.endpoint}/${id}`);
  }

  /**
   * Create leave request
   */
  createLeaveRequest(data: CreateLeaveRequestDto): Observable<ApiResponse<LeaveRequest>> {
    return this.postWithResponse<LeaveRequest>(this.endpoint, data);
  }

  /**
   * Update leave request status (approve/reject)
   */
  updateLeaveRequest(id: string, data: UpdateLeaveRequestDto): Observable<ApiResponse<LeaveRequest>> {
    return this.putWithResponse<LeaveRequest>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Cancel leave request
   */
  cancelLeaveRequest(id: string): Observable<ApiResponse<LeaveRequest>> {
    return this.putWithResponse<LeaveRequest>(`${this.endpoint}/${id}/cancel`, {});
  }

  /**
   * Get leave balance
   */
  getMyLeaveBalance(): Observable<ApiResponse<LeaveBalance>> {
    return this.getWithResponse<LeaveBalance>(`${this.balanceEndpoint}/me`);
  }

  /**
   * Get employee leave balance by ID
   */
  getEmployeeLeaveBalance(employeeId: string): Observable<ApiResponse<LeaveBalance>> {
    return this.getWithResponse<LeaveBalance>(`${this.balanceEndpoint}/${employeeId}`);
  }

  /**
   * Get leave statistics
   */
  getLeaveStats(): Observable<ApiResponse<LeaveStats>> {
    return this.getWithResponse<LeaveStats>(`${this.endpoint}/stats`);
  }

  /**
   * Get pending leave requests (for managers/HR)
   */
  getPendingLeaveRequests(params?: QueryParams): Observable<PaginatedResponse<LeaveRequest>> {
    return this.getPaginated<LeaveRequest>(`${this.endpoint}/pending`, params);
  }
}
