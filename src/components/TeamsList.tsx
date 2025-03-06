import { useState, useEffect } from 'react';
import { TeamsService } from '../services/teams.service';
import { Team } from '../models/teams.model';

interface TeamsListProps {
  onSelectTeam?: (teamId: number) => void;
}

// Create service instance outside component to avoid recreation on each render
const teamsService = new TeamsService();

/**
 * Component to display a list of teams
 */
const TeamsList = ({ onSelectTeam }: TeamsListProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const data = await teamsService.getAllTeams();
        setTeams(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Failed to fetch teams. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeams();
  }, []);
  
  if (loading) {
    return <div className="p-4">Loading teams...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Teams</h2>
      {teams.length === 0 ? (
        <p>No teams found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div 
              key={team.TeamId} 
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectTeam && onSelectTeam(team.TeamId)}
            >
              <h3 className="font-bold text-lg">{team.TeamName}</h3>
              <p>Owner: {team.Owner}</p>
              <p>Salary: ${team.Salary.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamsList; 