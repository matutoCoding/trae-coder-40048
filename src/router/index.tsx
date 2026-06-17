import React, { useEffect, useMemo } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useAppStore } from '../store';
import { BottomNav } from '../components/layout/BottomNav';

import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { DeviceList } from '../pages/DeviceList';
import { DeviceDetail } from '../pages/DeviceDetail';
import { InspectionPlanList } from '../pages/InspectionPlanList';
import { InspectionRecordDetail } from '../pages/InspectionRecordDetail';
import { ScanQR } from '../pages/ScanQR';
import { InspectionExecute } from '../pages/InspectionExecute';
import { InspectionComplete } from '../pages/InspectionComplete';
import { MaintenanceOrderList } from '../pages/MaintenanceOrderList';
import { MaintenanceOrderCreate } from '../pages/MaintenanceOrderCreate';
import { MaintenanceOrderDetail } from '../pages/MaintenanceOrderDetail';
import { RepairList } from '../pages/RepairList';
import { RepairCreate } from '../pages/RepairCreate';
import { RepairDetail } from '../pages/RepairDetail';
import { SparePartList } from '../pages/SparePartList';
import { SparePartRequestCreate } from '../pages/SparePartRequestCreate';
import { SparePartRequestDetail } from '../pages/SparePartRequestDetail';
import { Statistics } from '../pages/Statistics';
import { Profile } from '../pages/Profile';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAppStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const { user } = useAppStore();

  const hideNavRoutes = useMemo(
    () => ['/login', '/scan', '/inspection/execute', '/inspection/complete'],
    []
  );

  const shouldShowNav = useMemo(() => {
    return user && !hideNavRoutes.some((route) => location.pathname.startsWith(route));
  }, [user, location.pathname, hideNavRoutes]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/devices"
          element={
            <ProtectedRoute>
              <DeviceList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/devices/:id"
          element={
            <ProtectedRoute>
              <DeviceDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspection-plans"
          element={
            <ProtectedRoute>
              <InspectionPlanList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspection-records/:id"
          element={
            <ProtectedRoute>
              <InspectionRecordDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scan"
          element={
            <ProtectedRoute>
              <ScanQR />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspection/execute/:deviceId"
          element={
            <ProtectedRoute>
              <InspectionExecute />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspection/complete"
          element={
            <ProtectedRoute>
              <InspectionComplete />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance-orders"
          element={
            <ProtectedRoute>
              <MaintenanceOrderList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance-orders/create"
          element={
            <ProtectedRoute>
              <MaintenanceOrderCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance-orders/:id"
          element={
            <ProtectedRoute>
              <MaintenanceOrderDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repair-orders"
          element={
            <ProtectedRoute>
              <RepairList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repair-orders/create"
          element={
            <ProtectedRoute>
              <RepairCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repair-orders/:id"
          element={
            <ProtectedRoute>
              <RepairDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/spare-parts"
          element={
            <ProtectedRoute>
              <SparePartList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/spare-parts/request"
          element={
            <ProtectedRoute>
              <SparePartRequestCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/spare-parts/requests/:id"
          element={
            <ProtectedRoute>
              <SparePartRequestDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/statistics"
          element={
            <ProtectedRoute>
              <Statistics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {shouldShowNav && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 pb-safe">
          <BottomNav />
        </div>
      )}
    </div>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};
