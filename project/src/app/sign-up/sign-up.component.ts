import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiEmployeeService } from '../api-employee.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: '../app.component.css'
})
export class SignUpComponent {
  signupForm: FormGroup;
  showPassword = false;

  constructor(private router: Router, private fb: FormBuilder, private _api: ApiEmployeeService) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    }); 
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
  //   if (this.signupForm.valid) {
  //     const { username, email, password, confirmPassword } = this.signupForm.value;
  //     if (password === confirmPassword) {
  //       this._api.signup(username, email, password).subscribe(
  //         (response) => {
  //           Swal.fire({
  //             icon: 'success',
  //             title: 'Success',
  //             text: 'Your account has been created successfully!',
  //             position: 'top-end',
  //             showConfirmButton: false,
  //             timer: 3000
  //           });
  //           this.router.navigate(['/sign-in']);
  //         }
  //       );
  //     } else {
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Oops...',
  //         text: 'Passwords do not match!',
  //         timer: 3000
  //       });
  //     }
  //   } else {
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Oops...',
  //       text: 'Please fill in all fields correctly!',
  //       timer: 3000
  //     });
  //   }
  }
}
