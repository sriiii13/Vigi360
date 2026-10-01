import React from "react";
import { useFleet } from "../context/FleetContext";

export const DriversPage = () => {
  const {
    drivers,
    driverSearchQuery,
    setDriverSearchQuery,
    driverFilterStatus,
    setDriverFilterStatus,
    openCreateDriverModal,
    navigateTo
  } = useFleet();

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(driverSearchQuery.toLowerCase()) ||
      driver.id.toLowerCase().includes(driverSearchQuery.toLowerCase()) ||
      driver.assignedVehicleId.toLowerCase().includes(driverSearchQuery.toLowerCase());

    const matchesStatus =
      driverFilterStatus === "All" || driver.status === driverFilterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div class="space-y-6">
      {/* Header & Primary CTA (Stitch ZIP 5 Design) */}
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
        <div>
          <h1 class="text-2xl font-extrabold text-on-surface">Drivers Directory</h1>
          <p class="text-xs text-on-surface-variant mt-1">
            Monitor individual driver safety scores, vehicle assignments, and monitoring sessions.
          </p>
        </div>

        <button
          onClick={openCreateDriverModal}
          class="flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-md hover:bg-primary/90 transition-all Active:scale-95 self-start sm:self-auto"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          <span>Add Driver</span>
        </button>
      </div>

      {/* Controls Bar: Search & Status Filter Pills */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div class="relative flex-1 max-w-md">
          <span class="material-symbols-outlined absolute left-3.5 top-2.5 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            value={driverSearchQuery}
            onChange={(e) => setDriverSearchQuery(e.target.value)}
            placeholder="Search drivers..."
            class="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl font-sans text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div class="flex items-center gap-2">
          {["All", "Safe", "Needs Attention"].map((status) => {
            const isActive = driverFilterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setDriverFilterStatus(status)}
                class={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border border-outline-variant"
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Driver Cards Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDrivers.map((driver) => (
          <div
            key={driver.id}
            onClick={() => navigateTo("driver-profile", { driverId: driver.id })}
            class="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 hover:border-primary/60 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <img
                    src={driver.avatar}
                    alt={driver.name}
                    class="w-14 h-14 rounded-full object-cover border-2 border-outline-variant group-hover:border-primary transition-colors"
                  />
                  <div>
                    <h3 class="font-extrabold text-base text-on-surface group-hover:text-primary transition-colors">
                      {driver.name}
                    </h3>
                    <div class="text-xs text-on-surface-variant font-mono mt-0.5">
                      {driver.id} • Assigned: {driver.assignedVehicleId}
                    </div>
                  </div>
                </div>

                <span
                  class={`px-2.5 py-1 text-xs font-extrabold rounded-full ${
                    driver.status === "Safe"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  {driver.status}
                </span>
              </div>

              {/* Route & License info */}
              <div class="mt-4 space-y-1.5 text-xs text-on-surface-variant">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[16px] text-outline">route</span>
                  <span>{driver.route}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[16px] text-outline">badge</span>
                  <span>License: {driver.licenseNumber}</span>
                </div>
              </div>
            </div>

            {/* Score & Footer */}
            <div class="mt-5 pt-4 border-t border-outline-variant/60 flex items-center justify-between">
              <div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-outline block">
                  Safety Score
                </span>
                <span class="text-xl font-black text-on-surface">{driver.safetyScore}/100</span>
              </div>

              <div class="flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                <span>View Profile</span>
                <span class="material-symbols-outlined text-[16px]">chevron_right</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
