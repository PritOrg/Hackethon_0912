import { TestBed } from '@angular/core/testing';

import { DepartmentApiService } from './department-api.service';

describe('DepartmentApiService', () => {
  let service: DepartmentApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DepartmentApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
