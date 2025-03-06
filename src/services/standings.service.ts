// Standings service for interacting with standings endpoints
import { ApiService } from './api.service';
import { Standing, StandingsResponse } from '../models/standings.model';

/**
 * Service for interacting with standings endpoints
 */
export class StandingsService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService();
  }

  /**
   * Get all standings
   * @returns Promise with all standings
   */
  public async getAllStandings(): Promise<Standing[]> {
    const response = await this.apiService.get<StandingsResponse>('/standings');
    return response.standings;
  }

  /**
   * Get a specific standing by model ID
   * @param modelId The model ID to retrieve
   * @returns Promise with the standing
   */
  public async getStandingById(modelId: number): Promise<Standing> {
    return this.apiService.get<Standing>(`/standings/${modelId}`);
  }
} 