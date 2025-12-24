import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = environment.apiUrl.replace('/api', '');
  
  constructor(private _http: HttpClient) { }



  clockIn(employeeId:String,companyId:String): Observable<Attendance> {
    return this._http.post<Attendance>(`${this.apiUrl}/api/attendance/clock-in`, { employeeId , companyId });
  }
  clockOut(employeeId:String): Observable<Attendance> {
    return this._http.post<Attendance>(`${this.apiUrl}/api/attendance/clock-out`, { employeeId, });
  }
}

export interface Attendance {
  employeeId: string;
  companyId: string;
  clockIn: Date;
  clockOut?: Date;
  totalHours?: number;
  overtime?: number;
  status: string;
}