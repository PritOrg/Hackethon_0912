// Asset Models
export interface Asset {
  _id: string;
  assetCode: string;
  assetName: string;
  assetType: 'Laptop' | 'Desktop' | 'Monitor' | 'Phone' | 'Tablet' | 'Furniture' | 'Vehicle' | 'Other';
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate: Date;
  purchasePrice: number;
  warranty?: WarrantyInfo;
  status: 'Available' | 'Assigned' | 'Under Maintenance' | 'Retired';
  condition: 'New' | 'Good' | 'Fair' | 'Poor';
  assignedTo?: string;
  assignmentDate?: Date;
  location?: string;
  specifications?: Record<string, any>;
  notes?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WarrantyInfo {
  duration: number; // months
  expiryDate: Date;
  provider: string;
}

export interface CreateAssetDto {
  assetName: string;
  assetType: 'Laptop' | 'Desktop' | 'Monitor' | 'Phone' | 'Tablet' | 'Furniture' | 'Vehicle' | 'Other';
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate: Date;
  purchasePrice: number;
  warranty?: WarrantyInfo;
  condition: 'New' | 'Good' | 'Fair' | 'Poor';
  location?: string;
  specifications?: Record<string, any>;
}

export interface UpdateAssetDto {
  assetName?: string;
  status?: 'Available' | 'Assigned' | 'Under Maintenance' | 'Retired';
  condition?: 'New' | 'Good' | 'Fair' | 'Poor';
  assignedTo?: string;
  location?: string;
  notes?: string;
}

export interface AssetAssignmentDto {
  assetId: string;
  employeeId: string;
  assignmentDate: Date;
  notes?: string;
}
