// Models and analysis service for interacting with models endpoints
import { ApiService } from './api.service';
import { 
  Model, 
  ModelsResponse, 
  BenchmarksResponse,
  WhatIfRequest,
  WhatIfResponse,
  UploadResponse
} from '../models/models.model';

/**
 * Service for interacting with models and analysis endpoints
 */
export class ModelsService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService();
  }

  /**
   * Get all models
   * @returns Promise with all models
   */
  public async getAllModels(): Promise<Model[]> {
    const response = await this.apiService.get<ModelsResponse>('/models');
    return response.models;
  }

  /**
   * Delete a model
   * @param modelId The model ID to delete
   * @returns Promise with the delete response
   */
  public async deleteModel(modelId: number): Promise<{ success: boolean }> {
    return this.apiService.delete<{ success: boolean }>(`/models/${modelId}`);
  }

  /**
   * Get benchmarks for a model
   * @param modelId Optional model ID (defaults to latest model)
   * @returns Promise with the benchmarks
   */
  public async getBenchmarks(modelId?: number): Promise<BenchmarksResponse> {
    let url = '/benchmarks';
    if (modelId) {
      url += `?model_id=${modelId}`;
    }
    return this.apiService.get<BenchmarksResponse>(url);
  }

  /**
   * Calculate what-if scenario
   * @param request The what-if request data
   * @returns Promise with the what-if results
   */
  public async calculateWhatIf(request: WhatIfRequest): Promise<WhatIfResponse> {
    return this.apiService.post<WhatIfResponse, WhatIfRequest>('/what-if', request);
  }

  /**
   * Upload data for analysis
   * @param file The file to upload
   * @param name Optional name for the model
   * @param description Optional description for the model
   * @returns Promise with the upload response
   */
  public async uploadData(
    file: File, 
    name?: string, 
    description?: string
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (name) {
      formData.append('name', name);
    }
    
    if (description) {
      formData.append('description', description);
    }
    
    // Use the direct axios instance to handle FormData properly
    const response = await this.apiService['api'].post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }
} 