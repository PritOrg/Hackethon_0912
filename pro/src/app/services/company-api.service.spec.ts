import { TestBed } from '@angular/core/testing';

import { CompanyApiService } from './company-api.service';

describe('CompanyApiService', () => {
  let service: CompanyApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
