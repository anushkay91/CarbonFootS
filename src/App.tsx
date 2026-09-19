/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/Dashboard';
import ActivitiesPage from './pages/ActivitiesPage';
import AddActivityPage from './pages/AddActivityPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import EditActivityPage from './pages/EditActivityPage';
import GoalsPage from './pages/GoalsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/activities/new" element={<AddActivityPage />} />
        <Route path="/activities/:id" element={<ActivityDetailPage />} />
        <Route path="/activities/:id/edit" element={<EditActivityPage />} />
        <Route path="/goals" element={<GoalsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
