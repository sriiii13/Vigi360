import React from "react";
import { useFleet } from "../../context/FleetContext";

export const Sidebar = () => {
  const { activeTab, navigateTo, alerts, openCreateVehicleModal, logout } = useFleet();

  const unresolvedAlertsCount = alerts.filter((a) => a.status === "Unresolved").length;

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "dashboard",
      tab: "dashboard"
    },
    {
      id: "alerts",
      label: "Live Alerts",
      icon: "warning",
      tab: "alerts",
      badge: unresolvedAlertsCount > 0 ? unresolvedAlertsCount : null
    },
    {
      id: "drivers",
      label: "Drivers",
      icon: "badge",
      tab: "drivers"
    }
  ];

  return (
    <aside class="bg-surface dark:bg-surface-dim h-full w-64 border-r border-outline-variant hidden md:flex flex-col fixed left-0 top-0 h-screen p-4 gap-2 z-40 pt-20">
      <div class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-outline">
        Fleet Navigation
      </div>

      <nav class="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            activeTab === item.tab ||
            (item.tab === "drivers" && activeTab === "driver-profile");

          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.tab)}
              class={`flex items-center justify-between px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                isActive
                  ? "bg-primary text-on-primary shadow-sm font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[22px]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  class={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    isActive
                      ? "bg-error text-on-error"
                      : "bg-error-container text-on-error-container"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={openCreateVehicleModal}
          class="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all text-left mt-2"
        >
          <span class="material-symbols-outlined text-[22px]">directions_car</span>
          <span>Add New Vehicle</span>
        </button>
      </nav>

      <div class="pt-4 border-t border-outline-variant flex flex-col gap-1">
        <button
          onClick={logout}
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm text-error hover:bg-error-container/30 transition-all text-left"
        >
          <span class="material-symbols-outlined text-[20px]">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
