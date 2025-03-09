// Models and analysis model based on API documentation

export interface Model {
  id: number;
  name: string;
  description: string;
  created_timestamp: string;
}

export interface ModelsResponse {
  models: Model[];
}

export interface Benchmark {
  category: string;
  mean_value: number;
  median_value: number;
  std_dev: number;
  min_value: number;
  max_value: number;
}

export interface Correlation {
  category1: string;
  category2: string;
  coefficient: number;
}

export interface BenchmarksResponse {
  model_id: number;
  benchmarks: Benchmark[];
  correlations: Correlation[];
}

export interface WhatIfRequest {
  model_id: number;
  adjustments: Record<string, number>;
}

export interface WhatIfResults {
  playoff_probability: number;
  win_probability: number;
  [key: string]: number;
}

export interface WhatIfResponse {
  model_id: number;
  results: WhatIfResults;
}

export interface UploadSummary {
  teams: number;
  seasons: number;
  playoff_teams: number;
  non_playoff_teams: number;
  categories_analyzed: number;
  benchmarks_generated: number;
  correlations_calculated: number;
}

export interface UploadResponse {
  success: boolean;
  model_id: number;
  summary: UploadSummary;
}

export interface StandardGainsRequest {
  team_id: number;
  model_id: number;
}

export interface PlayerStandardGains {
  player_id: number;
  player_name: string;
  team: string;
  position: string;
  sg_calc: number;
  stats: Record<string, number>;
}

export interface StandardGainsResponse {
  status: string;
  // team_stats: Record<string, number>;
  // gaps: Record<string, number>;
  // top_hitters: PlayerStandardGains[];
  // top_pitchers: PlayerStandardGains[];
}

export interface TopPlayersRequest {
  model_id: number;
  limit?: number; // Optional parameter to specify how many players to return (default 25)
}

export interface HitterPlayer {
  HittingPlayerId: number;
  PlayerName: string;
  Team: string;
  Position: string;
  Status: string;
  Age: number;
  HittingTeamId: number | null;
  OriginalSalary: number;
  AdjustedSalary: number;
  AuctionSalary: number | null;
  G: number;
  PA: number;
  AB: number;
  H: number;
  HR: number;
  R: number;
  RBI: number;
  BB: number;
  HBP: number;
  SB: number;
  AVG: number;
  SGCalc: number;
}

export interface PitcherPlayer {
  PitchingPlayerId: number;
  PlayerName: string;
  Team: string;
  Position: string;
  Status: string;
  Age: number;
  PitchingTeamId: number | null;
  OriginalSalary: number;
  AdjustedSalary: number;
  AuctionSalary: number | null;
  W: number;
  QS: number;
  ERA: number;
  WHIP: number;
  G: number;
  SV: number;
  HLD: number;
  SVH: number;
  IP: number;
  SO: number;
  K_9: number;
  BB_9: number;
  BABIP: number;
  FIP: number;
  SGCalc: number;
}

export interface TopHittersResponse {
  model_id: number;
  hitters: HitterPlayer[];
}

export interface TopPitchersResponse {
  model_id: number;
  pitchers: PitcherPlayer[];
}

export interface TopPlayersResponse {
  model_id: number;
  hitters: HitterPlayer[];
  pitchers: PitcherPlayer[];
} 