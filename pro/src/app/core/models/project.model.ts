// Project Models
export interface Project {
  _id: string;
  projectCode: string;
  projectName: string;
  description: string;
  client: string;
  startDate: Date;
  endDate: Date;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  budget: ProjectBudget;
  teamMembers: TeamMember[];
  milestones: Milestone[];
  risks: ProjectRisk[];
  documents: ProjectDocument[];
  tags?: string[];
  companyId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectBudget {
  totalBudget: number;
  spentAmount: number;
  currency: string;
  billingType: 'Fixed' | 'Hourly' | 'Milestone';
}

export interface TeamMember {
  employeeId: string;
  role: string;
  allocationPercentage: number;
  joinedDate: Date;
}

export interface Milestone {
  _id?: string;
  title: string;
  description?: string;
  dueDate: Date;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
  completionDate?: Date;
  payment?: number;
}

export interface ProjectRisk {
  _id?: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  probability: 'Low' | 'Medium' | 'High';
  mitigation?: string;
  status: 'Open' | 'Mitigated' | 'Closed';
  identifiedDate: Date;
}

export interface ProjectDocument {
  documentName: string;
  documentUrl: string;
  uploadedBy: string;
  uploadDate: Date;
}

export interface CreateProjectDto {
  projectName: string;
  description: string;
  client: string;
  startDate: Date;
  endDate: Date;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  totalBudget: number;
  billingType: 'Fixed' | 'Hourly' | 'Milestone';
  tags?: string[];
}

export interface UpdateProjectDto {
  projectName?: string;
  description?: string;
  client?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  totalBudget?: number;
}

export interface ProjectDashboard {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  spentBudget: number;
  portfolioHealth: 'Healthy' | 'At Risk' | 'Critical';
  upcomingMilestones: Milestone[];
  openRisks: ProjectRisk[];
}
