import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-two-factor',
  standalone: false,
  templateUrl: './two-factor.component.html',
  styleUrls: ['./two-factor.component.scss']
})
export class TwoFactorComponent implements OnInit, OnDestroy {
  twoFactorForm!: FormGroup;
  email = '';
  returnUrl = '/admin/dashboard';
  codeLength = 6;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get email and return URL from query params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.email = params['email'] || '';
      this.returnUrl = params['returnUrl'] || '/admin/dashboard';

      if (!this.email) {
        this.notificationService.error('Invalid 2FA session. Please login again.');
        this.router.navigate(['/auth/login']);
      }
    });

    // Initialize form with 6 code inputs
    const codeControls: {[key: string]: any} = {};
    for (let i = 1; i <= this.codeLength; i++) {
      codeControls[`code${i}`] = ['', [Validators.required, Validators.pattern(/^\d$/)]];
    }
    this.twoFactorForm = this.fb.group(codeControls);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCodeInput(event: any, index: number): void {
    const input = event.target;
    const value = input.value;

    // Move to next input if value entered
    if (value && index < this.codeLength) {
      const nextInput = document.getElementById(`code${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Auto-submit when all fields are filled
    if (index === this.codeLength && this.twoFactorForm.valid) {
      this.onSubmit();
    }
  }

  onCodeKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    // Handle backspace
    if (event.key === 'Backspace' && !input.value && index > 1) {
      const prevInput = document.getElementById(`code${index - 1}`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }

    // Handle paste
    if (event.key === 'v' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      navigator.clipboard.readText().then(text => {
        this.handlePaste(text);
      });
    }
  }

  onCodePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text');
    if (pastedData) {
      this.handlePaste(pastedData);
    }
  }

  handlePaste(text: string): void {
    const digits = text.replace(/\D/g, '').slice(0, this.codeLength);
    
    for (let i = 0; i < digits.length && i < this.codeLength; i++) {
      this.twoFactorForm.patchValue({ [`code${i + 1}`]: digits[i] });
    }

    // Focus on last filled input or first empty input
    const nextIndex = Math.min(digits.length + 1, this.codeLength);
    const nextInput = document.getElementById(`code${nextIndex}`) as HTMLInputElement;
    if (nextInput) {
      nextInput.focus();
    }

    // Auto-submit if all fields filled
    if (digits.length === this.codeLength) {
      setTimeout(() => {
        if (this.twoFactorForm.valid) {
          this.onSubmit();
        }
      }, 100);
    }
  }

  onSubmit(): void {
    if (this.twoFactorForm.invalid) {
      return;
    }

    // Concatenate all code digits
    let code = '';
    for (let i = 1; i <= this.codeLength; i++) {
      code += this.twoFactorForm.get(`code${i}`)?.value || '';
    }

    this.authService.verify2FA(this.email, code)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.notificationService.success('Verification successful! Welcome back.');
          this.router.navigate([this.returnUrl]);
        },
        error: (error: any) => {
          this.notificationService.error('Invalid verification code. Please try again.');
          this.clearCode();
        }
      });
  }

  clearCode(): void {
    for (let i = 1; i <= this.codeLength; i++) {
      this.twoFactorForm.patchValue({ [`code${i}`]: '' });
    }
    const firstInput = document.getElementById('code1') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  }

  resendCode(): void {
    this.authService.resend2FA(this.email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.notificationService.success('A new verification code has been sent to your device.');
          this.clearCode();
        },
        error: (error: any) => {
          this.notificationService.error('Failed to resend code. Please try again.');
        }
      });
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  getMaskedEmail(): string {
    if (!this.email) return '';
    
    const [username, domain] = this.email.split('@');
    if (!username || !domain) return this.email;
    
    const maskedUsername = username.substring(0, 2) + '*'.repeat(Math.max(username.length - 2, 0));
    return `${maskedUsername}@${domain}`;
  }
}
