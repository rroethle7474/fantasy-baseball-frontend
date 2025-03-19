# Fantasy Baseball Frontend

## Project Summary

A frontend site providing detailed analysis for a fantasy baseball auction allowing for standard gains points analysis from uploaded projection stats from the users choosing. Ability to add/remove players from available pool and build an optimized hitter or pitching linneup.

## Technologies

This project is built with the following technologies:

- **React**: A JavaScript library for building user interfaces
- **TypeScript**: JavaScript with syntax for types
- **Tailwind CSS (v4)**: A utility-first CSS framework
- **Vite**: Next generation frontend tooling for faster development
- **Axios**: Promise-based HTTP client for API requests

## Local Development

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn package manager
- Access to the backend API server (see below)

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fantasy-baseball-frontend.git
   cd fantasy-baseball-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or with yarn
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or with yarn
   yarn dev
   ```

4. Open your browser and visit `http://localhost:5173` or what your terminal decides.

## Application Routes

The application consists of the following routes defined in `src/App.tsx`:

### `/` - Home
The landing page of the application that provides:
- Standard Gains calculation interface
- Team and model selection
- NA player management (setting players as free agents)
- Quick access to other application features

### `/hitters` - Hitters Analysis
This page offers:
- Hitter roster analysis with detailed statistics
- Calculation of total HR, RBI, R, SB, and AVG for the selected team
- Comparison against target statistics
- Team and model selection for roster viewing

### `/pitchers` - Pitchers Analysis
Similar to the Hitters page, but focused on pitchers:
- Pitcher roster analysis with relevant statistics
- Calculation of total K, W, SV+H, and average ERA and WHIP
- Comparison against target statistics
- Team and model selection for roster viewing

### `/teams` - Teams Management
A comprehensive team management interface:
- List of all fantasy teams
- Detailed view of individual team rosters when selected
- Team performance statistics

### `/sgcalc` - Standard Gains Calculator
Dedicated page for Standard Gains calculation:
- View of top hitters and pitchers by Standard Gains value
- Player lookup functionality
- Ability to remove players from the system
- Adjustable limit for top players display

### `/lineup` - Lineup Optimizer
Advanced lineup optimization tool that:
- Creates optimal lineups based on budget constraints
- Supports different lineup types (hitting, pitching, or both)
- Provides detailed statistics for the generated lineup
- Shows total cost and Standard Gains value of the lineup

### Connecting to the Backend API

The application is configured to connect to a local Flask backend API running on `http://localhost:5000/api`. This configuration is set in `src/services/api.service.ts`.

```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

**TODO**: Move the API URL configuration to an environment file for better configuration management.

To run the backend server locally:

1. Clone the backend repository:
   ```bash
   git clone https://github.com/rroethle7474/fantasy-baseball-backend.git
   cd fantasy-baseball-backend
   ```

2. Follow the setup instructions in the backend repository's README.md to:
   - Create and activate a virtual environment
   - Install required dependencies
   - Start the Flask server

The backend server will start on `http://localhost:5000` by default, which matches the frontend's default API URL configuration.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code quality issues
