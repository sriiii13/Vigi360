import React from "react";
import { FleetProvider, useFleet } from "./context/FleetContext";
import { TopNav } from "./components/layout/TopNav";
import { Sidebar } from "./components/layout/Sidebar";
import { CreateDriverModal } from "./components/modals/CreateDriverModal";
import { CreateVehicleModal } from "./components/modals/CreateVehicleModal";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LiveAlertsPage } from "./pages/LiveAlertsPage";
import { DriversPage } from "./pages/DriversPage";
import { DriverProfilePage } from "./pages/DriverProfilePage";

const MainContent = () => {
  const { isAuthenticated, activeTab, toastMessage } = useFleet();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div class="min-h-screen bg-surface text-on-surface flex flex-col antialiased font-sans">
      {/* Top Header Navigation Bar */}
      <TopNav />

      {/* Main Body with Sidebar & Content Area */}
      <div class="flex flex-1 pt-16">
        {/* Sidebar Rail */}
        <Sidebar />

        {/* Main Content View Container */}
        <main class="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-4rem)]">
          {activeTab === "dashboard" && <DashboardPage />}
          {activeTab === "alerts" && <LiveAlertsPage />}
          {activeTab === "drivers" && <DriversPage />}
          {activeTab === "driver-profile" && <DriverProfilePage />}
        </main>
      </div>

      {/* Global Modals */}
      <CreateDriverModal />
      <CreateVehicleModal />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div class="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slideUp border border-outline-variant/30">
          <span class="material-symbols-outlined text-emerald-400 text-xl">check_circle</span>
          <span class="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <FleetProvider>
      <MainContent />
    </FleetProvider>
  );
}
