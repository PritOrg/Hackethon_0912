import { Component } from '@angular/core';
import { ApiEmployeeService } from '../api-employee.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  constructor(private _api: ApiEmployeeService) { }

  employee: Employee[] = []
  
}

class Employee{
  _id: String;
  userId: String;
  message: String;
  isRead: Boolean;
  constructor(){
    this._id= '0';
    this.userId= '';
    this.message= '';
    this.isRead= true;
  }
}
