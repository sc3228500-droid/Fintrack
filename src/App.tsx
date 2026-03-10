/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import FixedExpenses from './pages/FixedExpenses';
import DailyExpenses from './pages/DailyExpenses';
import History from './pages/History';
import Education from './pages/Education';
import Profile from './pages/Profile';
import SavingsGoals from './pages/SavingsGoals';
import { useStore } from './store/useStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useStore(state => state.user);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const { user, setUser, addSavingsGoal } = useStore();

  React.useEffect(() => {
    if (user && user.onboarded && !user.savingsGoalMigrated && user.savingsGoalName) {
      addSavingsGoal({
        name: user.savingsGoalName,
        targetAmount: user.savingsGoalAmount,
        currentAmount: user.savingsGoalCurrentAmount || 0,
        targetDate: user.savingsGoalDate,
        icon: 'emergency'
      });
      setUser({ savingsGoalMigrated: true });
    }
  }, [user, setUser, addSavingsGoal]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="fixed-expenses" element={<FixedExpenses />} />
          <Route path="daily-expenses" element={<DailyExpenses />} />
          <Route path="savings" element={<SavingsGoals />} />
          <Route path="history" element={<History />} />
          <Route path="education" element={<Education />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
