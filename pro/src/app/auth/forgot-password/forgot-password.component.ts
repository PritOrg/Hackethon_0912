import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  forgotPasswordForm!: FormGroup;
  emailSent = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.get('email')?.markAsTouched();
      return;
    }

    const { email } = this.forgotPasswordForm.value;

    this.authService.forgotPassword(email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.emailSent = true;
          this.notificationService.success('Password reset instructions have been sent to your email.');
        },
        error: (error: any) => {
          // For security, show success even if email doesn't exist
          this.emailSent = true;
        }
      });
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  resendEmail(): void {
    this.emailSent = false;
    this.onSubmit();
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.forgotPasswordForm.get(controlName);
    return !!(control?.hasError(errorName) && (control?.dirty || control?.touched));
  }
}
