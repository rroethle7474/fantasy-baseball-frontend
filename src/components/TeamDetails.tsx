import { useState, useEffect } from 'react';
import { TeamsService } from '../services/teams.service';
import { StatisticsService } from '../services/statistics.service';
import { TeamRosterResponse } from '../models/teams.model';
import { TeamAllStatsResponse } from '../models/statistics.model';

interface TeamDetailsProps {
  teamId: number;
}

// Create service instances outside component to avoid recreation on each render
const teamsService = new TeamsService();
const statsService = new StatisticsService();

/**
 * Component to display detailed information about a team
 */
const TeamDetails = ({ teamId }: TeamDetailsProps) => {
  const [roster, setRoster] = useState<TeamRosterResponse | null>(null);
  const [stats, setStats] = useState<TeamAllStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        
        // Fetch team roster and stats in parallel
        const [rosterData, statsData] = await Promise.all([
          teamsService.getTeamRoster(teamId),
          statsService.getTeamAllStats(teamId)
        ]);
        
        setRoster(rosterData);
        setStats(statsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Failed to fetch team data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamData();
  }, [teamId]);
  
  if (loading) {
    return <div className="p-4">Loading team details...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }
  
  if (!roster || !stats) {
    return <div className="p-4">No team data found.</div>;
  }
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{roster.team.TeamName}</h2>
      <p className="mb-4">Owner: {roster.team.Owner}</p>
      <p className="mb-6">Salary: ${roster.team.Salary.toFixed(2)}</p>
      
      {/* Team Stats */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Team Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4 shadow-sm">
            <h4 className="font-bold mb-2">Hitting Stats</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>R: {stats.hitting_stats.R}</div>
              <div>HR: {stats.hitting_stats.HR}</div>
              <div>RBI: {stats.hitting_stats.RBI}</div>
              <div>SB: {stats.hitting_stats.SB}</div>
              <div>AVG: {stats.hitting_stats.AVG.toFixed(3)}</div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 shadow-sm">
            <h4 className="font-bold mb-2">Pitching Stats</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>W: {stats.pitching_stats.W}</div>
              <div>K: {stats.pitching_stats.K}</div>
              <div>SVH: {stats.pitching_stats.SVH}</div>
              <div>ERA: {stats.pitching_stats.ERA.toFixed(2)}</div>
              <div>WHIP: {stats.pitching_stats.WHIP.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Roster */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Hitters</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3 text-left">Name</th>
                <th className="py-2 px-3 text-left">Pos</th>
                <th className="py-2 px-3 text-right">HR</th>
                <th className="py-2 px-3 text-right">R</th>
                <th className="py-2 px-3 text-right">RBI</th>
                <th className="py-2 px-3 text-right">SB</th>
                <th className="py-2 px-3 text-right">AVG</th>
              </tr>
            </thead>
            <tbody>
              {roster.hitters.map((hitter) => (
                <tr key={hitter.HittingPlayerId} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-3">{hitter.PlayerName}</td>
                  <td className="py-2 px-3">{hitter.Position}</td>
                  <td className="py-2 px-3 text-right">{hitter.HR}</td>
                  <td className="py-2 px-3 text-right">{hitter.R}</td>
                  <td className="py-2 px-3 text-right">{hitter.RBI}</td>
                  <td className="py-2 px-3 text-right">{hitter.SB}</td>
                  <td className="py-2 px-3 text-right">{hitter.AVG.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-3">Pitchers</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3 text-left">Name</th>
                <th className="py-2 px-3 text-left">Pos</th>
                <th className="py-2 px-3 text-right">W</th>
                <th className="py-2 px-3 text-right">ERA</th>
                <th className="py-2 px-3 text-right">WHIP</th>
                <th className="py-2 px-3 text-right">K</th>
                <th className="py-2 px-3 text-right">SVH</th>
              </tr>
            </thead>
            <tbody>
              {roster.pitchers.map((pitcher) => (
                <tr key={pitcher.PitchingPlayerId} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-3">{pitcher.PlayerName}</td>
                  <td className="py-2 px-3">{pitcher.Position}</td>
                  <td className="py-2 px-3 text-right">{pitcher.W}</td>
                  <td className="py-2 px-3 text-right">{pitcher.ERA.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right">{pitcher.WHIP.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right">{pitcher.SO}</td>
                  <td className="py-2 px-3 text-right">{pitcher.SVH}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamDetails; 