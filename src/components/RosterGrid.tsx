import React, { useState, useEffect } from 'react';

interface Player {
  name: string;
  hr: string;
  rbi: string;
  r: string;
  sb: string;
  avg: string;
  salary: string;
}

interface RosterPosition {
  position: string;
  player: Player | null;
}

interface RosterStats {
  totalHR: number;
  totalRBI: number;
  totalR: number;
  totalSB: number;
  avgAVG: number;
}

interface RosterGridProps {
  onStatsChange?: (stats: RosterStats) => void;
}

const RosterGrid: React.FC<RosterGridProps> = ({ onStatsChange }) => {
  // Initial roster setup with all positions
  const [roster, setRoster] = useState<RosterPosition[]>([
    { position: 'C', player: null },
    { position: '1B', player: null },
    { position: '2B', player: null },
    { position: 'SS', player: null },
    { position: '3B', player: null },
    { position: 'MI', player: null },
    { position: 'CI', player: null },
    { position: 'OF', player: null },
    { position: 'OF', player: null },
    { position: 'OF', player: null },
    { position: 'OF', player: null },
    { position: 'OF', player: null },
    { position: 'UT', player: null },
    { position: 'Bench', player: null },
    { position: 'Bench', player: null },
    { position: 'Bench', player: null },
  ]);

  // Calculate totals whenever roster changes
  useEffect(() => {
    // Calculate statistics inline within the effect
    const calculateStats = (): RosterStats => {
      let totalHR = 0;
      let totalRBI = 0;
      let totalR = 0;
      let totalSB = 0;
      let totalAVG = 0;
      let avgCount = 0;

      roster.forEach(position => {
        if (position.player && position.player.name) {
          // Parse numeric values, defaulting to 0 if invalid
          const hr = parseFloat(position.player.hr) || 0;
          const rbi = parseFloat(position.player.rbi) || 0;
          const r = parseFloat(position.player.r) || 0;
          const sb = parseFloat(position.player.sb) || 0;
          
          // Only include valid AVG values in the average calculation
          const avg = parseFloat(position.player.avg);
          if (!isNaN(avg)) {
            totalAVG += avg;
            avgCount++;
          }

          totalHR += hr;
          totalRBI += rbi;
          totalR += r;
          totalSB += sb;
        }
      });

      // Calculate average AVG, avoiding division by zero
      const avgAVG = avgCount > 0 ? totalAVG / avgCount : 0;

      return {
        totalHR,
        totalRBI,
        totalR,
        totalSB,
        avgAVG
      };
    };

    const stats = calculateStats();
    if (onStatsChange) {
      onStatsChange(stats);
    }
  }, [roster, onStatsChange]);

  // Handle player data changes
  const handlePlayerChange = (index: number, field: keyof Player, value: string) => {
    setRoster(prevRoster => {
      const updatedRoster = [...prevRoster];
      
      // If player is null, create a new player object
      if (!updatedRoster[index].player) {
        updatedRoster[index].player = {
          name: '',
          hr: '',
          rbi: '',
          r: '',
          sb: '',
          avg: '',
          salary: ''
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
            <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">HR</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">RBI</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">R</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">SB</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">AVG</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Salary</th>
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
                      value={position.player.hr}
                      onChange={(e) => handlePlayerChange(index, 'hr', e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="HR"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={position.player.rbi}
                      onChange={(e) => handlePlayerChange(index, 'rbi', e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="RBI"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={position.player.r}
                      onChange={(e) => handlePlayerChange(index, 'r', e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="R"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={position.player.sb}
                      onChange={(e) => handlePlayerChange(index, 'sb', e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="SB"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={position.player.avg}
                      onChange={(e) => handlePlayerChange(index, 'avg', e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="AVG"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={position.player.salary}
                      onChange={(e) => handlePlayerChange(index, 'salary', e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Salary"
                    />
                  </td>
                </>
              ) : (
                <td colSpan={7} className="py-3 px-4 text-center text-gray-500">
                  <button 
                    onClick={() => handlePlayerChange(index, 'name', '')}
                    className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                  >
                    Add a player
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
export default React.memo(RosterGrid); 