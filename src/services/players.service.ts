// Players service for interacting with players endpoints
import { ApiService } from './api.service';
import { 
  AvailablePlayersRequest, 
  AvailablePlayersResponse,
  AvailableHittersResponse,
  AvailablePitchersResponse,
  FreeAgentHittersResponse,
  FreeAgentPitchersResponse,
  SetFreeAgentResponse
} from '../models/players.model';
import { Hitter, Pitcher } from '../models/teams.model';
import { 
  TopHittersResponse, 
  TopPitchersResponse, 
  TopPlayersResponse,
  HitterPlayer,
  PitcherPlayer
} from '../models/models.model';

/**
 * Service for interacting with players endpoints
 */
export class PlayersService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService();
  }

  /**
   * Get available players
   * @param request The request parameters
   * @returns Promise with available players
   */
  public async getAvailablePlayers(request: AvailablePlayersRequest): Promise<AvailablePlayersResponse> {
    const { player_type, position } = request;
    let url = `/players/available?player_type=${player_type}`;
    
    if (position) {
      url += `&position=${position}`;
    }
    
    return this.apiService.get<AvailablePlayersResponse>(url);
  }

  /**
   * Get available hitters
   * @param position Optional position filter
   * @returns Promise with available hitters
   */
  public async getAvailableHitters(position?: string): Promise<Hitter[]> {
    const response = await this.getAvailablePlayers({ 
      player_type: 'hitter', 
      position 
    }) as AvailableHittersResponse;
    
    return response.players;
  }

  /**
   * Get available pitchers
   * @param position Optional position filter
   * @returns Promise with available pitchers
   */
  public async getAvailablePitchers(position?: string): Promise<Pitcher[]> {
    const response = await this.getAvailablePlayers({ 
      player_type: 'pitcher', 
      position 
    }) as AvailablePitchersResponse;
    
    return response.players;
  }

  /**
   * Get top hitters by SG value
   * @param modelId The model ID to use (default: 1)
   * @param limit The number of hitters to return (default: 25)
   * @returns Promise with top hitters
   */
  public async getTopHitters(modelId: number = 1, limit: number = 25): Promise<HitterPlayer[]> {
    const url = `/top-hitters?model_id=${modelId}&limit=${limit}`;
    const response = await this.apiService.get<TopHittersResponse>(url);
    return response.hitters;
  }

  /**
   * Get top pitchers by SG value
   * @param modelId The model ID to use (default: 1)
   * @param limit The number of pitchers to return (default: 25)
   * @returns Promise with top pitchers
   */
  public async getTopPitchers(modelId: number = 1, limit: number = 25): Promise<PitcherPlayer[]> {
    const url = `/top-pitchers?model_id=${modelId}&limit=${limit}`;
    const response = await this.apiService.get<TopPitchersResponse>(url);
    return response.pitchers;
  }

  /**
   * Get top players (both hitters and pitchers) by SG value
   * @param modelId The model ID to use (default: 1)
   * @param limit The number of players to return per type (default: 25)
   * @returns Promise with top players
   */
  public async getTopPlayers(modelId: number = 1, limit: number = 25): Promise<TopPlayersResponse> {
    const url = `/top-players?model_id=${modelId}&limit=${limit}`;
    return this.apiService.get<TopPlayersResponse>(url);
  }

  /**
   * Get detailed stats for a specific hitter
   * @param playerId The hitter player ID
   * @returns Promise with hitter stats
   */
  public async getHitterStats(playerId: number): Promise<HitterPlayer> {
    return this.apiService.get<HitterPlayer>(`/gethitterstats/${playerId}`);
  }

  /**
   * Get detailed stats for a specific pitcher
   * @param playerId The pitcher player ID
   * @returns Promise with pitcher stats
   */
  public async getPitcherStats(playerId: number): Promise<PitcherPlayer> {
    return this.apiService.get<PitcherPlayer>(`/getpitcherstats/${playerId}`);
  }

  /**
   * Remove a player from the available players list
   * @param playerType The type of player ('hitter' or 'pitcher')
   * @param playerId The player ID to remove
   * @returns Promise with the response
   */
  public async removePlayer(playerType: 'hitter' | 'pitcher', playerId: number): Promise<{ success: boolean; message: string }> {
    return this.apiService.delete<{ success: boolean; message: string }>(`/players/${playerType}/${playerId}`);
  }

  /**
   * Get all hitters with a status of 'NA'
   * @returns Promise with NA status hitters
   */
  public async getNAHitters(): Promise<HitterPlayer[]> {
    const response = await this.apiService.get<FreeAgentHittersResponse>('/players/free-agent-hitters');
    return response.hitters;
  }

  /**
   * Get all pitchers with a status of 'NA'
   * @returns Promise with NA status pitchers
   */
  public async getNAPitchers(): Promise<PitcherPlayer[]> {
    const response = await this.apiService.get<FreeAgentPitchersResponse>('/players/free-agent-pitchers');
    return response.pitchers;
  }

  /**
   * Set a player's status to 'FA'
   * @param playerType The type of player ('hitter' or 'pitcher')
   * @param playerId The player ID to update
   * @returns Promise with the response
   */
  public async setPlayerAsFreeAgent(playerType: 'hitter' | 'pitcher', playerId: number): Promise<SetFreeAgentResponse> {
    return this.apiService.put<SetFreeAgentResponse>(`/players/${playerType}/${playerId}/set-free-agent`, {});
  }
} 