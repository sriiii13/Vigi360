import React from "react";
import { useFleet } from "../../context/FleetContext";

export const TopNav = () => {
  const {
    user,
    activeTab,
    navigateTo,
    openCreateDriverModal,
    openCreateVehicleModal,
    alerts,
    driverSearchQuery,
    setDriverSearchQuery
  } = useFleet();

  const unresolvedAlertsCount = alerts.filter((a) => a.status === "Unresolved").length;

  return (
    <header class="bg-surface docked full-width border-b border-outline-variant shadow-sm flex justify-between items-center px-4 md:px-6 h-16 w-full fixed top-0 left-0 right-0 z-50">
      {/* Brand & Mobile Nav Toggle */}
      <div class="flex items-center gap-4">
        <div
          onClick={() => navigateTo("dashboard")}
          class="flex items-center gap-3 cursor-pointer select-none"
        >
          <img
            src="/vigi360_brand_logo.png"
            alt="Vigi360 Logo"
            class="h-9 w-auto object-contain"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div class="hidden flex-items-center gap-2 font-bold text-xl tracking-tight text-primary">
            <span class="material-symbols-outlined text-primary text-2xl">visibility</span>
            <span>Vigi360</span>
          </div>
        </div>
      </div>

      {/* Global Search Input (Only on Drivers or Dashboard) */}
      <div class="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
        <span class="material-symbols-outlined absolute left-3 text-outline text-[20px]">
          search
        </span>
        <input
          type="text"
          value={driverSearchQuery}
          onChange={(e) => {
            setDriverSearchQuery(e.target.value);
            if (activeTab !== "drivers" && activeTab !== "driver-profile") {
              navigateTo("drivers");
            }
          }}
          placeholder="Search drivers, vehicles, or alerts..."
          class="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface"
        />
      </div>

      {/* Actions & Manager Profile */}
      <div class="flex items-center gap-3 md:gap-4">
        <button
          onClick={openCreateDriverModal}
          class="hidden sm:flex items-center gap-2 bg-primary text-on-primary px-3.5 py-1.5 rounded-lg text-sm font-semibold hover:shadow-md hover:bg-primary/90 transition-all Active:scale-95"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          <span>Add Driver</span>
        </button>

        <button
          onClick={openCreateVehicleModal}
          class="hidden lg:flex items-center gap-1.5 border border-outline-variant text-on-surface px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-surface-container-low transition-all"
        >
          <span class="material-symbols-outlined text-[18px]">directions_car</span>
          <span>Add Vehicle</span>
        </button>

        {/* Notifications Icon */}
        <button
          onClick={() => navigateTo("alerts")}
          class="relative p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
          title="Live Alerts Feed"
        >
          <span class="material-symbols-outlined text-2xl">notifications</span>
          {unresolvedAlertsCount > 0 && (
            <span class="absolute top-1 right-1 w-5 h-5 bg-error text-on-error rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-surface">
              {unresolvedAlertsCount}
            </span>
          )}
        </button>

        {/* Manager User Avatar */}
        <div class="flex items-center gap-3 pl-2 border-l border-outline-variant">
          <img
            src={user.avatar}
            alt={user.name}
            class="w-9 h-9 rounded-full object-cover border border-outline-variant shadow-sm"
          />
          <div class="hidden xl:flex flex-col text-left">
            <span class="text-xs font-bold text-on-surface leading-tight">
              {user.name}
            </span>
            <span class="text-[11px] text-outline leading-tight">
              Fleet Operations Manager
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
