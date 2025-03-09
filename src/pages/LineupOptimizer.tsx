import { useState, useEffect } from 'react';
import { TeamsService } from '../services/teams.service';
import { StandingsService } from '../services/standings.service';
import { ApiService } from '../services/api.service';
import { Team } from '../models/teams.model';
import { Standing } from '../models/standings.model';
import StatsTable from '../components/StatsTable';

// Create service instances
const teamsService = new TeamsService();
const standingsService = new StandingsService();
const apiService = new ApiService();

// Interface for the request body
interface OptimalLineupRequest {
  team_id: number;
  model_id: number;
  budget: number;
  lineup_type: 'hitting' | 'pitching' | 'both';
  bench_positions: number;
}

// Interface for a player in the optimal lineup
interface OptimalPlayer {
  player_id: number;
  name: string;
  position: string;
  salary: number;
  sg_value: number;
}

// Interface for the response
interface OptimalLineupResponse {
  status: string;
  message: string;
  optimal_lineup: OptimalPlayer[];
  total_cost: number;
  total_sg_value: number;
  required_positions?: string[];
  hitter_positions?: string[];
  pitcher_positions?: string[];
  optimized_hitting_stats: {
    R: number;
    HR: number;
    RBI: number;
    SB: number;
    AVG: number;
  } | Record<string, number | string>;
  optimized_pitching_stats: {
    W: number;
    K: number;
    ERA: number;
    WHIP: number;
    SVH: number;
  } | Record<string, number | string>;
}

