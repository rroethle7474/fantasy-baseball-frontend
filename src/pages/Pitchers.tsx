import { useState, useCallback } from 'react';
import PitcherRosterGrid from '../components/PitcherRosterGrid';
import StatsTable from '../components/StatsTable';

interface PitcherStats {
  totalK: number;
  totalW: number;
  avgERA: number;
  avgWHIP: number;
  totalSH: number;
}

const Pitchers = () => {
  const [stats, setStats] = useState<PitcherStats>({
    totalK: 0,
    totalW: 0,
    avgERA: 0,
    avgWHIP: 0,
    totalSH: 0
  });

  const handleStatsChange = useCallback((newStats: PitcherStats) => {
    setStats(newStats);
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-4xl font-bold mb-6 text-blue-800">Pitchers Analysis</h1>
        <p className="text-xl text-gray-600">
          Analyze performance metrics and projections for MLB pitchers.
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 mt-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Pitchers Roster</h2>
        <p className="mb-6 text-gray-600">
          Manage your fantasy baseball pitchers by adding players and their projected statistics.
        </p>
        
        <StatsTable 
          title="Totals"
          headers={["K's", "W's", "ERA", "WHIP", "S+H"]}
          values={[stats.totalK, stats.totalW, stats.avgERA, stats.avgWHIP, stats.totalSH]}
        />
        
        <PitcherRosterGrid onStatsChange={handleStatsChange} />
        
        <div className="mt-6 text-right">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Save Roster
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pitchers; 