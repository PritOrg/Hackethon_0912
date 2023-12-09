import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { ApiEmployeeService } from '../api-employee.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {
  constructor(private _router:Router,private fb:FormBuilder, private _api:ApiEmployeeService){

  }

  new:Employee = new Employee()
  employee: Employee[] = [this.new]
  
  loginForm : FormGroup = new FormGroup({
    email: new FormControl(''),
    password : new FormControl('')
  });

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [true]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      // If the form is valid, call the authentication service
      const { email, password } = this.loginForm.value;
      this._api.login(email, password).subscribe(
        (response:any) => {
          console.log(response);
          this._router.navigate(['/'])
          // Handle successful login
        }
      );
    }
  }
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