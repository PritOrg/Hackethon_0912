// Department Models
export interface Department {
  _id: string;
  departmentName: string;
  departmentCode: string;
  description?: string;
  headOfDepartment?: string;
  parentDepartment?: string;
  location?: string;
  budget?: number;
  employeeCount: number;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDepartmentDto {
  departmentName: string;
  departmentCode: string;
  description?: string;
  headOfDepartment?: string;
  parentDepartment?: string;
  location?: string;
  budget?: number;
}

export interface UpdateDepartmentDto {
  departmentName?: string;
  description?: string;
  headOfDepartment?: string;
  location?: string;
  budget?: number;
}
