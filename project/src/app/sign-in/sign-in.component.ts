import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {
  constructor(private _router:Router){

  }
  errmsg = "";
  loginForm : FormGroup = new FormGroup({
    email: new FormControl(''),
    password : new FormControl('')
  });

  login(){
    if (this.loginForm.value.email == "bhargav" && this.loginForm.value.password=="bhagiya"){
      localStorage.setItem('user' , JSON.stringify(this.loginForm.value))
      this._router.navigate(['/']);
    }
    else{
      this.errmsg= "info is wrong ...."
    }
  }
}
