import { useState } from 'react';
import TeamsList from '../components/TeamsList';
import TeamDetails from '../components/TeamDetails';

/**
 * Teams page component
 */
const Teams = () => {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  
  const handleSelectTeam = (teamId: number) => {
    setSelectedTeamId(teamId);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Fantasy Baseball Teams</h1>
      
      {selectedTeamId ? (
        <div>
          <button 
            onClick={() => setSelectedTeamId(null)}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Back to Teams List
          </button>
          <TeamDetails teamId={selectedTeamId} />
        </div>
      ) : (
        <div>
          <p className="mb-4">Click on a team to view details.</p>
          <TeamsList onSelectTeam={handleSelectTeam} />
        </div>
      )}
    </div>
  );
};

export default Teams; 