// Players model based on API documentation
import { Hitter, Pitcher, HitterPosition } from './teams.model';
import { HitterPlayer, PitcherPlayer } from './models.model';

export interface AvailablePlayersRequest {
  player_type: 'hitter' | 'pitcher';
  position?: HitterPosition | string;
}

export interface AvailableHittersResponse {
  player_type: 'hitter';
  position?: string;
  players: Hitter[];
}

export interface AvailablePitchersResponse {
  player_type: 'pitcher';
  position?: string;
  players: Pitcher[];
}

export type AvailablePlayersResponse = AvailableHittersResponse | AvailablePitchersResponse; 

export interface FreeAgentHittersResponse {
  hitters: HitterPlayer[];
}

export interface FreeAgentPitchersResponse {
  pitchers: PitcherPlayer[];
}

export interface SetFreeAgentResponse {
  success: boolean;
  message: string;
} 