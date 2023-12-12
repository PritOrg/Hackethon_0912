import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiEmployeeService {
  apiUrl='http://localhost:1969'

  constructor(private _http:HttpClient) { }

  getAllEmp(){
    return this._http.get(this.apiUrl);
  }

  login(username: string, password: string){
    const body = { username, password };
    return this._http.post(`${this.apiUrl}/login`, body);
  }
}
