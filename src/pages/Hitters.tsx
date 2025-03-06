import { useState, useCallback } from 'react';
import RosterGrid from '../components/RosterGrid';
import StatsTable from '../components/StatsTable';

interface RosterStats {
  totalHR: number;
  totalRBI: number;
  totalR: number;
  totalSB: number;
  avgAVG: number;
}

const Hitters = () => {
  const [stats, setStats] = useState<RosterStats>({
    totalHR: 0,
    totalRBI: 0,
    totalR: 0,
    totalSB: 0,
    avgAVG: 0
  });

  const handleStatsChange = useCallback((newStats: RosterStats) => {
    setStats(newStats);
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-4xl font-bold mb-6 text-blue-800">Hitters Analysis</h1>
        <p className="text-xl text-gray-600">
          Explore detailed statistics and projections for MLB hitters.
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 mt-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Fantasy Roster</h2>
        <p className="mb-6 text-gray-600">
          Manage your fantasy baseball roster by adding players and their projected statistics.
        </p>
        
        <StatsTable 
          title="Totals"
          headers={['Homeruns', 'RBIs', 'Runs', 'SB', 'AVG']}
          values={[stats.totalHR, stats.totalRBI, stats.totalR, stats.totalSB, stats.avgAVG]}
        />
        
        <RosterGrid onStatsChange={handleStatsChange} />
        
        <div className="mt-6 text-right">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Save Roster
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hitters; 