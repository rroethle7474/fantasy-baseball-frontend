import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { ModelsService } from '../services/models.service';
import { TeamsService } from '../services/teams.service';
import { StandingsService } from '../services/standings.service';
import { PlayersService } from '../services/players.service';
import { Standing } from '../models/standings.model';
import { Team } from '../models/teams.model';
import { StandardGainsResponse, HitterPlayer, PitcherPlayer } from '../models/models.model';

const Home = () => {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StandardGainsResponse | null>(null);
  
  // States for NA players
  const [naHitters, setNAHitters] = useState<HitterPlayer[]>([]);
  const [naPitchers, setNAPitchers] = useState<PitcherPlayer[]>([]);
  const [filteredNAHitters, setFilteredNAHitters] = useState<HitterPlayer[]>([]);
  const [filteredNAPitchers, setFilteredNAPitchers] = useState<PitcherPlayer[]>([]);
  const [hitterSearchTerm, setHitterSearchTerm] = useState<string>('');
  const [pitcherSearchTerm, setPitcherSearchTerm] = useState<string>('');
  const [isLoadingNAHitters, setIsLoadingNAHitters] = useState<boolean>(false);
  const [isLoadingNAPitchers, setIsLoadingNAPitchers] = useState<boolean>(false);
  
  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [playerToUpdate, setPlayerToUpdate] = useState<{ type: 'hitter' | 'pitcher', id: number, name: string } | null>(null);

  // Use useMemo to prevent recreating service instances on each render
  const modelsService = useMemo(() => new ModelsService(), []);
  const teamsService = useMemo(() => new TeamsService(), []);
  const standingsService = useMemo(() => new StandingsService(), []);
  const playersService = useMemo(() => new PlayersService(), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [standingsData, teamsData] = await Promise.all([
          standingsService.getAllStandings(),
          teamsService.getAllTeams()
        ]);
        
        setStandings(standingsData);
        setTeams(teamsData);
        
        // Set default selections if data is available
        if (standingsData.length > 0) {
          setSelectedModelId(standingsData[0].ModelId);
        }
        
        if (teamsData.length > 0) {
          setSelectedTeamId(teamsData[0].TeamId);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load standings and teams data');
      }
    };

    fetchData();
  }, [standingsService, teamsService]);
  
  // Fetch NA hitters
  useEffect(() => {
    const fetchNAHitters = async () => {
      setIsLoadingNAHitters(true);
      try {
        const hitters = await playersService.getNAHitters();
        setNAHitters(hitters);
        setFilteredNAHitters(hitters);
      } catch (err) {
        console.error('Error fetching NA hitters:', err);
      } finally {
        setIsLoadingNAHitters(false);
      }
    };
    
    fetchNAHitters();
  }, [playersService]);
  
  // Fetch NA pitchers
  useEffect(() => {
    const fetchNAPitchers = async () => {
      setIsLoadingNAPitchers(true);
      try {
        const pitchers = await playersService.getNAPitchers();
        setNAPitchers(pitchers);
        setFilteredNAPitchers(pitchers);
      } catch (err) {
        console.error('Error fetching NA pitchers:', err);
      } finally {
        setIsLoadingNAPitchers(false);
      }
    };
    
    fetchNAPitchers();
  }, [playersService]);
  
  // Filter NA hitters based on search term
  useEffect(() => {
    if (!hitterSearchTerm.trim()) {
      setFilteredNAHitters(naHitters);
      return;
    }
    
    const searchTerm = hitterSearchTerm.toLowerCase().trim();
    const filtered = naHitters.filter(hitter => 
      hitter.PlayerName.toLowerCase().includes(searchTerm)
    );
    
    setFilteredNAHitters(filtered);
  }, [hitterSearchTerm, naHitters]);
  
  // Filter NA pitchers based on search term
  useEffect(() => {
    if (!pitcherSearchTerm.trim()) {
      setFilteredNAPitchers(naPitchers);
      return;
    }
    
    const searchTerm = pitcherSearchTerm.toLowerCase().trim();
    const filtered = naPitchers.filter(pitcher => 
      pitcher.PlayerName.toLowerCase().includes(searchTerm)
    );
    
    setFilteredNAPitchers(filtered);
  }, [pitcherSearchTerm, naPitchers]);

  const handleCalculateStandardGains = async () => {
    if (!selectedModelId || !selectedTeamId) {
      setError('Please select both a model and a team');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await modelsService.calculateStandardGains(
        selectedTeamId,
        selectedModelId
      );
      console.log("Response:", response);
      setResult(response);
    } catch (err) {
      console.error('Error calculating standard gains:', err);
      setError('Failed to calculate standard gains');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle showing the confirmation dialog
  const handleSetFreeAgentClick = (type: 'hitter' | 'pitcher', id: number, name: string) => {
    setPlayerToUpdate({ type, id, name });
    setShowConfirmDialog(true);
  };
  
  // Handle confirming player update
  const handleConfirmSetFreeAgent = async () => {
    if (!playerToUpdate) return;
    
    try {
      const { type, id } = playerToUpdate;
      const response = await playersService.setPlayerAsFreeAgent(type, id);
      
      if (response.success) {
        // Refresh the data
        if (type === 'hitter') {
          const hitters = await playersService.getNAHitters();
          setNAHitters(hitters);
          setFilteredNAHitters(hitterSearchTerm ? 
            hitters.filter(h => h.PlayerName.toLowerCase().includes(hitterSearchTerm.toLowerCase())) : 
            hitters
          );
        } else {
          const pitchers = await playersService.getNAPitchers();
          setNAPitchers(pitchers);
          setFilteredNAPitchers(pitcherSearchTerm ? 
            pitchers.filter(p => p.PlayerName.toLowerCase().includes(pitcherSearchTerm.toLowerCase())) : 
            pitchers
          );
        }
      } else {
        setError('Failed to update player status. Please try again.');
      }
    } catch (err) {
      console.error('Error updating player status:', err);
      setError('Failed to update player status. Please try again later.');
    } finally {
      setShowConfirmDialog(false);
      setPlayerToUpdate(null);
    }
  };
  
  // Handle canceling player update
  const handleCancelSetFreeAgent = () => {
    setShowConfirmDialog(false);
    setPlayerToUpdate(null);
  };

  return (
    <div>
      <div>
        <h1 className="page-title">Welcome to Fantasy Baseball</h1>
        <p className="page-subtitle">
          Your one-stop destination for fantasy baseball player analysis and statistics.
        </p>
      </div>
      
      <div className="card-grid mb-16">
        <div className="card">
          <h2 className="card-title">Hitter Analysis</h2>
          <p className="card-text">
            Explore detailed statistics and projections for MLB hitters to make informed fantasy decisions.
          </p>
          <Link 
            to="/hitters" 
            className="button"
          >
            View Hitters
          </Link>
        </div>
        <div className="card">
          <h2 className="card-title">Pitcher Analysis</h2>
          <p className="card-text">
            Analyze performance metrics and projections for MLB pitchers to optimize your fantasy roster.
          </p>
          <Link 
            to="/pitchers" 
            className="button"
          >
            View Pitchers
          </Link>
        </div>
        <div className="card">
          <h2 className="card-title">Generate Standard Gains</h2>
          <p className="card-text">
            Calculate standard gains values for available players based on your team's stats and model thresholds.
          </p>
          
          <div className="form-group mb-4">
            <label htmlFor="modelSelect" className="form-label">Select Model:</label>
            <select 
              id="modelSelect"
              className="form-select"
              value={selectedModelId || ''}
              onChange={(e) => setSelectedModelId(Number(e.target.value))}
              disabled={standings.length === 0}
            >
              {standings.length === 0 && <option value="">No models available</option>}
              {standings.map((standing) => (
                <option key={standing.ModelId} value={standing.ModelId}>
                  {standing.Description}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group mb-4">
            <label htmlFor="teamSelect" className="form-label">Select Team:</label>
            <select 
              id="teamSelect"
              className="form-select"
              value={selectedTeamId || ''}
              onChange={(e) => setSelectedTeamId(Number(e.target.value))}
              disabled={teams.length === 0}
            >
              {teams.length === 0 && <option value="">No teams available</option>}
              {teams.map((team) => (
                <option key={team.TeamId} value={team.TeamId}>
                  {team.TeamName}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className={`button ${isLoading ? 'loading' : ''}`}
            onClick={handleCalculateStandardGains}
            disabled={isLoading || !selectedModelId || !selectedTeamId}
          >
            {isLoading ? 'Calculating...' : 'Calculate Standard Gains'}
          </button>
          
          {error && (
            <div className="error-message mt-4">
              {error}
            </div>
          )}
          
          {result && (
            <div className="success-message mt-4">
              <p>Standard gains calculated successfully!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      {showConfirmDialog && playerToUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Status Update</h3>
            <p className="mb-6">
              Are you sure you want to set {playerToUpdate.name} as a free agent?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={handleCancelSetFreeAgent}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleConfirmSetFreeAgent}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* NA Hitters Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Re-add Hitter to Free Agency</h2>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search hitters by name..."
            className="form-input w-full md:w-1/2 lg:w-1/3"
            value={hitterSearchTerm}
            onChange={(e) => setHitterSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-300">
          {isLoadingNAHitters ? (
            <div className="text-center py-4">Loading hitters...</div>
          ) : filteredNAHitters.length === 0 ? (
            <div className="text-center py-4">No NA status hitters found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg">
                <thead className="bg-gray-100">
                  <tr className="border-b border-gray-300">
                    <th className="px-4 py-2 text-left">Actions</th>
                    <th className="px-4 py-2 text-left">Player</th>
                    <th className="px-4 py-2 text-left">Team</th>
                    <th className="px-4 py-2 text-left">Position</th>
                    <th className="px-4 py-2 text-right">Age</th>
                    <th className="px-4 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNAHitters.map((hitter) => (
                    <tr key={hitter.HittingPlayerId} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleSetFreeAgentClick('hitter', hitter.HittingPlayerId, hitter.PlayerName)}
                          title="Set as free agent"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                      <td className="px-4 py-2">{hitter.PlayerName}</td>
                      <td className="px-4 py-2">{hitter.Team}</td>
                      <td className="px-4 py-2">{hitter.Position}</td>
                      <td className="px-4 py-2 text-right">{hitter.Age}</td>
                      <td className="px-4 py-2 text-right">{hitter.Status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* NA Pitchers Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Re-add Pitcher to Free Agency</h2>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search pitchers by name..."
            className="form-input w-full md:w-1/2 lg:w-1/3"
            value={pitcherSearchTerm}
            onChange={(e) => setPitcherSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-300">
          {isLoadingNAPitchers ? (
            <div className="text-center py-4">Loading pitchers...</div>
          ) : filteredNAPitchers.length === 0 ? (
            <div className="text-center py-4">No NA status pitchers found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg">
                <thead className="bg-gray-100">
                  <tr className="border-b border-gray-300">
                    <th className="px-4 py-2 text-left">Actions</th>
                    <th className="px-4 py-2 text-left">Player</th>
                    <th className="px-4 py-2 text-left">Team</th>
                    <th className="px-4 py-2 text-left">Position</th>
                    <th className="px-4 py-2 text-right">Age</th>
                    <th className="px-4 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNAPitchers.map((pitcher) => (
                    <tr key={pitcher.PitchingPlayerId} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleSetFreeAgentClick('pitcher', pitcher.PitchingPlayerId, pitcher.PlayerName)}
                          title="Set as free agent"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                      <td className="px-4 py-2">{pitcher.PlayerName}</td>
                      <td className="px-4 py-2">{pitcher.Team}</td>
                      <td className="px-4 py-2">{pitcher.Position}</td>
                      <td className="px-4 py-2 text-right">{pitcher.Age}</td>
                      <td className="px-4 py-2 text-right">{pitcher.Status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home; 