import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanySignUpComponent } from './company-sign-up.component';

describe('CompanySignUpComponent', () => {
  let component: CompanySignUpComponent;
  let fixture: ComponentFixture<CompanySignUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompanySignUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanySignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
