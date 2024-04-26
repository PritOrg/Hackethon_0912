import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ApiEmployeeService } from '../../api-employee.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css']
})
export class AddEmployeeComponent implements OnInit {
  employeeForm!: FormGroup;
  currentStep: number = 1;
  generatedPassword: string = '';
  submitEnabled = false;

  constructor(private fb: FormBuilder, private _api: ApiEmployeeService, private router: Router) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      // Personal Info Fields
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      middleName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthdate: ['', Validators.required],
      profilePic: [''],
      // Organization Info Fields
      role: ['employee', Validators.required],
      joiningDate: ['', Validators.required],
      expertise: this.fb.array(this.expertiseList.map(() => new FormControl(false))),
      achievements: this.fb.array([]),
      jobShift: ['', Validators.required]
    });
  }

  expertiseList = [
    'SQL', 'Flutter', 'Express/Node', 'JavaScript', 'React', 'Angular', 'Python', 'Java',
    'C', 'C++', 'HTML', 'CSS', 'TypeScript', 'PHP', 'Ruby', 'Swift', 'Go', 'Kotlin', 'Rust', 'Perl'
  ];

  // Helper method to build expertise FormArray of checkboxes
  get expertiseFormArray(): FormArray {
    return this.employeeForm.get('expertise') as FormArray;
  }

  get achievementsFormArray(): FormArray {
    return this.employeeForm.get('achievements') as FormArray;
  }

  addAchievement(): void {
    this.achievementsFormArray.push(new FormControl('', Validators.required));
  }

  removeAchievement(index: number): void {
    if (this.achievementsFormArray.controls.length > 1) {
      this.achievementsFormArray.removeAt(index);
    }
  }

  // Move to the next step
  nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
      this.updateProgressBar();
    }
  }

  // Move to the previous step
  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateProgressBar();
    }
  }

  // Display the selected step
  displayStep(stepNumber: number): void {
    if (stepNumber >= 1 && stepNumber <= 3) {
      this.currentStep = stepNumber;
      this.updateProgressBar();
    }
  }

  // Update the progress bar
  updateProgressBar(): void {
    const progressPercentage = ((this.currentStep - 1) / 2) * 100;
    document.querySelector('.progress-bar')!.setAttribute('style', `width: ${progressPercentage}%`);
  }
  getFormControl(control: AbstractControl, index: number | null): FormControl {
    if (control instanceof FormControl) {
      return control;
    } else {
      const formControl = new FormControl(control.value);
      if (index !== null) {
        formControl.setValidators(this.expertiseFormArray.at(index).validator);
      }
      return formControl;
    }
  }

  get selectedExpertise(): string[] {
    const expertiseControls = this.employeeForm.get('expertise')?.value;
    const selectedExpertise: string[] = [];
    expertiseControls.forEach((control: boolean, index: number) => {
      if (control) {
        selectedExpertise.push(this.expertiseList[index]);
      }
    });
    return selectedExpertise;
  }

  // Submit the form
  onSubmit() {
    if (this.employeeForm.valid) {
      const formValue = this.employeeForm.value;
      // Map boolean values to expertise names
      const selectedExpertise = this.expertiseList.filter((_, index) => formValue.expertise[index]);
      formValue.expertise = selectedExpertise;
      // Add the password field to the formValue before submitting
      formValue.password = this.generatedPassword;
      this._api.signup(formValue).subscribe({
        next: (response) => {
          if (response && Object.keys(response).length > 0) {
            Swal.fire({
              icon: 'success',
              title: 'Signup Successful!',
              html: `
                  <p>You have successfully signed up.</p>
                  <p><strong>Email:</strong> ${response.email}</p>
                  <p><strong>Password:</strong> ${formValue.password}</p>
                `,
              confirmButtonText: 'OK'
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['/sign-in']);
              }
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Signup Failed',
              text: 'An error occurred while signing up. Please try again later.',
              confirmButtonText: 'OK'
            });
            console.error('Signup failed:', response);
          }
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Signup Failed',
            text: 'An error occurred while signing up. Please try again later.',
            confirmButtonText: 'OK'
          });
          console.error('Signup failed:', error);
        }
      });
    } else {
      Swal.fire({
        title: 'Invalid Form',
        text: 'Please fill in all required fields correctly.',
        icon: 'error',
        confirmButtonText: 'Okay'
      });
    }
  }


  // Generate a unique 8-character password
  generatePassword(): void {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    // Show SweetAlert with the generated password
    Swal.fire({
      title: 'Generated Password',
      text: `Your generated password is: ${password}`,
      icon: 'success',
      confirmButtonText: 'Okay'
    }).then((result) => {
      // Enable submit button after SweetAlert is closed
      if (result.isConfirmed) {
        // Enable the submit button (Assuming you have a variable like submitEnabled)
        this.submitEnabled = true;
        this.generatedPassword = password;
      }
    });
  }
}
