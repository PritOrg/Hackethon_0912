import { TestBed } from '@angular/core/testing';

import { ApiEmployeeService } from './api-employee.service';

describe('ApiEmployeeService', () => {
  let service: ApiEmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiEmployeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
