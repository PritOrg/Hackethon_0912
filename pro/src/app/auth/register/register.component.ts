import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { RegisterCompanyDto } from '../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  currentStep = 1;
  totalSteps = 4;
  showPassword = false;
  showConfirmPassword = false;
  
  private destroy$ = new Subject<void>();

  industryOptions = [
    'Technology', 'Healthcare', 'Finance', 'Manufacturing', 
    'Retail', 'Education', 'Consulting', 'Real Estate', 'Other'
  ];

  companyTypeOptions = [
    'Private Limited', 'Public Limited', 'Partnership', 
    'Sole Proprietorship', 'LLP', 'NGO'
  ];

  subscriptionPlans = [
    { id: 'starter', name: 'Starter', price: 49, employees: 50, features: ['Basic HR', 'Leave Management', 'Email Support'] },
    { id: 'professional', name: 'Professional', price: 99, employees: 200, features: ['All Starter', 'Projects', 'Assets', 'Priority Support'] },
    { id: 'enterprise', name: 'Enterprise', price: 199, employees: 'Unlimited', features: ['All Professional', 'Custom Integrations', 'Dedicated Support', 'Advanced Analytics'] }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm(): void {
    this.registerForm = this.fb.group({
      // Step 1: Company Information
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      companyType: ['', Validators.required],
      industry: ['', Validators.required],
      registrationNumber: [''],
      taxId: [''],
      website: ['', Validators.pattern(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)],
      
      // Step 2: Contact Information
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-()]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        postalCode: ['', Validators.required],
        country: ['', Validators.required]
      }),
      
      // Step 3: Admin User
      adminFirstName: ['', [Validators.required, Validators.minLength(2)]],
      adminLastName: ['', [Validators.required, Validators.minLength(2)]],
      adminEmail: ['', [Validators.required, Validators.email]],
      adminPhone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-()]+$/)]],
      adminPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)]],
      confirmPassword: ['', Validators.required],
      
      // Step 4: Subscription
      subscriptionPlan: ['professional', Validators.required],
      paymentMethod: ['credit_card'],
      agreeToTerms: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(group: FormGroup): {[key: string]: boolean} | null {
    const password = group.get('adminPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  nextStep(): void {
    if (this.isStepValid(this.currentStep)) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    } else {
      this.markStepAsTouched(this.currentStep);
      this.notificationService.warning('Please fill in all required fields correctly.');
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return !!(this.registerForm.get('companyName')?.valid &&
                 this.registerForm.get('companyType')?.valid &&
                 this.registerForm.get('industry')?.valid);
      case 2:
        return !!(this.registerForm.get('phone')?.valid &&
                 this.registerForm.get('email')?.valid &&
                 this.registerForm.get('address')?.valid);
      case 3:
        return !!(this.registerForm.get('adminFirstName')?.valid &&
                 this.registerForm.get('adminLastName')?.valid &&
                 this.registerForm.get('adminEmail')?.valid &&
                 this.registerForm.get('adminPhone')?.valid &&
                 this.registerForm.get('adminPassword')?.valid &&
                 this.registerForm.get('confirmPassword')?.valid &&
                 !this.registerForm.hasError('passwordMismatch'));
      case 4:
        return !!(this.registerForm.get('subscriptionPlan')?.valid &&
                 this.registerForm.get('agreeToTerms')?.valid);
      default:
        return false;
    }
  }

  markStepAsTouched(step: number): void {
    const fieldsToTouch: {[key: number]: string[]} = {
      1: ['companyName', 'companyType', 'industry'],
      2: ['phone', 'email', 'address'],
      3: ['adminFirstName', 'adminLastName', 'adminEmail', 'adminPhone', 'adminPassword', 'confirmPassword'],
      4: ['subscriptionPlan', 'agreeToTerms']
    };

    fieldsToTouch[step]?.forEach(field => {
      const control = this.registerForm.get(field);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(key => {
            control.get(key)?.markAsTouched();
          });
        }
      }
    });
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markAllAsTouched();
      this.notificationService.error('Please fill in all required fields correctly.');
      return;
    }

    const formValue = this.registerForm.value;
    
    // Extract address fields individually to avoid nesting issues
    const addressGroup = this.registerForm.get('address');
    const addressData = {
      street: addressGroup?.get('street')?.value || '',
      city: addressGroup?.get('city')?.value || '',
      state: addressGroup?.get('state')?.value || '',
      zipCode: addressGroup?.get('postalCode')?.value || '',
      country: addressGroup?.get('country')?.value || ''
    };
    
    console.log('Address data being sent:', addressData);
    
    const registerDto: RegisterCompanyDto = {
      companyName: formValue.companyName,
      companyType: formValue.companyType,
      industry: formValue.industry,
      registrationNumber: formValue.registrationNumber,
      taxId: formValue.taxId,
      website: formValue.website,
      phone: formValue.phone,
      email: formValue.email,
      address: addressData,
      adminUser: {
        firstName: formValue.adminFirstName,
        lastName: formValue.adminLastName,
        email: formValue.adminEmail,
        phone: formValue.adminPhone,
        password: formValue.adminPassword
      },
      subscriptionPlan: formValue.subscriptionPlan
    };
    
    console.log('Full DTO being sent:', JSON.stringify(registerDto, null, 2));

    this.authService.registerCompany(registerDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Registration response:', response);
          
          this.notificationService.success('Registration successful! You are now logged in.');
          
          // User is automatically logged in after registration
          // Redirect to dashboard after 1.5 seconds
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        },
        error: (error: any) => {
          console.error('Registration error:', error);
          // Error is handled by error interceptor and notification service
          // Additional handling for specific errors
          if (error.status === 409 || error.error?.message?.includes('already exists')) {
            this.notificationService.error('Company or email already exists. Please use different credentials.');
          } else if (error.status === 400) {
            this.notificationService.error(error.error?.message || 'Invalid registration data. Please check your inputs.');
          }
        }
      });
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  private markAllAsTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(subKey => {
          control.get(subKey)?.markAsTouched();
        });
      }
    });
  }

  // Helper getters
  hasError(controlName: string, errorName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!(control?.hasError(errorName) && (control?.dirty || control?.touched));
  }

  getStepProgress(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }
}
