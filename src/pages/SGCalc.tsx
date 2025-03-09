import { useState, useEffect, useMemo } from 'react';
import { PlayersService } from '../services/players.service';
import { HitterPlayer, PitcherPlayer } from '../models/models.model';
import { Hitter, Pitcher } from '../models/teams.model';

const SGCalc = () => {
  // State for top players
  const [topHitters, setTopHitters] = useState<HitterPlayer[]>([]);
  const [topPitchers, setTopPitchers] = useState<PitcherPlayer[]>([]);
  const [limit, setLimit] = useState<number>(25);
  
  // State for player lookup
  const [hitterSearchTerm, setHitterSearchTerm] = useState<string>('');
  const [pitcherSearchTerm, setPitcherSearchTerm] = useState<string>('');
  const [allAvailableHitters, setAllAvailableHitters] = useState<Hitter[]>([]);
  const [allAvailablePitchers, setAllAvailablePitchers] = useState<Pitcher[]>([]);
  const [filteredHitters, setFilteredHitters] = useState<Hitter[]>([]);
  const [filteredPitchers, setFilteredPitchers] = useState<Pitcher[]>([]);
  const [isLoadingHitters, setIsLoadingHitters] = useState<boolean>(false);
  const [isLoadingPitchers, setIsLoadingPitchers] = useState<boolean>(false);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [playerToRemove, setPlayerToRemove] = useState<{ type: 'hitter' | 'pitcher', id: number, name: string } | null>(null);
  
  // Services
  const playersService = useMemo(() => new PlayersService(), []);
  
  // Fetch top players when limit changes
  useEffect(() => {
    const fetchTopPlayers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [hitters, pitchers] = await Promise.all([
          playersService.getTopHitters(1, limit), // Using default model ID 1
          playersService.getTopPitchers(1, limit) // Using default model ID 1
        ]);
        
        setTopHitters(hitters);
        setTopPitchers(pitchers);
      } catch (err) {
        console.error('Error fetching top players:', err);
        setError('Failed to load top players. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopPlayers();
  }, [playersService, limit]);
  
  // Fetch all available hitters on component mount
  useEffect(() => {
    const fetchAvailableHitters = async () => {
      setIsLoadingHitters(true);
      try {
        const hitters = await playersService.getAvailableHitters();
        setAllAvailableHitters(hitters);
        setFilteredHitters(hitters.slice(0, 10)); // Show first 10 by default
      } catch (err) {
        console.error('Error fetching available hitters:', err);
        setError('Failed to load available hitters. Please try again later.');
      } finally {
        setIsLoadingHitters(false);
      }
    };
    
    fetchAvailableHitters();
  }, [playersService]);
  
  // Fetch all available pitchers on component mount
  useEffect(() => {
    const fetchAvailablePitchers = async () => {
      setIsLoadingPitchers(true);
      try {
        const pitchers = await playersService.getAvailablePitchers();
        setAllAvailablePitchers(pitchers);
        setFilteredPitchers(pitchers.slice(0, 10)); // Show first 10 by default
      } catch (err) {
        console.error('Error fetching available pitchers:', err);
        setError('Failed to load available pitchers. Please try again later.');
      } finally {
        setIsLoadingPitchers(false);
      }
    };
    
    fetchAvailablePitchers();
  }, [playersService]);
  
  // Filter hitters based on search term
  useEffect(() => {
    if (!hitterSearchTerm.trim()) {
      setFilteredHitters(allAvailableHitters.slice(0, 10)); // Show first 10 when no search term
      return;
    }
    
    const searchTerm = hitterSearchTerm.toLowerCase().trim();
    const filtered = allAvailableHitters.filter(hitter => 
      hitter.PlayerName.toLowerCase().includes(searchTerm)
    );
    
    setFilteredHitters(filtered.slice(0, 20)); // Limit to 20 results for performance
  }, [hitterSearchTerm, allAvailableHitters]);
  
  // Filter pitchers based on search term
  useEffect(() => {
    if (!pitcherSearchTerm.trim()) {
      setFilteredPitchers(allAvailablePitchers.slice(0, 10)); // Show first 10 when no search term
      return;
    }
    
    const searchTerm = pitcherSearchTerm.toLowerCase().trim();
    const filtered = allAvailablePitchers.filter(pitcher => 
      pitcher.PlayerName.toLowerCase().includes(searchTerm)
    );
    
    setFilteredPitchers(filtered.slice(0, 20)); // Limit to 20 results for performance
  }, [pitcherSearchTerm, allAvailablePitchers]);
  
  // Handle showing the confirmation dialog
  const handleRemoveClick = (type: 'hitter' | 'pitcher', id: number, name: string) => {
    setPlayerToRemove({ type, id, name });
    setShowConfirmDialog(true);
  };
  
  // Handle confirming player removal
  const handleConfirmRemove = async () => {
    if (!playerToRemove) return;
    
    try {
      const { type, id } = playerToRemove;
      const response = await playersService.removePlayer(type, id);
      
      if (response.success) {
        // Refresh the data
        if (type === 'hitter') {
          const hitters = await playersService.getAvailableHitters();
          setAllAvailableHitters(hitters);
          setFilteredHitters(hitterSearchTerm ? 
            hitters.filter(h => h.PlayerName.toLowerCase().includes(hitterSearchTerm.toLowerCase())).slice(0, 20) : 
            hitters.slice(0, 10)
          );
        } else {
          const pitchers = await playersService.getAvailablePitchers();
          setAllAvailablePitchers(pitchers);
          setFilteredPitchers(pitcherSearchTerm ? 
            pitchers.filter(p => p.PlayerName.toLowerCase().includes(pitcherSearchTerm.toLowerCase())).slice(0, 20) : 
            pitchers.slice(0, 10)
          );
        }
        
        // Also refresh top players
        const [topHittersData, topPitchersData] = await Promise.all([
          playersService.getTopHitters(1, limit),
          playersService.getTopPitchers(1, limit)
        ]);
        
        setTopHitters(topHittersData);
        setTopPitchers(topPitchersData);
      } else {
        setError('Failed to remove player. Please try again.');
      }
    } catch (err) {
      console.error('Error removing player:', err);
      setError('Failed to remove player. Please try again later.');
    } finally {
      setShowConfirmDialog(false);
      setPlayerToRemove(null);
    }
  };
  
  // Handle canceling player removal
  const handleCancelRemove = () => {
    setShowConfirmDialog(false);
    setPlayerToRemove(null);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Standard Gains Calculator</h1>
      
      {/* Confirmation Dialog */}
      {showConfirmDialog && playerToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Removal</h3>
            <p className="mb-6">
              Are you sure you want to remove {playerToRemove.name} from the available players list?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={handleCancelRemove}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleConfirmRemove}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Limit selection */}
      <div className="mb-8 bg-gray-100 p-4 rounded-lg border border-gray-300">
        <div className="flex flex-wrap gap-4 items-center justify-center">
          <div className="w-full sm:w-auto">
            <label htmlFor="limit-select" className="block text-sm font-medium mb-1">
              Number of Players:
            </label>
            <select
              id="limit-select"
              className="bg-white border border-gray-300 rounded px-3 py-2 w-full"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 border border-red-300">
          {error}
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Top Players Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Hitters */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-300">
          <h2 className="text-xl font-bold mb-4 text-center">Top Hitters by SG Value</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg">
              <thead className="bg-gray-100">
                <tr className="border-b border-gray-300">
                  <th className="px-4 py-2 text-left">Actions</th>
                  <th className="px-4 py-2 text-left">Player</th>
                  <th className="px-4 py-2 text-left">Team</th>
                  <th className="px-4 py-2 text-left">Position</th>
                  <th className="px-4 py-2 text-right">SG Value</th>
                  <th className="px-4 py-2 text-right">AVG</th>
                  <th className="px-4 py-2 text-right">HR</th>
                  <th className="px-4 py-2 text-right">RBI</th>
                  <th className="px-4 py-2 text-right">R</th>
                  <th className="px-4 py-2 text-right">SB</th>
                </tr>
              </thead>
              <tbody>
                {topHitters.map((hitter) => (
                  <tr key={hitter.HittingPlayerId} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleRemoveClick('hitter', hitter.HittingPlayerId, hitter.PlayerName)}
                        title="Remove player"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-4 py-2">{hitter.PlayerName}</td>
                    <td className="px-4 py-2">{hitter.Team}</td>
                    <td className="px-4 py-2">{hitter.Position}</td>
                    <td className="px-4 py-2 text-right font-bold">{hitter.SGCalc.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">{hitter.AVG.toFixed(3)}</td>
                    <td className="px-4 py-2 text-right">{hitter.HR}</td>
                    <td className="px-4 py-2 text-right">{hitter.RBI}</td>
                    <td className="px-4 py-2 text-right">{hitter.R}</td>
                    <td className="px-4 py-2 text-right">{hitter.SB}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Top Pitchers */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-300">
          <h2 className="text-xl font-bold mb-4 text-center">Top Pitchers by SG Value</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg">
              <thead className="bg-gray-100">
                <tr className="border-b border-gray-300">
                  <th className="px-4 py-2 text-left">Actions</th>
                  <th className="px-4 py-2 text-left">Player</th>
                  <th className="px-4 py-2 text-left">Team</th>
                  <th className="px-4 py-2 text-left">Position</th>
                  <th className="px-4 py-2 text-right">SG Value</th>
                  <th className="px-4 py-2 text-right">ERA</th>
                  <th className="px-4 py-2 text-right">WHIP</th>
                  <th className="px-4 py-2 text-right">W</th>
                  <th className="px-4 py-2 text-right">K</th>
                  <th className="px-4 py-2 text-right">SV+H</th>
                </tr>
              </thead>
              <tbody>
                {topPitchers.map((pitcher) => (
                  <tr key={pitcher.PitchingPlayerId} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleRemoveClick('pitcher', pitcher.PitchingPlayerId, pitcher.PlayerName)}
                        title="Remove player"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-4 py-2">{pitcher.PlayerName}</td>
                    <td className="px-4 py-2">{pitcher.Team}</td>
                    <td className="px-4 py-2">{pitcher.Position}</td>
                    <td className="px-4 py-2 text-right font-bold">{pitcher.SGCalc.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">{pitcher.ERA.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">{pitcher.WHIP.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">{pitcher.W}</td>
                    <td className="px-4 py-2 text-right">{pitcher.SO}</td>
                    <td className="px-4 py-2 text-right">{pitcher.SVH}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Player Lookup Section */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hitter Lookup */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-300">
          <h2 className="text-xl font-bold mb-4 text-center">Hitter Lookup</h2>
          <div className="mb-4">
            <input
              type="text"
              className="w-full bg-white border border-gray-300 rounded px-3 py-2"
              placeholder="Type to search for a hitter..."
              value={hitterSearchTerm}
              onChange={(e) => setHitterSearchTerm(e.target.value)}
            />
          </div>
          
          {isLoadingHitters ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {filteredHitters.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg">
                    <thead className="bg-gray-100">
                      <tr className="border-b border-gray-300">
                        <th className="px-4 py-2 text-left">Actions</th>
                        <th className="px-4 py-2 text-left">Player</th>
                        <th className="px-4 py-2 text-left">Team</th>
                        <th className="px-4 py-2 text-left">Position</th>
                        <th className="px-4 py-2 text-right">AVG</th>
                        <th className="px-4 py-2 text-right">HR</th>
                        <th className="px-4 py-2 text-right">RBI</th>
                        <th className="px-4 py-2 text-right">R</th>
                        <th className="px-4 py-2 text-right">SB</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHitters.map((hitter) => (
                        <tr key={hitter.HittingPlayerId} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleRemoveClick('hitter', hitter.HittingPlayerId, hitter.PlayerName)}
                              title="Remove player"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </td>
                          <td className="px-4 py-2">{hitter.PlayerName}</td>
                          <td className="px-4 py-2">{hitter.Team}</td>
                          <td className="px-4 py-2">{hitter.Position}</td>
                          <td className="px-4 py-2 text-right">{hitter.AVG.toFixed(3)}</td>
                          <td className="px-4 py-2 text-right">{hitter.HR}</td>
                          <td className="px-4 py-2 text-right">{hitter.RBI}</td>
                          <td className="px-4 py-2 text-right">{hitter.R}</td>
                          <td className="px-4 py-2 text-right">{hitter.SB}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-4 text-gray-600">
                  {hitterSearchTerm ? 'No hitters found matching your search.' : 'Start typing to search for hitters.'}
                </p>
              )}
            </>
          )}
        </div>
        
        {/* Pitcher Lookup */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-300">
          <h2 className="text-xl font-bold mb-4 text-center">Pitcher Lookup</h2>
          <div className="mb-4">
            <input
              type="text"
              className="w-full bg-white border border-gray-300 rounded px-3 py-2"
              placeholder="Type to search for a pitcher..."
              value={pitcherSearchTerm}
              onChange={(e) => setPitcherSearchTerm(e.target.value)}
            />
          </div>
          
          {isLoadingPitchers ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {filteredPitchers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg">
                    <thead className="bg-gray-100">
                      <tr className="border-b border-gray-300">
                        <th className="px-4 py-2 text-left">Actions</th>
                        <th className="px-4 py-2 text-left">Player</th>
                        <th className="px-4 py-2 text-left">Team</th>
                        <th className="px-4 py-2 text-left">Position</th>
                        <th className="px-4 py-2 text-right">ERA</th>
                        <th className="px-4 py-2 text-right">WHIP</th>
                        <th className="px-4 py-2 text-right">W</th>
                        <th className="px-4 py-2 text-right">K</th>
                        <th className="px-4 py-2 text-right">SV+H</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPitchers.map((pitcher) => (
                        <tr key={pitcher.PitchingPlayerId} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleRemoveClick('pitcher', pitcher.PitchingPlayerId, pitcher.PlayerName)}
                              title="Remove player"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </td>
                          <td className="px-4 py-2">{pitcher.PlayerName}</td>
                          <td className="px-4 py-2">{pitcher.Team}</td>
                          <td className="px-4 py-2">{pitcher.Position}</td>
                          <td className="px-4 py-2 text-right">{pitcher.ERA.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right">{pitcher.WHIP.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right">{pitcher.W}</td>
                          <td className="px-4 py-2 text-right">{pitcher.SO}</td>
                          <td className="px-4 py-2 text-right">{pitcher.SVH}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-4 text-gray-600">
                  {pitcherSearchTerm ? 'No pitchers found matching your search.' : 'Start typing to search for pitchers.'}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SGCalc; 