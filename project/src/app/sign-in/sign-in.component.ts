import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiEmployeeService } from '../api-employee.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['../app.component.css']  // Use 'styleUrls' instead of 'styleUrl'
})
export class SignInComponent implements OnInit {  // Implement OnInit

  showPassword = false;

  // Use FormBuilder for a cleaner form setup
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [true]
  });

  constructor(private _router: Router, private fb: FormBuilder, private _api: ApiEmployeeService) { }

  ngOnInit() { }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      // If the form is valid, call the authentication service
      const { email, password, rememberMe } = this.loginForm.value;

      this._api.login(email, password).subscribe(
        (response: any) => {
          this._router.navigate(['/']);
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Login Successfully",
            showConfirmButton: false,
            timer: 1500
          });
          // Handle successful login
        },
        (error) => {
          console.error('Login failed', error);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong!",
            footer: 'PLEASE TRY AGAIN'
          });
          // Handle failed login (show error message, etc.)
        }
      );
    }
  }
}
