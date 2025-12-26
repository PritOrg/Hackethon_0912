import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../core/services/base-api.service';
import {
  Shift,
  Roster,
  CreateShiftDto,
  AssignShiftDto,
  ShiftSwapRequest,
  ShiftSwapRequestDto
} from '../core/models/shift.model';
import {
  ApiResponse,
  PaginatedResponse,
  QueryParams
} from '../core/models/api.model';

/**
 * Shift API Service - Handles shift and roster management
 */
@Injectable({
  providedIn: 'root'
})
export class ShiftApiService extends BaseApiService {
  private endpoint = '/shifts';
  private rosterEndpoint = '/rosters';

  /**
   * Get all shifts
   */
  getAllShifts(params?: QueryParams): Observable<PaginatedResponse<Shift>> {
    return this.getPaginated<Shift>(this.endpoint, params);
  }

  /**
   * Get shift by ID
   */
  getShiftById(id: string): Observable<ApiResponse<Shift>> {
    return this.getWithResponse<Shift>(`${this.endpoint}/${id}`);
  }

  /**
   * Create shift
   */
  createShift(data: CreateShiftDto): Observable<ApiResponse<Shift>> {
    return this.postWithResponse<Shift>(this.endpoint, data);
  }

  /**
   * Update shift
   */
  updateShift(id: string, data: Partial<CreateShiftDto>): Observable<ApiResponse<Shift>> {
    return this.putWithResponse<Shift>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Delete shift
   */
  deleteShift(id: string): Observable<ApiResponse<void>> {
    return this.deleteWithResponse<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Assign shift to employee
   */
  assignShift(data: AssignShiftDto): Observable<ApiResponse<Roster>> {
    return this.postWithResponse<Roster>(`${this.endpoint}/assign`, data);
  }

  /**
   * Get employee roster
   */
  getEmployeeRoster(employeeId?: string, params?: QueryParams): Observable<PaginatedResponse<Roster>> {
    const endpoint = employeeId 
      ? `${this.rosterEndpoint}/${employeeId}` 
      : `${this.rosterEndpoint}/me`;
    return this.getPaginated<Roster>(endpoint, params);
  }

  /**
   * Get team roster (for managers)
   */
  getTeamRoster(params?: QueryParams): Observable<ApiResponse<any>> {
    return this.getWithResponse<any>(`${this.rosterEndpoint}/team`, params);
  }

  /**
   * Request shift swap
   */
  requestShiftSwap(data: ShiftSwapRequestDto): Observable<ApiResponse<ShiftSwapRequest>> {
    return this.postWithResponse<ShiftSwapRequest>(`${this.endpoint}/swap-request`, data);
  }

  /**
   * Get my shift swap requests
   */
  getMyShiftSwapRequests(params?: QueryParams): Observable<PaginatedResponse<ShiftSwapRequest>> {
    return this.getPaginated<ShiftSwapRequest>(`${this.endpoint}/swap-requests/me`, params);
  }

  /**
   * Approve shift swap
   */
  approveShiftSwap(requestId: string): Observable<ApiResponse<ShiftSwapRequest>> {
    return this.putWithResponse<ShiftSwapRequest>(`${this.endpoint}/swap-request/${requestId}/approve`, {});
  }

  /**
   * Reject shift swap
   */
  rejectShiftSwap(requestId: string, reason: string): Observable<ApiResponse<ShiftSwapRequest>> {
    return this.putWithResponse<ShiftSwapRequest>(
      `${this.endpoint}/swap-request/${requestId}/reject`,
      { rejectionReason: reason }
    );
  }
}
