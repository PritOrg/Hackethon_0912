import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeApiService } from '../services/employee-api.service';
import { Observable } from 'rxjs';
import { DepartmentApiService } from '../services/department-api.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-employee-form',
  standalone: false,
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  employeeId: string | null = null;
  loading = false;
  submitError = '';
  departments$: Observable<any[]>;
  positions$: Observable<any[]>;
  isDarkMode: boolean = false;
  
  // NEW: Stepper Configuration
  currentStep = 0;
  steps = [
    { label: 'Personal Info', description: 'Basic identification' },
    { label: 'Contact Details', description: 'Address & Communication' },
    { label: 'Employment', description: 'Role, Dept & Status' },
    { label: 'Compensation', description: 'Salary & Benefits' }
  ];
  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeApiService,
    private departmentService: DepartmentApiService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.employeeForm = this.createForm();
    this.departments$ = this.departmentService.getAllDepartments();
    this.positions$ = this.departmentService.getAllPositions();
  }

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.employeeId;
    
    // Set companyId from current user (synchronous)
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.companyId) {
      // Extract string ID from companyId (handle both object with _id and direct string)
      const companyIdValue = typeof currentUser.companyId === 'object' && currentUser.companyId !== null
        ? (currentUser.companyId as any)._id || (currentUser.companyId as any).id
        : currentUser.companyId;
      
      this.employeeForm.patchValue({ companyId: companyIdValue });
      console.log('Set companyId from current user:', companyIdValue, 'Raw:', currentUser.companyId);
    } else {
      console.error('No companyId found in current user:', currentUser);
    }

    if (this.isEditMode && this.employeeId) {
      this.loading = true;
      console.log('📝 Edit mode - Loading employee ID:', this.employeeId);
      
      this.employeeService.getEmployeeById(this.employeeId).subscribe({
        next: (response: any) => {
          console.log('📝 Raw employee response:', response);
          
          // Backend wraps response in { success, data, message }
          const employee = response.data || response;
          console.log('📝 Extracted employee data:', employee);
          
          if (employee && employee._id) {
            // Remove the password field for edit mode
            const employeeData = { ...employee };
            delete employeeData.password;
            
            console.log('📝 Patching form with employee data:', employeeData);
            this.employeeForm.patchValue(employeeData);
            console.log('✅ Form patched successfully');
          } else {
            console.error('❌ Invalid employee data received');
            this.submitError = 'Invalid employee data received.';
          }
          
          this.loading = false;
        },
        error: (error: any) => {
          console.error('❌ Error fetching employee:', error);
          this.loading = false;
          this.submitError = 'Error loading employee data.';
        }
      });
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      // Personal Information
      firstName: ['', [Validators.required]],
      middleName: [''],
      lastName: ['', [Validators.required]],
      birthdate: ['', [Validators.required]],
      profilePic: [''],
      
      // Contact Information
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      address: this.fb.group({
        street: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        zipCode: ['', [Validators.required]],
        country: ['', [Validators.required]]
      }),
      emergencyContact: this.fb.group({
        name: ['', [Validators.required]],
        relationship: ['', [Validators.required]],
        phoneNumber: ['', [Validators.required]]
      }),
      
      // Employment Details
      companyId: ['', [Validators.required]],
      empCode: ['EMP' + Date.now().toString().slice(-6)], // Auto-generated default code
      department: [null],
      designation: ['', [Validators.required]],
      role: ['Employee', [Validators.required]],
      joiningDate: ['', [Validators.required]],
      employmentType: ['Full-Time', [Validators.required]],
      status: ['Active'],
      
      // Compensation & Benefits
      salary: this.fb.group({
        amount: ['', [Validators.required, Validators.min(0)]],
        currency: ['USD', [Validators.required]],
        structure: ['Fixed', [Validators.required]]
      }),
      
      // Account Credentials (only for new employees)
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(8)]]
    });
  }

  // Stepper Navigation Methods
  nextStep(): void {
    const stepValidation = this.validateCurrentStep();
    
    if (!stepValidation.isValid) {
      stepValidation.markTouched();
      return;
    }
    
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      // Scroll to top on step change
      setTimeout(() => {
        document.querySelector('.overflow-y-auto')?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  goToStep(index: number): void {
    // Allow navigation to previous steps or forward if current is valid
    if (index < this.currentStep) {
      this.currentStep = index;
    } else if (index > this.currentStep) {
      const validation = this.validateCurrentStep();
      if (validation.isValid) {
        this.currentStep = index;
      } else {
        validation.markTouched();
      }
    }
  }

  private validateCurrentStep(): { isValid: boolean; markTouched: () => void } {
    switch (this.currentStep) {
      case 0: // Personal Info
        const personalInvalid = 
          this.employeeForm.get('firstName')?.invalid || 
          this.employeeForm.get('lastName')?.invalid || 
          this.employeeForm.get('birthdate')?.invalid;
        return {
          isValid: !personalInvalid,
          markTouched: () => {
            this.employeeForm.get('firstName')?.markAsTouched();
            this.employeeForm.get('lastName')?.markAsTouched();
            this.employeeForm.get('birthdate')?.markAsTouched();
          }
        };
      
      case 1: // Contact Details
        const contactInvalid = 
          this.employeeForm.get('email')?.invalid || 
          this.employeeForm.get('phoneNumber')?.invalid ||
          this.employeeForm.get('address')?.invalid;
        return {
          isValid: !contactInvalid,
          markTouched: () => {
            this.employeeForm.get('email')?.markAsTouched();
            this.employeeForm.get('phoneNumber')?.markAsTouched();
            this.employeeForm.get('address')?.markAllAsTouched();
          }
        };
      
      case 2: // Employment
        const employmentInvalid = 
          this.employeeForm.get('designation')?.invalid ||
          this.employeeForm.get('role')?.invalid ||
          this.employeeForm.get('joiningDate')?.invalid;
        return {
          isValid: !employmentInvalid,
          markTouched: () => {
            this.employeeForm.get('designation')?.markAsTouched();
            this.employeeForm.get('role')?.markAsTouched();
            this.employeeForm.get('joiningDate')?.markAsTouched();
          }
        };
      
      case 3: // Compensation
        return {
          isValid: this.employeeForm.get('salary')?.valid ?? true,
          markTouched: () => {
            this.employeeForm.get('salary')?.markAllAsTouched();
          }
        };
      
      default:
        return { isValid: true, markTouched: () => {} };
    }
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      console.error('Form is invalid:', this.employeeForm.errors);
      return;
    }

    this.loading = true;
    const employeeData = { ...this.employeeForm.value };
    
    console.log('🔍 DEBUG: Raw form data before sanitization:', JSON.stringify(employeeData, null, 2));
    
    // Clean and sanitize data before submission
    // 1. Extract companyId as string (handle object with _id)
    if (employeeData.companyId) {
      console.log('🔍 DEBUG: Original companyId:', employeeData.companyId, 'Type:', typeof employeeData.companyId);
      
      if (typeof employeeData.companyId === 'object' && employeeData.companyId !== null) {
        const extractedId = employeeData.companyId._id || employeeData.companyId.id || '';
        console.log('🔍 DEBUG: Extracted ID from object:', extractedId);
        employeeData.companyId = extractedId;
      }
      employeeData.companyId = String(employeeData.companyId);
      console.log('🔍 DEBUG: Final companyId:', employeeData.companyId);
    }
    
    // 2. Remove undefined or null department (backend will handle optional fields)
    console.log('🔍 DEBUG: Original department:', employeeData.department, 'Type:', typeof employeeData.department);
    if (!employeeData.department || employeeData.department === 'undefined' || employeeData.department === '' || employeeData.department === null) {
      console.log('🔍 DEBUG: Removing invalid department value');
      delete employeeData.department;
    }
    
    console.log('✅ Submitting Employee Data (SANITIZED):', employeeData);
    if (this.isEditMode && this.employeeId) {
      this.employeeService.updateEmployee(this.employeeId, employeeData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/employees']);
        },
        error: (error:any) => {
          console.error('Error updating employee:', error);
          this.loading = false;
          this.submitError = error.error?.message || 'Error updating employee.';
        }
      });
    } else {
      this.employeeService.createEmployee(employeeData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/employees']);
        },
        error: (error:any) => {
          console.error('Error creating employee:', error);
          this.loading = false;
          
          // Show detailed validation errors
          if (error.error?.errors && Array.isArray(error.error.errors)) {
            const errorMessages = error.error.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
            this.submitError = `Validation error: ${errorMessages}`;
          } else {
            this.submitError = error.error?.message || 'Error creating employee.';
          }
        }
      });
    }
  }
}