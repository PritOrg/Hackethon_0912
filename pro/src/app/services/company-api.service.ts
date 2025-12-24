import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

interface Company {
    basicInfo: {
      name: String,
      type: String,
      industry: String,
      registrationNumber: String,
      establishedDate:String
    },
    contactInfo: {
      phone: String,
      email: String,
      website: String
    },
    addressInfo: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    } 
}

@Injectable({
  providedIn: 'root'
})
export class CompanyApiService {

  private _api = `${environment.apiUrl}/`;
  
  constructor(private _http: HttpClient) { }
  getCompanies() {
    return this._http.get(`${this._api}api/company`);
  }
  signIn(data: { email: string, password: string }) {
    return this._http.post(`${this._api}api/company/auth/login`, data);
  }
  signUp(data: Company) {
    return this._http.post(`${this._api}api/company`, data);
  }
}
