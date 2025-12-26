import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../core/services/base-api.service';
import {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  TeamMember,
  Milestone,
  ProjectRisk,
  ProjectDashboard
} from '../core/models/project.model';
import {
  ApiResponse,
  PaginatedResponse,
  QueryParams
} from '../core/models/api.model';

/**
 * Project API Service - Handles all project-related API calls
 */
@Injectable({
  providedIn: 'root'
})
export class ProjectApiService extends BaseApiService {
  private endpoint = '/projects';

  /**
   * Get all projects
   */
  getAllProjects(params?: QueryParams): Observable<PaginatedResponse<Project>> {
    return this.getPaginated<Project>(this.endpoint, params);
  }

  /**
   * Get my projects
   */
  getMyProjects(params?: QueryParams): Observable<PaginatedResponse<Project>> {
    return this.getPaginated<Project>(`${this.endpoint}/my-projects`, params);
  }

  /**
   * Get project by ID
   */
  getProjectById(id: string): Observable<ApiResponse<Project>> {
    return this.getWithResponse<Project>(`${this.endpoint}/${id}`);
  }

  /**
   * Create project
   */
  createProject(data: CreateProjectDto): Observable<ApiResponse<Project>> {
    return this.postWithResponse<Project>(this.endpoint, data);
  }

  /**
   * Update project
   */
  updateProject(id: string, data: UpdateProjectDto): Observable<ApiResponse<Project>> {
    return this.putWithResponse<Project>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Delete project
   */
  deleteProject(id: string): Observable<ApiResponse<void>> {
    return this.deleteWithResponse<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Assign team member to project
   */
  assignTeamMember(projectId: string, data: TeamMember): Observable<ApiResponse<Project>> {
    return this.postWithResponse<Project>(`${this.endpoint}/${projectId}/team`, data);
  }

  /**
   * Remove team member from project
   */
  removeTeamMember(projectId: string, employeeId: string): Observable<ApiResponse<Project>> {
    return this.deleteWithResponse<Project>(`${this.endpoint}/${projectId}/team/${employeeId}`);
  }

  /**
   * Add milestone
   */
  addMilestone(projectId: string, data: Milestone): Observable<ApiResponse<Project>> {
    return this.postWithResponse<Project>(`${this.endpoint}/${projectId}/milestones`, data);
  }

  /**
   * Update milestone
   */
  updateMilestone(projectId: string, milestoneId: string, data: Partial<Milestone>): Observable<ApiResponse<Project>> {
    return this.putWithResponse<Project>(`${this.endpoint}/${projectId}/milestones/${milestoneId}`, data);
  }

  /**
   * Delete milestone
   */
  deleteMilestone(projectId: string, milestoneId: string): Observable<ApiResponse<Project>> {
    return this.deleteWithResponse<Project>(`${this.endpoint}/${projectId}/milestones/${milestoneId}`);
  }

  /**
   * Add risk
   */
  addRisk(projectId: string, data: ProjectRisk): Observable<ApiResponse<Project>> {
    return this.postWithResponse<Project>(`${this.endpoint}/${projectId}/risks`, data);
  }

  /**
   * Update risk
   */
  updateRisk(projectId: string, riskId: string, data: Partial<ProjectRisk>): Observable<ApiResponse<Project>> {
    return this.putWithResponse<Project>(`${this.endpoint}/${projectId}/risks/${riskId}`, data);
  }

  /**
   * Delete risk
   */
  deleteRisk(projectId: string, riskId: string): Observable<ApiResponse<Project>> {
    return this.deleteWithResponse<Project>(`${this.endpoint}/${projectId}/risks/${riskId}`);
  }

  /**
   * Upload project document
   */
  uploadDocument(projectId: string, file: File, documentName: string): Observable<ApiResponse<Project>> {
    return this.uploadFile<ApiResponse<Project>>(
      `${this.endpoint}/${projectId}/documents`,
      file,
      { documentName }
    );
  }

  /**
   * Get project dashboard
   */
  getProjectDashboard(): Observable<ApiResponse<ProjectDashboard>> {
    return this.getWithResponse<ProjectDashboard>(`${this.endpoint}/dashboard`);
  }
}
