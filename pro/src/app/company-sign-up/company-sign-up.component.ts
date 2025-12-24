import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyApiService } from '../services/company-api.service';
@Component({
  selector: 'app-company-sign-up',
  standalone: false,
  templateUrl: './company-sign-up.component.html',
  styleUrl: './company-sign-up.component.scss'
})
export class CompanySignUpComponent {
  companyForm!: FormGroup;
  step = 1;
  isLoading = false;

  constructor(private fb: FormBuilder, private _api : CompanyApiService) {}

  ngOnInit(): void {
    this.companyForm = this.fb.group({
      basicInfo: this.fb.group({
        name: ['', Validators.required],
        type: ['', Validators.required],
        industry: ['', Validators.required],
        registrationNumber: ['', Validators.required],
        establishedDate: ['', Validators.required]
      }),
      contactInfo: this.fb.group({
        phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
        email: ['', [Validators.required, Validators.email]],
        website: ['', Validators.pattern(/^(http|https):\/\/[^ "]+$/)]
      }),
      addressInfo: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zipCode: ['', Validators.required],
        country: ['', Validators.required]
      })
    });
  }

  get basicInfo(): FormGroup {
    return this.companyForm.get('basicInfo') as FormGroup;
  }

  get contactInfo(): FormGroup {
    return this.companyForm.get('contactInfo') as FormGroup;
  }

  get addressInfo(): FormGroup {
    return this.companyForm.get('addressInfo') as FormGroup;
  }

  nextStep(): void {
    this.step++;
  }

  prevStep(): void {
    this.step--;
  }

  onSubmit(): void {
    if (this.companyForm.valid) {
      this.isLoading = true;

      setTimeout(() => {
        this.isLoading = false;
        console.log('Form submitted successfully!', this.companyForm.value);
        this._api.signUp(this.companyForm.value).subscribe({
          next: (response) => {
            console.log(response);
          },
          error: (error) => {
            console.error('Registration failed:', error);
          }
        });
        alert('Company registered successfully!');
      }, 2000);
    }
  }
}
