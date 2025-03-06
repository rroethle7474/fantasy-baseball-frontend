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