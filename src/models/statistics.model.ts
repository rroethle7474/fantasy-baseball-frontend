// Statistics model based on API documentation
import { Team } from './teams.model';

export interface HittingStats {
  R: number;
  HR: number;
  RBI: number;
  SB: number;
  AVG: number;
}

export interface PitchingStats {
  W: number;
  K: number;
  SVH: number;
  ERA: number;
  WHIP: number;
}

export interface TeamHittingStatsResponse {
  team: Team;
  stats: HittingStats;
}

export interface TeamPitchingStatsResponse {
  team: Team;
  stats: PitchingStats;
}

export interface TeamAllStatsResponse {
  team: Team;
  hitting_stats: HittingStats;
  pitching_stats: PitchingStats;
} 