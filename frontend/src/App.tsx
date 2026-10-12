import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './app/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Vulnerabilities from './pages/Vulnerabilities';
import MitreView from './pages/MitreView';
import ExplanationPage from './pages/Explanation';
import Login from './pages/Login';
import Register from './pages/Register';
import Ingest from './pages/Ingest';
import Projects from './pages/Projects';
import { AuthLayout } from './app/layout/AuthLayout';
import { GraphCanvas } from './components/graph/GraphCanvas';
import ErrorBoundary from './components/ui/ErrorBoundary';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Main App Routes */}
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="ingest" element={<Ingest />} />
            <Route path="projects" element={<Projects />} />
            <Route path="vulnerabilities" element={<Vulnerabilities />} />
            <Route path="graph" element={
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-white">Attack Path Visualization</h1>
                <GraphCanvas />
              </div>
            } />
            <Route path="mitre" element={<MitreView />} />
            <Route path="insights" element={<ExplanationPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
