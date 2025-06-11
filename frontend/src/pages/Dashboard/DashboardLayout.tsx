import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Dashboard/Sidebar';
import './DashboardLayout.css';

const DashboardLayout: React.FC<{ currentUser: any | null }> = ({ currentUser }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar currentUser={currentUser} />
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;