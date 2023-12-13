import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiEmployeeService } from '../api-employee.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: '../app.component.css'
})
export class SignUpComponent {
  signupForm: FormGroup;
  
  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  constructor(private router: Router, private fb: FormBuilder, private _api: ApiEmployeeService) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      // Add other form controls based on the Node.js employee schema
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const { username, email, password } = this.signupForm.value;
      this._api.signup(username, email, password).subscribe(
        (response) => {
          this.router.navigate(['/sign-in']);
          // Handle successful response here
        }
      );
    }
    else {
      console.error('Invalid');
    }
  }
}
