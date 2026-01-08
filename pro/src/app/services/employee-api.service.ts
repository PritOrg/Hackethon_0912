import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface Employee {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  department: string;
  position: string;
  jobShift: 'Morning' | 'Evening' | 'Night';
  profilePic?: string;
  salary: Map<string, number>;
  joiningDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeApiService {
  private _api = `${environment.apiUrl}/employee`;
  
  constructor(private _http: HttpClient) { }
  
  getEmployees(params?: any): Observable<Employee[]> {
    return this._http.get<Employee[]>(`${this._api}`, { params });
  }

  getEmployeeById(id: string): Observable<any> {
    return this._http.get<any>(`${this._api}/${id}`);
  }

  createEmployee(employeeData: any): Observable<any> {
    return this._http.post<any>(this._api, employeeData);
  }

  updateEmployee(id: string, employeeData: any): Observable<any> {
    return this._http.put<any>(`${this._api}/${id}`, employeeData);
  }

  deleteEmployee(id: string): Observable<any> {
    return this._http.delete<any>(`${this._api}/${id}`);
  }

  restoreEmployee(id: string): Observable<any> {
    return this._http.post<any>(`${this._api}/${id}/restore`, {});
  }
}
