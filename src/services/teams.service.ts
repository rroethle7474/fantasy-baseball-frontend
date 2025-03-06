// Teams service for interacting with teams endpoints
import { ApiService } from './api.service';
import { 
  Team, 
  TeamsResponse, 
  TeamRosterResponse, 
  TeamHittersResponse, 
  TeamPitchersResponse,
  TeamRosterStructureResponse,
  RosterUpdateRequest,
  RosterUpdateResponse
} from '../models/teams.model';

/**
 * Service for interacting with teams endpoints
 */
export class TeamsService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService();
  }

  /**
   * Get all teams
   * @returns Promise with all teams
   */
  public async getAllTeams(): Promise<Team[]> {
    const response = await this.apiService.get<TeamsResponse>('/teams');
    return response.teams;
  }

  /**
   * Get a specific team by ID
   * @param teamId The team ID to retrieve
   * @returns Promise with the team
   */
  public async getTeamById(teamId: number): Promise<Team> {
    return this.apiService.get<Team>(`/teams/${teamId}`);
  }

  /**
   * Get a team's complete roster
   * @param teamId The team ID to retrieve roster for
   * @returns Promise with the team roster
   */
  public async getTeamRoster(teamId: number): Promise<TeamRosterResponse> {
    return this.apiService.get<TeamRosterResponse>(`/teams/${teamId}/roster`);
  }

  /**
   * Get a team's hitters
   * @param teamId The team ID to retrieve hitters for
   * @returns Promise with the team hitters
   */
  public async getTeamHitters(teamId: number): Promise<TeamHittersResponse> {
    return this.apiService.get<TeamHittersResponse>(`/teams/${teamId}/hitters`);
  }

  /**
   * Get a team's pitchers
   * @param teamId The team ID to retrieve pitchers for
   * @returns Promise with the team pitchers
   */
  public async getTeamPitchers(teamId: number): Promise<TeamPitchersResponse> {
    return this.apiService.get<TeamPitchersResponse>(`/teams/${teamId}/pitchers`);
  }

  /**
   * Get a team's roster structure
   * @param teamId The team ID to retrieve roster structure for
   * @returns Promise with the team roster structure
   */
  public async getTeamRosterStructure(teamId: number): Promise<TeamRosterStructureResponse> {
    return this.apiService.get<TeamRosterStructureResponse>(`/teams/${teamId}/roster/structure`);
  }

  /**
   * Update a team's roster
   * @param teamId The team ID to update roster for
   * @param updateData The roster update data
   * @returns Promise with the update response
   */
  public async updateTeamRoster(teamId: number, updateData: RosterUpdateRequest): Promise<RosterUpdateResponse> {
    return this.apiService.post<RosterUpdateResponse, RosterUpdateRequest>(
      `/teams/${teamId}/roster/update`, 
      updateData
    );
  }
} 