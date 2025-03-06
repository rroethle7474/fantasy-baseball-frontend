// Players service for interacting with players endpoints
import { ApiService } from './api.service';
import { 
  AvailablePlayersRequest, 
  AvailablePlayersResponse,
  AvailableHittersResponse,
  AvailablePitchersResponse
} from '../models/players.model';
import { Hitter, Pitcher } from '../models/teams.model';

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
} 