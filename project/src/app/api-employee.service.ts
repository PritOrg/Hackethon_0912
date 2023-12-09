import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiEmployeeService {

  constructor(private _http:HttpClient) { }

  apiUrl='https://096b-103-70-32-90.ngrok.io/'

  getAllEmp(){
    return this._http.get(this.apiUrl+'/employee')
  }
}
