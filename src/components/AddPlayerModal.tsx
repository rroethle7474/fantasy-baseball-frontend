import React, { useState, useEffect, useCallback } from 'react';
import Modal from './layout/Modal';
import { PlayersService } from '../services/players.service';
import { TeamsService } from '../services/teams.service';
import { Hitter, Pitcher, HitterPosition, PitcherPosition, RosterUpdateRequest } from '../models/teams.model';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: string;
  apiPosition?: HitterPosition | PitcherPosition;
  playerType: 'hitter' | 'pitcher';
  onAddPlayer: (playerName: string) => void;
  teamId?: number | null;
}

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
  isOpen,
  onClose,
  position,
  apiPosition,
  playerType,
  onAddPlayer,
  teamId
}) => {
  const [playerName, setPlayerName] = useState('');
  const [availablePlayers, setAvailablePlayers] = useState<(Hitter | Pitcher)[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<(Hitter | Pitcher)[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Hitter | Pitcher | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Map roster position to API position for search
  const mapPositionToApiPosition = useCallback((rosterPosition: string): string | undefined => {
    // For pitchers, we don't need to map the position
    if (playerType === 'pitcher') {
      return undefined;
    }

    // Map roster positions to actual positions based on API documentation
    const positionMap: Record<string, string[]> = {
      'C': ['C'],
      '1B': ['1B'],
      '2B': ['2B'],
      'SS': ['SS'],
      '3B': ['3B'],
      'MI': ['2B', 'SS'],
      'CI': ['1B', '3B'],
      'OF1': ['OF'],
      'OF2': ['OF'],
      'OF3': ['OF'],
      'OF4': ['OF'],
      'OF5': ['OF'],
      'UT': ['C', '1B', '2B', 'SS', '3B', 'OF', 'DH'],
      'Bench1': ['C', '1B', '2B', 'SS', '3B', 'OF', 'DH'],
      'Bench2': ['C', '1B', '2B', 'SS', '3B', 'OF', 'DH'],
      'Bench3': ['C', '1B', '2B', 'SS', '3B', 'OF', 'DH']
    };

    // Get the base position without numbers
    const basePosition = rosterPosition.replace(/\d+$/, '');
    return positionMap[basePosition]?.[0] || positionMap[rosterPosition]?.[0];
  }, [playerType]);

  // Fetch available players when the modal opens
  useEffect(() => {
    const fetchAvailablePlayers = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      setSelectedPlayer(null);
      setPlayerName('');

      try {
        const playersService = new PlayersService();
        const searchPosition = mapPositionToApiPosition(position);
        
        let players: (Hitter | Pitcher)[] = [];
        
        if (playerType === 'hitter') {
          players = await playersService.getAvailableHitters(searchPosition);
        } else {
          players = await playersService.getAvailablePitchers();
        }
        
        setAvailablePlayers(players);
        setFilteredPlayers(players);
      } catch (err) {
        console.error('Error fetching available players:', err);
        setError('Failed to load available players. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailablePlayers();
  }, [isOpen, position, playerType, mapPositionToApiPosition]);

  // Filter players based on search input
  useEffect(() => {
    if (!playerName.trim()) {
      setFilteredPlayers(availablePlayers);
      return;
    }

    const searchTerm = playerName.toLowerCase().trim();
    const filtered = availablePlayers.filter(player => 
      player.PlayerName.toLowerCase().includes(searchTerm)
    );
    
    setFilteredPlayers(filtered);
  }, [playerName, availablePlayers]);

  const handleSubmit = async () => {
    if (!selectedPlayer) {
      setError('Please select a valid player from the list.');
      return;
    }

    if (!teamId) {
      setError('No team selected. Please select a team first.');
      return;
    }

    // Map position to API position if not provided
    let positionToUse = apiPosition;
    if (!positionToUse) {
      // Default mapping based on position
      const defaultPositionMap: Record<string, HitterPosition | PitcherPosition> = {
        'C': 'C',
        '1B': 'FirstBase',
        '2B': 'SecondBase',
        'SS': 'ShortStop',
        '3B': 'ThirdBase',
        'MI': 'MiddleInfielder',
        'CI': 'CornerInfielder',
        'OF': 'Outfield1',
        'OF1': 'Outfield1',
        'OF2': 'Outfield2',
        'OF3': 'Outfield3',
        'OF4': 'Outfield4',
        'OF5': 'Outfield5',
        'UT': 'Utility',
        'Bench': 'Bench1',
        'Bench1': 'Bench1',
        'Bench2': 'Bench2',
        'Bench3': 'Bench3',
        'P': 'Pitcher1',
        'P1': 'Pitcher1',
        'P2': 'Pitcher2',
        'P3': 'Pitcher3',
        'P4': 'Pitcher4',
        'P5': 'Pitcher5',
        'P6': 'Pitcher6',
        'P7': 'Pitcher7',
        'P8': 'Pitcher8',
        'P9': 'Pitcher9'
      };
      
      positionToUse = defaultPositionMap[position];
      
      if (!positionToUse) {
        setError(`Could not map position "${position}" to a valid API position.`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const teamsService = new TeamsService();
      
      const updateRequest: RosterUpdateRequest = {
        player_type: playerType,
        position: positionToUse,
        player_id: playerType === 'hitter' 
          ? (selectedPlayer as Hitter).HittingPlayerId 
          : (selectedPlayer as Pitcher).PitchingPlayerId
      };
      
      const response = await teamsService.updateTeamRoster(teamId, updateRequest);
      
      if (response.success) {
        setSuccessMessage(`Successfully added ${selectedPlayer.PlayerName} to the roster.`);
        // Call the parent component's callback with the player name
        onAddPlayer(selectedPlayer.PlayerName);
        
        // Close the modal after a short delay to show the success message
        setTimeout(() => {
          setPlayerName('');
          setSelectedPlayer(null);
          onClose();
        }, 1500);
      } else {
        setError(response.message || 'Failed to update roster. Please try again.');
      }
    } catch (err) {
      console.error('Error updating roster:', err);
      setError('An error occurred while updating the roster. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setPlayerName('');
    setSelectedPlayer(null);
    onClose();
  };

  const handlePlayerSelect = (player: Hitter | Pitcher) => {
    setSelectedPlayer(player);
    setPlayerName(player.PlayerName);
  };

  // Check if the Add button should be disabled
  const isAddDisabled = !selectedPlayer || isSubmitting;

  // Get display position (without numbers)
  const getDisplayPosition = (pos: string): string => {
    return pos.replace(/\d+$/, '');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add ${playerType === 'hitter' ? 'Player' : 'Pitcher'} to ${getDisplayPosition(position)}`}
      position={position}
      footer={
        <>
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isAddDisabled 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={isAddDisabled}
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="playerName" className="block text-sm font-medium text-gray-700">
            Player Name
          </label>
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value);
              // Clear selected player if input changes
              if (selectedPlayer && e.target.value !== selectedPlayer.PlayerName) {
                setSelectedPlayer(null);
              }
            }}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search for a player"
            autoFocus
          />
        </div>

        <div className="text-sm text-gray-500">
          Position: {getDisplayPosition(position)}
        </div>

        {successMessage && (
          <div className="p-3 bg-green-50 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-sm text-gray-600">Loading players...</p>
          </div>
        )}

        {!isLoading && !error && filteredPlayers.length > 0 && (
          <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredPlayers.map((player) => (
                <li 
                  key={playerType === 'hitter' 
                    ? (player as Hitter).HittingPlayerId 
                    : (player as Pitcher).PitchingPlayerId
                  }
                  className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                    selectedPlayer && 
                    ((playerType === 'hitter' && 
                      (selectedPlayer as Hitter).HittingPlayerId === (player as Hitter).HittingPlayerId) ||
                     (playerType === 'pitcher' && 
                      (selectedPlayer as Pitcher).PitchingPlayerId === (player as Pitcher).PitchingPlayerId))
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : ''
                  }`}
                  onClick={() => handlePlayerSelect(player)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{player.PlayerName}</span>
                    <span className="text-sm text-gray-500">{player.Team} - {player.Position}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {playerType === 'hitter' ? (
                      <>
                        HR: {(player as Hitter).HR} | AVG: {(player as Hitter).AVG} | RBI: {(player as Hitter).RBI}
                      </>
                    ) : (
                      <>
                        ERA: {(player as Pitcher).ERA} | WHIP: {(player as Pitcher).WHIP} | K/9: {(player as Pitcher).K_9}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isLoading && !error && filteredPlayers.length === 0 && playerName.trim() !== '' && (
          <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md">
            No players found matching "{playerName}".
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddPlayerModal; 