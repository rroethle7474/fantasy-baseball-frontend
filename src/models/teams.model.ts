// Teams model based on API documentation

export interface Team {
  TeamId: number;
  TeamName: string;
  Owner: string;
  Salary: number;
}

export interface TeamsResponse {
  teams: Team[];
}

export interface TeamResponse {
  team: Team;
}

export interface Hitter {
  HittingPlayerId: number;
  PlayerName: string;
  Team: string;
  Position: string;
  Status: string;
  Age: number;
  HittingTeamId: number | null;
  OriginalSalary: number;
  AdjustedSalary: number;
  AuctionSalary: number;
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
}

export interface Pitcher {
  PitchingPlayerId: number;
  PlayerName: string;
  Team: string;
  Position: string;
  Status: string;
  Age: number;
  PitchingTeamId: number | null;
  OriginalSalary: number;
  AdjustedSalary: number;
  AuctionSalary: number;
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
}

export interface TeamRosterResponse {
  team: Team;
  hitters: Hitter[];
  pitchers: Pitcher[];
}

export interface TeamHittersResponse {
  team: Team;
  hitters: Hitter[];
}

export interface TeamPitchersResponse {
  team: Team;
  pitchers: Pitcher[];
}

export type HitterPosition = 
  'C' | 'FirstBase' | 'SecondBase' | 'ShortStop' | 'ThirdBase' | 
  'MiddleInfielder' | 'CornerInfielder' | 'Outfield1' | 'Outfield2' | 
  'Outfield3' | 'Outfield4' | 'Outfield5' | 'Utility' | 
  'Bench1' | 'Bench2' | 'Bench3';

export type PitcherPosition = 
  'Pitcher1' | 'Pitcher2' | 'Pitcher3' | 'Pitcher4' | 'Pitcher5' |
  'Pitcher6' | 'Pitcher7' | 'Pitcher8' | 'Pitcher9' |
  'Bench1' | 'Bench2' | 'Bench3';

export interface TeamRosterStructureResponse {
  team: Team;
  hitter_positions: Record<HitterPosition, Hitter | null>;
  pitcher_positions: Record<PitcherPosition, Pitcher | null>;
}

export interface RosterUpdateRequest {
  player_type: 'hitter' | 'pitcher';
  position: HitterPosition | PitcherPosition;
  player_id: number | null;
}

export interface RosterUpdateResponse {
  success: boolean;
  message: string;
} 