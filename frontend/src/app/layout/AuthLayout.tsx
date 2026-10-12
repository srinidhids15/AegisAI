import React from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardBackground } from '../../components/background/DashboardBackground';

export const AuthLayout: React.FC = () => {
  return (
    <div className="h-screen w-full relative bg-background overflow-hidden">
      <DashboardBackground />
      <div className="relative z-10 w-full h-full">
        <Outlet />
      </div>
    </div>
  );
};
