import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { EmployeeDetails } from '../module/Employee';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiEmployeeService {
  getEmployeeDetails(): EmployeeDetails | null {
    return this.employeeDetails;
  }

  apiUrl = 'http://localhost:1969'

  private token: string | null = null;

  private employeeDetails: EmployeeDetails | null = null;

  constructor(private _http: HttpClient, private _auth: AuthService) { }
  getAllEmp() {
    const headers = this.getHeaders();
    return this._http.get(this.apiUrl, { headers });
  }

  makeRequest(startDate: number, endDate: number, id: string, reason: string, leaveType: string) {
    const createdAt = new Date().toUTCString();
    const body = { startDate, endDate, createdAt, reason, leaveType };

    return this._http.post("${this.apiUrl}+/leave-requests/${id}/apply-leave"
      , body, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  login(email: string, password: string) {
    const body = { email, password };
    this._auth.login(body);
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    return this._http.post(`${this.apiUrl}/login`, body, options).pipe(
      tap((response: any) => {
        // Assuming the response includes additional employee details
        const { employeeId, employee} = response;

        // Store the token and additional employee details
        this.token = {...employee, employeeId};
        console.log(this.token);
        this.employeeDetails = new EmployeeDetails(employee);
      })
    );
  }

  signup(username: string, email: string, password: string,) {
    const createdAt = new Date().toISOString();
    const body = { username, email, password, createdAt };
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    }
    return this._http.post(`${this.apiUrl}`, body, options);
  }

  logout() {
    this._auth.logout();
  }

  private getHeaders() {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }
}
