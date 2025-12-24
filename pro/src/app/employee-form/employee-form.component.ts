import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeApiService } from '../services/employee-api.service';
import { Observable } from 'rxjs';
import { DepartmentApiService } from '../services/department-api.service';

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
  // Form sections visibility control
  activeSections: { [key in 'personal' | 'contact' | 'employment' | 'compensation' | 'credentials']: boolean } = {
    personal: true,
    contact: false,
    employment: false,
    compensation: false,
    credentials: false
  };
  sections: ('personal' | 'contact' | 'employment' | 'compensation' | 'credentials')[] = ['personal', 'contact', 'employment', 'compensation', 'credentials'];
  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeApiService,
    private departmentService: DepartmentApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.employeeForm = this.createForm();
    this.departments$ = this.departmentService.getAllDepartments();
    this.positions$ = this.departmentService.getAllPositions();
  }

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.employeeId;
    
    if (this.isEditMode && this.employeeId) {
      this.loading = true;
      this.employeeService.getEmployeeById(this.employeeId).subscribe({
        next: (employee:any) => {
          // Remove the password field for edit mode
          const employeeData = { ...employee };
          delete employeeData.password;
          
          this.employeeForm.patchValue(employeeData);
          this.loading = false;
        },
        error: (error:any) => {
          console.error('Error fetching employee:', error);
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
      address: ['', [Validators.required]],
      emergencyContact: this.fb.group({
        name: ['', [Validators.required]],
        relationship: ['', [Validators.required]],
        phoneNumber: ['', [Validators.required]]
      }),
      
      // Employment Details
      companyId: ['', [Validators.required]],
      department: ['', [Validators.required]],
      position: ['', [Validators.required]],
      role: ['', [Validators.required]],
      joiningDate: ['', [Validators.required]],
      jobShift: ['', [Validators.required]],
      expertise: this.fb.array([]),
      projects: this.fb.array([]),
      achievements: this.fb.array([]),
      
      // Compensation & Benefits
      salary: ['', [Validators.required, Validators.min(0)]],
      leaveBalance: this.fb.group({
        annualLeave: [0, [Validators.min(0)]],
        sickLeave: [0, [Validators.min(0)]],
        casualLeave: [0, [Validators.min(0)]],
        maternityLeave: [0, [Validators.min(0)]],
        privilegeLeave: [0, [Validators.min(0)]],
        halfDayLeave: [0, [Validators.min(0)]]
      }),
      specialRemarks: [''],
      
      // Account Credentials (only for new employees)
      username: ['', this.isEditMode ? [] : [Validators.required]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(8)]]
    });
  }

  toggleSection(section: string): void {
    Object.keys(this.activeSections).forEach(key => {
      this.activeSections[key as keyof typeof this.activeSections] = key === section;
    });
  }

  addExpertise(): void {
    // Implementation for adding expertise fields dynamically
  }

  addProject(): void {
    // Implementation for adding project fields dynamically
  }

  addAchievement(): void {
    // Implementation for adding achievement fields dynamically
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const employeeData = this.employeeForm.value;

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
          this.submitError = error.error?.message || 'Error creating employee.';
        }
      });
    }
  }
}