import React, { useState, useEffect } from 'react';

interface Pitcher {
  name: string;
  k: string;
  w: string;
  era: string;
  whip: string;
  sh: string; // Saves + Holds
}

interface RosterPosition {
  position: string;
  player: Pitcher | null;
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
}

const PitcherRosterGrid: React.FC<PitcherRosterGridProps> = ({ onStatsChange }) => {
  // Initial roster setup with all positions
  const [roster, setRoster] = useState<RosterPosition[]>([
    { position: 'Pitcher', player: null },
    { position: 'Pitcher', player: null },
    { position: 'Pitcher', player: null },
    { position: 'Pitcher', player: null },
    { position: 'Pitcher', player: null },
    { position: 'Pitcher', player: null },
    { position: 'Pitcher', player: null },
    { position: 'Pitcher', player: null },
    { position: 'Pitcher', player: null },
    { position: 'Bench', player: null },
    { position: 'Bench', player: null },
  ]);

  // Calculate totals whenever roster changes
  useEffect(() => {
    // Calculate statistics inline within the effect
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
          const sh = parseFloat(position.player.sh) || 0;
          
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
          totalSH += sh;
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

  // Handle player data changes
  const handlePlayerChange = (index: number, field: keyof Pitcher, value: string) => {
    setRoster(prevRoster => {
      const updatedRoster = [...prevRoster];
      
      // If player is null, create a new player object
      if (!updatedRoster[index].player) {
        updatedRoster[index].player = {
          name: '',
          k: '',
          w: '',
          era: '',
          whip: '',
          sh: ''
        };
      }
      
      // Update the specific field
      if (updatedRoster[index].player) {
        updatedRoster[index].player[field] = value;
      }
      
      return updatedRoster;
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Position</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Player Name</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">K</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">W</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">ERA</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">WHIP</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">S+H</th>
          </tr>
        </thead>
        <tbody>
          {roster.map((position, index) => (
            <tr key={`${position.position}-${index}`} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-medium">{position.position}</td>
              {position.player ? (
                <>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={position.player.name}
                      onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Player name"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={position.player.k}
                      onChange={(e) => handlePlayerChange(index, 'k', e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="K"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={position.player.w}
                      onChange={(e) => handlePlayerChange(index, 'w', e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="W"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={position.player.era}
                      onChange={(e) => handlePlayerChange(index, 'era', e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ERA"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={position.player.whip}
                      onChange={(e) => handlePlayerChange(index, 'whip', e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="WHIP"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={position.player.sh}
                      onChange={(e) => handlePlayerChange(index, 'sh', e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="S+H"
                    />
                  </td>
                </>
              ) : (
                <td colSpan={6} className="py-3 px-4 text-center text-gray-500">
                  <button 
                    onClick={() => handlePlayerChange(index, 'name', '')}
                    className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                  >
                    Add a pitcher
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Export the memoized component to prevent unnecessary re-renders
export default React.memo(PitcherRosterGrid); 