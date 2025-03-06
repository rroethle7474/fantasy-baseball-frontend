import { Link } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import { uploadPlayerData, uploadPitcherData } from '../services/uploadService';

const Home = () => {
  return (
    <div>
      <div>
        <h1 className="page-title">Welcome to Fantasy Baseball</h1>
        <p className="page-subtitle">
          Your one-stop destination for fantasy baseball player analysis and statistics.
        </p>
      </div>
      
      <div className="card-grid mb-16">
        <div className="card">
          <h2 className="card-title">Hitter Analysis</h2>
          <p className="card-text">
            Explore detailed statistics and projections for MLB hitters to make informed fantasy decisions.
          </p>
          <Link 
            to="/hitters" 
            className="button"
          >
            View Hitters
          </Link>
        </div>
        <div className="card">
          <h2 className="card-title">Pitcher Analysis</h2>
          <p className="card-text">
            Analyze performance metrics and projections for MLB pitchers to optimize your fantasy roster.
          </p>
          <Link 
            to="/pitchers" 
            className="button"
          >
            View Pitchers
          </Link>
        </div>
      </div>

      <h2 className="page-title text-2xl !mt-20 !mb-10 data-management-title">Data Management</h2>
      
      <div className="card-grid">
        <FileUpload 
          title="Upload Player Data"
          description="Upload your player statistics data file (CSV or Excel format). This will update the hitter statistics in the system."
          onUpload={uploadPlayerData}
        />
        
        <FileUpload 
          title="Upload Pitcher Data"
          description="Upload your pitcher statistics data file (CSV or Excel format). This will update the pitcher statistics in the system."
          onUpload={uploadPitcherData}
        />
      </div>
    </div>
  );
};

export default Home; 