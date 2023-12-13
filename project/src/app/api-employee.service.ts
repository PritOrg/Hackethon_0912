import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiEmployeeService {
  apiUrl = 'http://localhost:1969'

  constructor(private _http: HttpClient, private _auth:AuthService ) { }
  getAllEmp() {
    const headers = this.getHeaders();
    return this._http.get(this.apiUrl, { headers });
  }

  login(email: string, password: string) {
    const body = { email, password };
    this._auth.login(body);
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    return this._http.post(`${this.apiUrl}/login`, body, options);
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