const LineupOptimizer = () => {
  // State for form inputs
  const [teams, setTeams] = useState<Team[]>([]);
  const [models, setModels] = useState<Standing[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | ''>('');
  const [selectedModel, setSelectedModel] = useState<number | ''>('');
  const [selectedModelData, setSelectedModelData] = useState<Standing | null>(null);
  const [budget, setBudget] = useState<number | ''>('');
  const [lineupType, setLineupType] = useState<'hitting' | 'pitching' | 'both'>('hitting');
  const [benchPositions, setBenchPositions] = useState<number | ''>('');
  
  // State for API response
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [optimizedLineup, setOptimizedLineup] = useState<OptimalLineupResponse | null>(null);

  // Fetch teams and models on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsData, modelsData] = await Promise.all([
          teamsService.getAllTeams(),
          standingsService.getAllStandings()
        ]);
        
        setTeams(teamsData);
        setModels(modelsData);
        
        // Set default selections to the first item in each list if available
        if (teamsData.length > 0) {
          setSelectedTeam(teamsData[0].TeamId);
        }
        
        if (modelsData.length > 0) {
          setSelectedModel(modelsData[0].ModelId);
          setSelectedModelData(modelsData[0]);
        }

        // Set default values for budget and bench positions
        setBudget(100);
        setBenchPositions(1);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch teams or models. Please try again later.');
      }
    };
    
    fetchData();
  }, []);

  // Update selected model data when model selection changes
  useEffect(() => {
    if (selectedModel && models.length > 0) {
      const modelData = models.find(model => model.ModelId === Number(selectedModel));
      if (modelData) {
        setSelectedModelData(modelData);
      }
    }
  }, [selectedModel, models]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTeam || !selectedModel || budget === '' || benchPositions === '') {
      setError('Please fill in all required fields.');
      return;
    }
    
    const request: OptimalLineupRequest = {
      team_id: Number(selectedTeam),
      model_id: Number(selectedModel),
      budget: Number(budget),
      lineup_type: lineupType,
      bench_positions: Number(benchPositions)
    };
    
    try {
      setLoading(true);
      setError(null);
      setOptimizedLineup(null); // Clear previous results
      
      // Call the API endpoint
      const response = await apiService.post<OptimalLineupResponse>(
        '/generate-optimal-lineup', 
        request as unknown as Record<string, unknown>
      );
      console.log("RESPONSE", response);
      // Validate response structure
      if (!response || 
          response.status !== 'success' || 
          !Array.isArray(response.optimal_lineup) || 
          typeof response.total_cost !== 'number' || 
          typeof response.total_sg_value !== 'number') {
        throw new Error('Invalid response format from server');
      }
      
      // Ensure the stats objects exist and have the right structure
      if (!response.optimized_hitting_stats || typeof response.optimized_hitting_stats !== 'object') {
        console.warn('Missing or invalid optimized_hitting_stats in response');
        response.optimized_hitting_stats = { R: 0, HR: 0, RBI: 0, SB: 0, AVG: 0 };
      }
      
      if (!response.optimized_pitching_stats || typeof response.optimized_pitching_stats !== 'object') {
        console.warn('Missing or invalid optimized_pitching_stats in response');
        response.optimized_pitching_stats = { W: 0, K: 0, ERA: 0, WHIP: 0, SVH: 0 };
      }
      
      // Convert any string values to numbers in the stats objects
      const convertToNumber = (value: string | number | unknown): number => {
        if (typeof value === 'string') {
          return parseFloat(value);
        }
        if (typeof value === 'number') {
          return value;
        }
        return 0; // Default fallback
      };
      
      // Ensure hitting stats are numbers
      if (response.optimized_hitting_stats) {
        response.optimized_hitting_stats.R = convertToNumber(response.optimized_hitting_stats.R);
        response.optimized_hitting_stats.HR = convertToNumber(response.optimized_hitting_stats.HR);
        response.optimized_hitting_stats.RBI = convertToNumber(response.optimized_hitting_stats.RBI);
        response.optimized_hitting_stats.SB = convertToNumber(response.optimized_hitting_stats.SB);
        response.optimized_hitting_stats.AVG = convertToNumber(response.optimized_hitting_stats.AVG);
      }
      
      // Ensure pitching stats are numbers
      if (response.optimized_pitching_stats) {
        response.optimized_pitching_stats.W = convertToNumber(response.optimized_pitching_stats.W);
        response.optimized_pitching_stats.K = convertToNumber(response.optimized_pitching_stats.K);
        response.optimized_pitching_stats.ERA = convertToNumber(response.optimized_pitching_stats.ERA);
        response.optimized_pitching_stats.WHIP = convertToNumber(response.optimized_pitching_stats.WHIP);
        response.optimized_pitching_stats.SVH = convertToNumber(response.optimized_pitching_stats.SVH);
      }
      
      setOptimizedLineup(response);
    } catch (err) {
      console.error('Error generating optimal lineup:', err);
      setError('Failed to generate optimal lineup. The server may be unavailable or the endpoint is not fully implemented yet.');
      setOptimizedLineup(null);
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    // Check if all required fields have values
    if (selectedTeam === '' || selectedModel === '' || budget === '' || benchPositions === '') {
      return false;
    }
    
    // Check if budget is greater than 1
    if (typeof budget === 'number' && budget <= 1) {
      return false;
    }
    
    // Check if bench positions is less than or equal to 3
    if (typeof benchPositions === 'number' && benchPositions > 3) {
      return false;
    }
    
    return true;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="page-title">Lineup Optimizer</h1>
        <p className="page-subtitle">
          Generate the most optimal lineup based on the available players.
        </p>
      </div>
      
      {/* Stats Tables Section */}
      {selectedModelData && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Model Stats: {selectedModelData.Description}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hitting Stats */}
            <StatsTable 
              title="Desired Hitting Stats"
              headers={['R', 'HR', 'RBI', 'SB', 'AVG']}
              values={[
                selectedModelData.R,
                selectedModelData.HR,
                selectedModelData.RBI,
                selectedModelData.SB,
                selectedModelData.AVG
              ]}
            />
            
            {/* Pitching Stats */}
            <StatsTable 
              title="Desired Pitching Stats"
              headers={['W', 'K', 'ERA', 'WHIP', 'SVH']}
              values={[
                selectedModelData.W,
                selectedModelData.K,
                selectedModelData.ERA,
                selectedModelData.WHIP,
                selectedModelData.SVH
              ]}
            />
          </div>
        </div>
      )}
      
      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Optimization Parameters</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Team Selection */}
            <div className="form-group">
              <label htmlFor="team" className="form-label">Team</label>
              <select 
                id="team"
                className="form-select"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value ? Number(e.target.value) : '')}
                required
              >
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team.TeamId} value={team.TeamId}>
                    {team.TeamName} ({team.Owner})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Model Selection */}
            <div className="form-group">
              <label htmlFor="model" className="form-label">Model</label>
              <select 
                id="model"
                className="form-select"
                value={selectedModel}
                onChange={(e) => {
                  const modelId = e.target.value ? Number(e.target.value) : '';
                  setSelectedModel(modelId);
                  
                  if (modelId !== '' && models.length > 0) {
                    const modelData = models.find(model => model.ModelId === modelId);
                    if (modelData) {
                      setSelectedModelData(modelData);
                    }
                  }
                }}
                required
              >
                <option value="">Select a model</option>
                {models.map((model) => (
                  <option key={model.ModelId} value={model.ModelId}>
                    {model.Description}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Budget Input */}
            <div className="form-group">
              <label htmlFor="budget" className="form-label">Budget ($)</label>
              <input 
                type="number"
                id="budget"
                className="form-input"
                value={budget}
                onChange={(e) => {
                  const value = e.target.value;
                  setBudget(value === '' ? '' : Number(value));
                }}
                min="1"
                step="0.1"
                placeholder="Enter budget amount"
                required
              />
              {typeof budget === 'number' && budget <= 1 && (
                <p className="text-red-500 text-sm mt-1">Budget must be greater than $1</p>
              )}
            </div>
            
            {/* Lineup Type Selection */}
            <div className="form-group">
              <label htmlFor="lineupType" className="form-label">Lineup Type</label>
              <select 
                id="lineupType"
                className="form-select"
                value={lineupType}
                onChange={(e) => setLineupType(e.target.value as 'hitting' | 'pitching' | 'both')}
                required
              >
                <option value="hitting">Hitting</option>
                <option value="pitching">Pitching</option>
                <option value="both">Both</option>
              </select>
            </div>
            
            {/* Bench Positions Input */}
            <div className="form-group">
              <div className="flex items-center">
                <label htmlFor="benchPositions" className="form-label mr-2">Bench Positions</label>
                <div className="relative group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 cursor-help" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute z-10 w-64 p-2 bg-gray-800 text-white text-sm rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                    {lineupType === 'both' 
                      ? "If Both is selected, bench positions refers to Hitters with Pitchers getting the remaining bench positions" 
                      : `Number of bench positions for ${lineupType === 'hitting' ? 'hitters' : 'pitchers'}`}
                    <div className="absolute w-3 h-3 bg-gray-800 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"></div>
                  </div>
                </div>
              </div>
              <input 
                type="number"
                id="benchPositions"
                className="form-input"
                value={benchPositions}
                onChange={(e) => {
                  const value = e.target.value;
                  setBenchPositions(value === '' ? '' : Number(value));
                }}
                min="0"
                max="3"
                placeholder="Enter bench positions"
                required
              />
              {typeof benchPositions === 'number' && benchPositions > 3 && (
                <p className="text-red-500 text-sm mt-1">Maximum 3 bench positions allowed</p>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <button 
              type="submit" 
              className="btn btn-primary px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              disabled={loading || !isFormValid()}
            >
              {loading ? 'Optimizing...' : 'Generate Optimal Lineup'}
            </button>
          </div>
        </form>
        
        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>
      
      {/* Results Section */}
      {optimizedLineup && optimizedLineup.optimal_lineup && optimizedLineup.optimal_lineup.length > 0 ? (
        <>
          {/* Optimized Team Stats Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Optimized Team Stats</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Optimized Hitting Stats */}
              {(lineupType === 'hitting' || lineupType === 'both') && (
                <StatsTable 
                  title="Optimized Hitting Stats"
                  headers={['R', 'HR', 'RBI', 'SB', 'AVG']}
                  values={[
                    // Safely access and convert stats
                    typeof optimizedLineup.optimized_hitting_stats?.R === 'number' 
                      ? optimizedLineup.optimized_hitting_stats.R 
                      : typeof optimizedLineup.optimized_hitting_stats?.R === 'string'
                        ? parseFloat(optimizedLineup.optimized_hitting_stats.R)
                        : 0,
                    typeof optimizedLineup.optimized_hitting_stats?.HR === 'number' 
                      ? optimizedLineup.optimized_hitting_stats.HR 
                      : typeof optimizedLineup.optimized_hitting_stats?.HR === 'string'
                        ? parseFloat(optimizedLineup.optimized_hitting_stats.HR)
                        : 0,
                    typeof optimizedLineup.optimized_hitting_stats?.RBI === 'number' 
                      ? optimizedLineup.optimized_hitting_stats.RBI 
                      : typeof optimizedLineup.optimized_hitting_stats?.RBI === 'string'
                        ? parseFloat(optimizedLineup.optimized_hitting_stats.RBI)
                        : 0,
                    typeof optimizedLineup.optimized_hitting_stats?.SB === 'number' 
                      ? optimizedLineup.optimized_hitting_stats.SB 
                      : typeof optimizedLineup.optimized_hitting_stats?.SB === 'string'
                        ? parseFloat(optimizedLineup.optimized_hitting_stats.SB)
                        : 0,
                    typeof optimizedLineup.optimized_hitting_stats?.AVG === 'number' 
                      ? optimizedLineup.optimized_hitting_stats.AVG 
                      : typeof optimizedLineup.optimized_hitting_stats?.AVG === 'string'
                        ? parseFloat(optimizedLineup.optimized_hitting_stats.AVG)
                        : 0
                  ]}
                />
              )}
              
              {/* Optimized Pitching Stats */}
              {(lineupType === 'pitching' || lineupType === 'both') && (
                <StatsTable 
                  title="Optimized Pitching Stats"
                  headers={['W', 'K', 'ERA', 'WHIP', 'SVH']}
                  values={[
                    // Safely access and convert stats
                    typeof optimizedLineup.optimized_pitching_stats?.W === 'number' 
                      ? optimizedLineup.optimized_pitching_stats.W 
                      : typeof optimizedLineup.optimized_pitching_stats?.W === 'string'
                        ? parseFloat(optimizedLineup.optimized_pitching_stats.W)
                        : 0,
                    typeof optimizedLineup.optimized_pitching_stats?.K === 'number' 
                      ? optimizedLineup.optimized_pitching_stats.K 
                      : typeof optimizedLineup.optimized_pitching_stats?.K === 'string'
                        ? parseFloat(optimizedLineup.optimized_pitching_stats.K)
                        : 0,
                    typeof optimizedLineup.optimized_pitching_stats?.ERA === 'number' 
                      ? optimizedLineup.optimized_pitching_stats.ERA 
                      : typeof optimizedLineup.optimized_pitching_stats?.ERA === 'string'
                        ? parseFloat(optimizedLineup.optimized_pitching_stats.ERA)
                        : 0,
                    typeof optimizedLineup.optimized_pitching_stats?.WHIP === 'number' 
                      ? optimizedLineup.optimized_pitching_stats.WHIP 
                      : typeof optimizedLineup.optimized_pitching_stats?.WHIP === 'string'
                        ? parseFloat(optimizedLineup.optimized_pitching_stats.WHIP)
                        : 0,
                    typeof optimizedLineup.optimized_pitching_stats?.SVH === 'number' 
                      ? optimizedLineup.optimized_pitching_stats.SVH 
                      : typeof optimizedLineup.optimized_pitching_stats?.SVH === 'string'
                        ? parseFloat(optimizedLineup.optimized_pitching_stats.SVH)
                        : 0
                  ]}
                />
              )}
            </div>
          </div>
          
          {/* Lineup Results Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Optimal Lineup</h2>
              <div className="text-right">
                <div className="text-sm">Total Cost: <span className="font-semibold">${optimizedLineup.total_cost.toFixed(2)}</span></div>
                <div className="text-sm">Total SG Value: <span className="font-semibold">{optimizedLineup.total_sg_value.toFixed(2)}</span></div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SG Value</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {optimizedLineup.optimal_lineup.map((player) => (
                    <tr key={player.player_id}>
                      <td className="px-6 py-4 whitespace-nowrap">{player.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{player.position}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${player.salary.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{player.sg_value.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        optimizedLineup && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-4">
              <p className="text-lg text-gray-600">No players found in the optimized lineup.</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your parameters and try again.</p>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default LineupOptimizer; 