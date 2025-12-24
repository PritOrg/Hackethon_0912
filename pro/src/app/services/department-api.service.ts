import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DepartmentApiService {

  constructor() { 
    
  }
  getAllDepartments(): Observable<{ id: number; name: string; }[]> {
    return of([
      { id: 1, name: 'HR' },
      { id: 2, name: 'Engineering' },
      { id: 3, name: 'Sales' }
    ]);
  }
  getAllPositions(): Observable<{ id: number; name: string; }[]> {
    return of([
      { id: 1, name: 'Manager' },
      { id: 2, name: 'Engineer' },
      { id: 3, name: 'Sales' }
    ]);
  }
}
