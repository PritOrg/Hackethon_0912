import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../core/services/base-api.service';
import {
  Asset,
  CreateAssetDto,
  UpdateAssetDto,
  AssetAssignmentDto
} from '../core/models/asset.model';
import {
  ApiResponse,
  PaginatedResponse,
  QueryParams
} from '../core/models/api.model';

/**
 * Asset API Service - Handles all asset-related API calls
 */
@Injectable({
  providedIn: 'root'
})
export class AssetApiService extends BaseApiService {
  private endpoint = '/assets';

  /**
   * Get all assets
   */
  getAllAssets(params?: QueryParams): Observable<PaginatedResponse<Asset>> {
    return this.getPaginated<Asset>(this.endpoint, params);
  }

  /**
   * Get asset by ID
   */
  getAssetById(id: string): Observable<ApiResponse<Asset>> {
    return this.getWithResponse<Asset>(`${this.endpoint}/${id}`);
  }

  /**
   * Get my assigned assets
   */
  getMyAssets(params?: QueryParams): Observable<PaginatedResponse<Asset>> {
    return this.getPaginated<Asset>(`${this.endpoint}/my-assets`, params);
  }

  /**
   * Create asset
   */
  createAsset(data: CreateAssetDto): Observable<ApiResponse<Asset>> {
    return this.postWithResponse<Asset>(this.endpoint, data);
  }

  /**
   * Update asset
   */
  updateAsset(id: string, data: UpdateAssetDto): Observable<ApiResponse<Asset>> {
    return this.putWithResponse<Asset>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Delete asset
   */
  deleteAsset(id: string): Observable<ApiResponse<void>> {
    return this.deleteWithResponse<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Assign asset to employee
   */
  assignAsset(data: AssetAssignmentDto): Observable<ApiResponse<Asset>> {
    return this.postWithResponse<Asset>(`${this.endpoint}/assign`, data);
  }

  /**
   * Unassign asset
   */
  unassignAsset(assetId: string): Observable<ApiResponse<Asset>> {
    return this.postWithResponse<Asset>(`${this.endpoint}/${assetId}/unassign`, {});
  }

  /**
   * Get available assets
   */
  getAvailableAssets(params?: QueryParams): Observable<PaginatedResponse<Asset>> {
    return this.getPaginated<Asset>(`${this.endpoint}/available`, params);
  }

  /**
   * Get assets by type
   */
  getAssetsByType(assetType: string, params?: QueryParams): Observable<PaginatedResponse<Asset>> {
    return this.getPaginated<Asset>(`${this.endpoint}/type/${assetType}`, params);
  }
}
