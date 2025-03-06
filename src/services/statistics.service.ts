// Statistics service for interacting with statistics endpoints
import { ApiService } from './api.service';
import { 
  TeamHittingStatsResponse, 
  TeamPitchingStatsResponse, 
  TeamAllStatsResponse,
  HittingStats,
  PitchingStats
} from '../models/statistics.model';

/**
 * Service for interacting with statistics endpoints
 */
export class StatisticsService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService();
  }

  /**
   * Get team hitting statistics
   * @param teamId The team ID to retrieve stats for
   * @returns Promise with the team hitting stats
   */
  public async getTeamHittingStats(teamId: number): Promise<TeamHittingStatsResponse> {
    return this.apiService.get<TeamHittingStatsResponse>(`/teams/${teamId}/stats/hitting`);
  }

  /**
   * Get team pitching statistics
   * @param teamId The team ID to retrieve stats for
   * @returns Promise with the team pitching stats
   */
  public async getTeamPitchingStats(teamId: number): Promise<TeamPitchingStatsResponse> {
    return this.apiService.get<TeamPitchingStatsResponse>(`/teams/${teamId}/stats/pitching`);
  }

  /**
   * Get all team statistics (hitting and pitching)
   * @param teamId The team ID to retrieve stats for
   * @returns Promise with all team stats
   */
  public async getTeamAllStats(teamId: number): Promise<TeamAllStatsResponse> {
    return this.apiService.get<TeamAllStatsResponse>(`/teams/${teamId}/stats`);
  }

  /**
   * Get just the hitting stats for a team
   * @param teamId The team ID to retrieve stats for
   * @returns Promise with the hitting stats
   */
  public async getHittingStatsOnly(teamId: number): Promise<HittingStats> {
    const response = await this.getTeamHittingStats(teamId);
    return response.stats;
  }

  /**
   * Get just the pitching stats for a team
   * @param teamId The team ID to retrieve stats for
   * @returns Promise with the pitching stats
   */
  public async getPitchingStatsOnly(teamId: number): Promise<PitchingStats> {
    const response = await this.getTeamPitchingStats(teamId);
    return response.stats;
  }
} 