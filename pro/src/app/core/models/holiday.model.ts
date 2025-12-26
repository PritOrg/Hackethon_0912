// Holiday Models
export interface Holiday {
  _id: string;
  holidayName: string;
  date: Date;
  type: 'National' | 'Regional' | 'Company' | 'Optional';
  description?: string;
  isRecurring: boolean;
  applicableLocations?: string[];
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHolidayDto {
  holidayName: string;
  date: Date;
  type: 'National' | 'Regional' | 'Company' | 'Optional';
  description?: string;
  isRecurring?: boolean;
  applicableLocations?: string[];
}

export interface UpdateHolidayDto {
  holidayName?: string;
  date?: Date;
  type?: 'National' | 'Regional' | 'Company' | 'Optional';
  description?: string;
  isRecurring?: boolean;
  applicableLocations?: string[];
}
