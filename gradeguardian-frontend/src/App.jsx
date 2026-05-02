import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Imports
import AuthScreen from "./features/auth/pages/AuthScreen";
import Dashboard from "./features/dashboard/pages/Dashboard";
import ProfileScreen from "./features/profile/pages/ProfileScreen";
import CourseDetails from "./features/courses/pages/CourseDetails";
import Settings from "./features/profile/pages/Settings";
import GWAHub from './features/gwa/pages/GWAHub';
import SemesterDetails from './features/semester/pages/SemesterDetails';
import GradesOverview from './features/gradeoverview/pages/GradesOverview'; // Added this

import { Layout } from "./features/common/components/Layout";

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Public Routes */}
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="/auth" element={<AuthScreen />} />

        {/* 2. Protected Routes (With Sidebar) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Linked to the 'Grades' icon in sidebar */}
          <Route path="/grades-overview" element={<GradesOverview />} /> 
          
          {/* Linked to the 'GWA Calculator' icon in sidebar */}
          <Route path="/gwa-calculator" element={<GWAHub />} />
          
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/settings" element={<Settings />} />

          {/* Dynamic Routes */}
          <Route path="/course/:id" element={<CourseDetails />} />
          
          {/* MOVED INSIDE: So the report card still has the Sidebar */}
          <Route path="/semester/:id" element={<SemesterDetails />} /> 
        </Route>

        {/* 3. Fallback */}
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}

export default App;