import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiEmployeeService {
  apiUrl = 'http://localhost:1969'

  constructor(private _http: HttpClient) { }

  getAllEmp() {
    return this._http.get(this.apiUrl);
  }

  login(email: string, password: string) {
    const body = { email, password };
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    }
    return this._http.post(`${this.apiUrl}/login`, body,options);
  }

  signup(username: string, email: string, password: string,) {
    const createdAt = new Date().toISOString();
    const body = {username, email, password, createdAt} ;
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    }
    return this._http.post(`${this.apiUrl}`, body, options);
  }
}
