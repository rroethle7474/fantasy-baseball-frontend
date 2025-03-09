import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Hitters from './pages/Hitters';
import Pitchers from './pages/Pitchers';
import Teams from './pages/Teams';
import SGCalc from './pages/SGCalc';
import './App.css';
import LineupOptimizer from './pages/LineupOptimizer';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hitters" element={<Hitters />} />
          <Route path="/pitchers" element={<Pitchers />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/sgcalc" element={<SGCalc />} />
          <Route path="/lineup" element={<LineupOptimizer />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
