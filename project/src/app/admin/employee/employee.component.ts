import { Component } from '@angular/core';
import { ApiEmployeeService } from '../../api-employee.service';
import { EmployeeDetails } from '../../../module/Employee';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css'
})
export class EmployeeComponent {
  constructor(private _api: ApiEmployeeService){}
  
  employees!:any;

  ngOnInit(){
    this._api.getAllEmp().subscribe({
      next:(data:any)=>{
        console.log(data);
        this.employees = data;
      }
    })
  }

}
