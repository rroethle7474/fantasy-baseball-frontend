import React, { useState, useEffect, useCallback } from 'react';
import AddPlayerModal from './AddPlayerModal';
import { Pitcher } from '../models/teams.model';
import { TeamsService } from '../services/teams.service';
import { RosterUpdateRequest, PitcherPosition } from '../models/teams.model';

interface PitcherPlayer {
  name: string;
  k: string;
  w: string;
  era: string;
  whip: string;
  svh: string; // Saves + Holds
}

interface RosterPosition {
  position: string;
  apiPosition: PitcherPosition; // Store the API position directly
  player: PitcherPlayer | null;
}

interface PitcherStats {
  totalK: number;
  totalW: number;
  avgERA: number;
  avgWHIP: number;
  totalSH: number;
}

interface PitcherRosterGridProps {
  onStatsChange?: (stats: PitcherStats) => void;
  teamId?: number | null;
  teamRoster?: Pitcher[];
  showAddButtons?: boolean;
}

const PitcherRosterGrid: React.FC<PitcherRosterGridProps> = ({ 
  onStatsChange, 
  teamId = null, 
  teamRoster = [], 
  showAddButtons = true 
}) => {
  // Initial roster setup with all positions
  const [roster, setRoster] = useState<RosterPosition[]>([
    { position: 'P1', apiPosition: 'Pitcher1', player: null },
    { position: 'P2', apiPosition: 'Pitcher2', player: null },
    { position: 'P3', apiPosition: 'Pitcher3', player: null },
    { position: 'P4', apiPosition: 'Pitcher4', player: null },
    { position: 'P5', apiPosition: 'Pitcher5', player: null },
    { position: 'P6', apiPosition: 'Pitcher6', player: null },
    { position: 'P7', apiPosition: 'Pitcher7', player: null },
    { position: 'P8', apiPosition: 'Pitcher8', player: null },
    { position: 'P9', apiPosition: 'Pitcher9', player: null },
    { position: 'Bench1', apiPosition: 'Bench1', player: null },
    { position: 'Bench2', apiPosition: 'Bench2', player: null },
    { position: 'Bench3', apiPosition: 'Bench3', player: null },
  ]);

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPositionIndex, setSelectedPositionIndex] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);

  // Function to refresh roster data
  const refreshRoster = useCallback(async () => {
    if (!teamId) return;
    
    setIsRefreshing(true);
    try {
      const teamsService = new TeamsService();
      
      // Get the roster structure to map players to their correct positions
      const rosterStructure = await teamsService.getTeamRosterStructure(teamId);
      console.log("Roster Structure:", rosterStructure);
      
      // Use functional update to avoid dependency on roster
      setRoster(prevRoster => {
        const updatedRoster = [...prevRoster];
        
        // Reset all positions
        updatedRoster.forEach(pos => {
          pos.player = null;
        });
        
        // Map pitchers to their correct positions based on the roster structure
        if (rosterStructure.pitcher_positions) {
          Object.entries(rosterStructure.pitcher_positions).forEach(([position, pitcher]) => {
            if (pitcher) {
              // Find the matching position in our roster
              const rosterIndex = updatedRoster.findIndex(pos => pos.apiPosition === position);
              if (rosterIndex >= 0) {
                updatedRoster[rosterIndex].player = {
                  name: pitcher.PlayerName,
                  k: pitcher.SO?.toString() || '',
                  w: pitcher.W?.toString() || '',
                  era: pitcher.ERA?.toString() || '',
                  whip: pitcher.WHIP?.toString() || '',
                  svh: ((pitcher.SV || 0) + (pitcher.HLD || 0)).toString(),
                };
              }
            }
          });
        }
        
        return updatedRoster;
      });
    } catch (error) {
      console.error('Error refreshing roster:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [teamId]);

  // Update roster when teamRoster changes
  useEffect(() => {
    if (teamRoster && teamRoster.length > 0 && teamId) {
      const fetchRosterStructure = async () => {
        try {
          const teamsService = new TeamsService();
          const rosterStructure = await teamsService.getTeamRosterStructure(teamId);
          console.log("Roster Structure:", rosterStructure);
          // Use functional update to avoid dependency on roster
          setRoster(prevRoster => {
            const updatedRoster = [...prevRoster];
            
            // Reset all positions
            updatedRoster.forEach(pos => {
              pos.player = null;
            });
            
            // Map pitchers to their correct positions based on the roster structure
            if (rosterStructure.pitcher_positions) {
              Object.entries(rosterStructure.pitcher_positions).forEach(([position, pitcher]) => {
                if (pitcher) {
                  // Find the matching position in our roster
                  const rosterIndex = updatedRoster.findIndex(pos => pos.apiPosition === position);
                  if (rosterIndex >= 0) {
                    updatedRoster[rosterIndex].player = {
                      name: pitcher.PlayerName,
                      k: pitcher.SO?.toString() || '',
                      w: pitcher.W?.toString() || '',
                      era: pitcher.ERA?.toString() || '',
                      whip: pitcher.WHIP?.toString() || '',
                      svh: pitcher.SVH?.toString() || '',
                    };
                  }
                }
              });
            }
            
            return updatedRoster;
          });
        } catch (error) {
          console.error('Error fetching roster structure:', error);
        }
      };
      
      fetchRosterStructure();
    }
  }, [teamRoster, teamId]);

  // Calculate totals whenever roster changes
  useEffect(() => {
    const calculateStats = (): PitcherStats => {
      let totalK = 0;
      let totalW = 0;
      let totalERA = 0;
      let totalWHIP = 0;
      let totalSH = 0;
      let eraCount = 0;
      let whipCount = 0;

      roster.forEach(position => {
        if (position.player && position.player.name) {
          // Parse numeric values, defaulting to 0 if invalid
          const k = parseFloat(position.player.k) || 0;
          const w = parseFloat(position.player.w) || 0;
          const svh = parseFloat(position.player.svh) || 0;
          
          // Only include valid ERA and WHIP values in the average calculation
          const era = parseFloat(position.player.era);
          if (!isNaN(era)) {
            totalERA += era;
            eraCount++;
          }
          
          const whip = parseFloat(position.player.whip);
          if (!isNaN(whip)) {
            totalWHIP += whip;
            whipCount++;
          }

          totalK += k;
          totalW += w;
          totalSH += svh;
        }
      });

      // Calculate averages, avoiding division by zero
      const avgERA = eraCount > 0 ? totalERA / eraCount : 0;
      const avgWHIP = whipCount > 0 ? totalWHIP / whipCount : 0;

      return {
        totalK,
        totalW,
        avgERA,
        avgWHIP,
        totalSH
      };
    };

    const stats = calculateStats();
    if (onStatsChange) {
      onStatsChange(stats);
    }
  }, [roster, onStatsChange]);

  // Open modal to add a player
  const openAddPlayerModal = (index: number) => {
    setSelectedPositionIndex(index);
    setIsModalOpen(true);
  };

  // Handle adding a player from the modal
  const handleAddPlayer = () => {
    // After a player is added via the API, refresh the roster data
    refreshRoster();
  };

  // Handle removing a player
  const handleRemovePlayer = async (index: number) => {
    if (!teamId) return;
    
    const apiPosition = roster[index].apiPosition;
    
    setIsRemoving(index);
    
    try {
      const teamsService = new TeamsService();
      
      const updateRequest: RosterUpdateRequest = {
        player_type: 'pitcher',
        position: apiPosition,
        player_id: null // Setting to null to remove the player
      };
      
      const response = await teamsService.updateTeamRoster(teamId, updateRequest);
      
      if (response.success) {
        // Refresh the roster to show the updated data
        refreshRoster();
      } else {
        console.error('Failed to remove player:', response.message);
      }
    } catch (error) {
      console.error('Error removing player:', error);
    } finally {
      setIsRemoving(null);
    }
  };

  // Helper function to display a more user-friendly position name
  const getDisplayPosition = (position: string): string => {
    // Strip numbers from positions for display purposes
    return position.replace(/\d+$/, '');
  };

  return (
    <div className="space-y-4">
      {isRefreshing && (
        <div className="text-center py-2">
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
          <span className="text-sm text-gray-600">Refreshing roster...</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        {/* Header row */}
        <div className="grid grid-cols-7 gap-2 px-4 py-2 bg-gray-100 rounded-lg font-semibold text-gray-700">
          <div className="col-span-2">Pos Player</div>
          <div className="text-center">K</div>
          <div className="text-center">W</div>
          <div className="text-center">ERA</div>
          <div className="text-center">WHIP</div>
          <div className="text-center">S+H</div>
        </div>
        
        {/* Player rows */}
        {roster.map((position, index) => (
          <div 
            key={`${position.position}-${index}`} 
            className="grid grid-cols-7 gap-2 px-4 py-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="col-span-2 flex items-center gap-2">
              <span className="font-medium text-gray-800 min-w-[30px]">{getDisplayPosition(position.position)}</span>
              {position.player ? (
                <div className="w-full p-2 border rounded-lg bg-gray-50 text-gray-800 flex justify-between items-center">
                  <span>{position.player.name}</span>
                  <button
                    onClick={() => handleRemovePlayer(index)}
                    disabled={isRemoving === index}
                    className="text-red-500 hover:text-red-700 focus:outline-none"
                    title="Remove pitcher"
                  >
                    {isRemoving === index ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    )}
                  </button>
                </div>
              ) : (
                showAddButtons ? (
                  <button 
                    onClick={() => openAddPlayerModal(index)}
                    className="w-full p-2 text-blue-600 hover:text-blue-800 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-center"
                  >
                    Add pitcher
                  </button>
                ) : (
                  <span className="w-full p-2 text-gray-400 border border-dashed border-gray-200 rounded-lg text-center">
                    Select a team first
                  </span>
                )
              )}
            </div>
            
            {position.player && (
              <>
                <div className="w-full p-2 border rounded-lg bg-gray-50 text-center">
                  {position.player.k}
                </div>
                <div className="w-full p-2 border rounded-lg bg-gray-50 text-center">
                  {position.player.w}
                </div>
                <div className="w-full p-2 border rounded-lg bg-gray-50 text-center">
                  {position.player.era}
                </div>
                <div className="w-full p-2 border rounded-lg bg-gray-50 text-center">
                  {position.player.whip}
                </div>
                <div className="w-full p-2 border rounded-lg bg-gray-50 text-center">
                  {position.player.svh}
                </div>
              </>
            )}
            
            {!position.player && <div className="col-span-5"></div>}
          </div>
        ))}
      </div>

      {/* Add Player Modal */}
      {selectedPositionIndex !== null && (
        <AddPlayerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          position={roster[selectedPositionIndex].position}
          apiPosition={roster[selectedPositionIndex].apiPosition}
          playerType="pitcher"
          onAddPlayer={handleAddPlayer}
          teamId={teamId}
        />
      )}
    </div>
  );
};

// Export the memoized component to prevent unnecessary re-renders
export default React.memo(PitcherRosterGrid); 