// Standings model based on API documentation

export interface Standing {
  ModelId: number;
  Description: string;
  R: number;
  HR: number;
  RBI: number;
  SB: number;
  AVG: number;
  W: number;
  K: number;
  ERA: number;
  WHIP: number;
  SVH: number;
}

export interface StandingsResponse {
  standings: Standing[];
}

export interface StandingResponse {
  standing: Standing;
} 