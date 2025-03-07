import { useState, useCallback, useEffect } from 'react';
import PitcherRosterGrid from '../components/PitcherRosterGrid';
import StatsTable from '../components/StatsTable';
import { TeamsService } from '../services/teams.service';
import { StandingsService } from '../services/standings.service';
import { Team, Pitcher } from '../models/teams.model';
import { Standing } from '../models/standings.model';

interface PitcherStats {
  totalK: number;
  totalW: number;
  avgERA: number;
  avgWHIP: number;
  totalSH: number;
}

interface TargetPitcherStats {
  targetK: number;
  targetW: number;
  targetERA: number;
  targetWHIP: number;
  targetSH: number;
}

const Pitchers = () => {
  const [stats, setStats] = useState<PitcherStats>({
    totalK: 0,
    totalW: 0,
    avgERA: 0,
    avgWHIP: 0,
    totalSH: 0
  });
  const [targetStats, setTargetStats] = useState<TargetPitcherStats>({
    targetK: 0,
    targetW: 0,
    targetERA: 0,
    targetWHIP: 0,
    targetSH: 0
  });
  const [teams, setTeams] = useState<Team[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [teamRoster, setTeamRoster] = useState<Pitcher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [showModelSection, setShowModelSection] = useState(false);

  // Fetch teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const teamsService = new TeamsService();
        const allTeams = await teamsService.getAllTeams();
        setTeams(allTeams);
        
        // Set the first team as default if teams are available
        if (allTeams.length > 0) {
          setSelectedTeamId(allTeams[0].TeamId);
        }
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Failed to load teams. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeams();
  }, []);

  // Fetch standings on component mount
  useEffect(() => {
    const fetchStandings = async () => {
      setIsModelLoading(true);
      setModelError(null);
      
      try {
        const standingsService = new StandingsService();
        const allStandings = await standingsService.getAllStandings();
        setStandings(allStandings);
        
        // Show model section only if standings are available
        if (allStandings.length > 0) {
          setShowModelSection(true);
          setSelectedModelId(allStandings[0].ModelId);
          
          // Set initial target stats from the first standing
          setTargetStats({
            targetK: allStandings[0].K,
            targetW: allStandings[0].W,
            targetERA: allStandings[0].ERA,
            targetWHIP: allStandings[0].WHIP,
            targetSH: allStandings[0].SVH
          });
        } else {
          setShowModelSection(false);
        }
      } catch (err) {
        console.error('Error fetching standings:', err);
        setModelError('Failed to load standings. Please try again later.');
        setShowModelSection(false);
      } finally {
        setIsModelLoading(false);
      }
    };
    
    fetchStandings();
  }, []);

  // Fetch team roster when selected team changes
  const fetchTeamRoster = useCallback(async (teamId: number) => {
    if (!teamId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const teamsService = new TeamsService();
      const roster = await teamsService.getTeamPitchers(teamId);
      console.log("Roster", roster);
      setTeamRoster(roster.pitchers);
      
      // Calculate initial stats from the roster
      if (roster.pitchers.length > 0) {
        const initialStats = calculateRosterStats(roster.pitchers);
        setStats(initialStats);
      }
    } catch (err) {
      console.error('Error fetching team roster:', err);
      setError('Failed to load team roster. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update target stats when selected model changes
  const updateTargetStats = useCallback((modelId: number) => {
    const selectedStanding = standings.find(standing => standing.ModelId === modelId);
    
    if (selectedStanding) {
      setTargetStats({
        targetK: selectedStanding.K,
        targetW: selectedStanding.W,
        targetERA: selectedStanding.ERA,
        targetWHIP: selectedStanding.WHIP,
        targetSH: selectedStanding.SVH
      });
    }
  }, [standings]);

  // Fetch roster when selected team changes
  useEffect(() => {
    if (selectedTeamId) {
      fetchTeamRoster(selectedTeamId);
    }
  }, [selectedTeamId, fetchTeamRoster]);

  // Update target stats when selected model changes
  useEffect(() => {
    if (selectedModelId) {
      updateTargetStats(selectedModelId);
    }
  }, [selectedModelId, updateTargetStats]);

  // Calculate roster stats from pitchers
  const calculateRosterStats = (pitchers: Pitcher[]): PitcherStats => {
    let totalK = 0;
    let totalW = 0;
    let totalERA = 0;
    let totalWHIP = 0;
    let totalSH = 0;
    let eraCount = 0;
    let whipCount = 0;

    pitchers.forEach(pitcher => {
      totalK += pitcher.SO || 0;
      totalW += pitcher.W || 0;
      totalSH += (pitcher.SV || 0) + (pitcher.HLD || 0);
      
      if (pitcher.ERA) {
        totalERA += pitcher.ERA;
        eraCount++;
      }
      
      if (pitcher.WHIP) {
        totalWHIP += pitcher.WHIP;
        whipCount++;
      }
    });

    return {
      totalK,
      totalW,
      avgERA: eraCount > 0 ? totalERA / eraCount : 0,
      avgWHIP: whipCount > 0 ? totalWHIP / whipCount : 0,
      totalSH
    };
  };

  const handleStatsChange = useCallback((newStats: PitcherStats) => {
    setStats(newStats);
  }, []);

  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamId = parseInt(e.target.value, 10);
    setSelectedTeamId(teamId);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelId = parseInt(e.target.value, 10);
    setSelectedModelId(modelId);
  };

  const handleRefreshRoster = () => {
    if (selectedTeamId) {
      fetchTeamRoster(selectedTeamId);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      {/* Teams Dropdown */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Select Team</h2>
          {selectedTeamId && (
            <button 
              onClick={handleRefreshRoster}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Refresh Roster
                </>
              )}
            </button>
          )}
        </div>
        
        {isLoading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {teams.length > 0 ? (
          <select
            value={selectedTeamId || ''}
            onChange={handleTeamChange}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            {teams.map(team => (
              <option key={team.TeamId} value={team.TeamId}>
                {team.TeamName} - {team.Owner}
              </option>
            ))}
          </select>
        ) : (
          !isLoading && !error && <p className="text-gray-500">No teams available.</p>
        )}
      </div>

      {/* Models Dropdown - Only show if standings are available */}
      {showModelSection && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Select Model</h2>
          </div>
          
          {isModelLoading && <p className="text-gray-500">Loading models...</p>}
          {modelError && <p className="text-red-500">{modelError}</p>}
          
          {standings.length > 0 ? (
            <select
              value={selectedModelId || ''}
              onChange={handleModelChange}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isModelLoading}
            >
              {standings.map(standing => (
                <option key={standing.ModelId} value={standing.ModelId}>
                  {standing.Description}
                </option>
              ))}
            </select>
          ) : (
            !isModelLoading && !modelError && <p className="text-gray-500">No models available.</p>
          )}
        </div>
      )}

      {/* Stats Tables */}
      <div className="space-y-6">
        {/* Target Stats Table - Only show if models are available */}
        {showModelSection && (
          <StatsTable 
            title="Target Stats (Model)"
            headers={["K's", "W's", "ERA", "WHIP", "S+H"]}
            values={[targetStats.targetK, targetStats.targetW, targetStats.targetERA, targetStats.targetWHIP, targetStats.targetSH]}
          />
        )}
        
        {/* Current Roster Stats Table */}
        <StatsTable 
          title="Roster Totals"
          headers={["K's", "W's", "ERA", "WHIP", "S+H"]}
          values={[stats.totalK, stats.totalW, stats.avgERA, stats.avgWHIP, stats.totalSH]}
        />
      </div>

      {/* Roster Grid */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex flex-col space-y-6">
          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            <PitcherRosterGrid 
              onStatsChange={handleStatsChange} 
              teamId={selectedTeamId}
              teamRoster={teamRoster}
              showAddButtons={teams.length > 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pitchers; 