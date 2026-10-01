import React from "react";
import { useFleet } from "../context/FleetContext";

export const DashboardPage = () => {
  const { drivers, vehicles, alerts, navigateTo, resolveAlert, openCreateDriverModal } = useFleet();

  const unresolvedAlerts = alerts.filter((a) => a.status === "Unresolved");
  const criticalAlertsCount = unresolvedAlerts.filter((a) => a.severity === "CRITICAL").length;
  const safeDriversCount = drivers.filter((d) => d.status === "Safe").length;

  return (
    <div class="space-y-6">
      {/* Top Greeting & Header Bar */}
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Good Morning, Manager
          </h1>
          <p class="text-on-surface-variant text-sm mt-1">
            Real-time fleet safety telemetry & AI driver monitoring overview.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            onClick={() => navigateTo("alerts")}
            class="px-4 py-2.5 bg-surface-container-high text-on-surface rounded-xl font-semibold text-sm hover:bg-surface-container-highest transition-all flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-[20px] text-error">warning</span>
            <span>{unresolvedAlerts.length} Unresolved Alerts</span>
          </button>

          <button
            onClick={openCreateDriverModal}
            class="px-4 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-sm flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-[20px]">add</span>
            <span>Add Driver</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Fleet Safety Score */}
        <div class="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-outline">
              Fleet Safety Score
            </span>
            <div class="text-3xl font-black text-on-surface mt-1">88<span class="text-lg text-outline">/100</span></div>
            <span class="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1">
              <span class="material-symbols-outlined text-[14px]">trending_up</span> +3.2% vs last week
            </span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl">shield</span>
          </div>
        </div>

        {/* Card 2: Active Monitored Drivers */}
        <div class="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-outline">
              Active Monitored Drivers
            </span>
            <div class="text-3xl font-black text-on-surface mt-1">{drivers.length}</div>
            <span class="text-xs font-semibold text-on-surface-variant mt-1 block">
              {safeDriversCount} Safe • {drivers.length - safeDriversCount} Needs Attention
            </span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl">group</span>
          </div>
        </div>

        {/* Card 3: Active Alerts */}
        <div class="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-outline">
              Active Safety Alerts
            </span>
            <div class="text-3xl font-black text-error mt-1">{unresolvedAlerts.length}</div>
            <span class="text-xs font-semibold text-error mt-1 block">
              {criticalAlertsCount} Critical Severity
            </span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-error-container/40 text-error flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl">warning</span>
          </div>
        </div>

        {/* Card 4: Active Vehicles */}
        <div class="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-outline">
              Monitored Fleet Vehicles
            </span>
            <div class="text-3xl font-black text-on-surface mt-1">{vehicles.length}</div>
            <span class="text-xs font-semibold text-emerald-600 mt-1 block">
              100% Sensors Online
            </span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl">local_shipping</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Fleet Telemetry & Live Alerts Feed */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Fleet Telemetry Overview */}
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-lg font-bold text-on-surface">Live Fleet Telemetry Overview</h2>
                <p class="text-xs text-on-surface-variant">Camera-free telemetry & real-time monitoring session status</p>
              </div>
              <button
                onClick={() => navigateTo("drivers")}
                class="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View All Drivers</span>
                <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  onClick={() => navigateTo("driver-profile", { driverId: driver.id })}
                  class="p-4 rounded-xl border border-outline-variant hover:border-primary/50 hover:shadow-md transition-all cursor-pointer bg-surface flex flex-col justify-between"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex items-center gap-3">
                      <img
                        src={driver.avatar}
                        alt={driver.name}
                        class="w-11 h-11 rounded-full object-cover border border-outline-variant"
                      />
                      <div>
                        <h3 class="font-bold text-sm text-on-surface hover:text-primary transition-colors">
                          {driver.name}
                        </h3>
                        <span class="text-xs text-on-surface-variant font-mono">
                          {driver.id} • {driver.assignedVehicleId}
                        </span>
                      </div>
                    </div>

                    <span
                      class={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        driver.status === "Safe"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}
                    >
                      {driver.status}
                    </span>
                  </div>

                  <div class="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs">
                    <span class="text-outline">Safety Score</span>
                    <span class="font-black text-on-surface">{driver.safetyScore}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Live Alerts Feed Widget (Stitch ZIP 1) */}
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-error text-xl">warning</span>
                <h2 class="text-lg font-bold text-on-surface">Live Alerts Feed</h2>
              </div>
              <button
                onClick={() => navigateTo("alerts")}
                class="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <span class="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
            </div>

            <div class="space-y-3">
              {alerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  class={`p-3.5 rounded-xl border transition-all ${
                    alert.severity === "CRITICAL"
                      ? "bg-red-50/50 border-red-200"
                      : alert.severity === "HIGH"
                      ? "bg-amber-50/50 border-amber-200"
                      : "bg-surface-container-low border-outline-variant"
                  }`}
                >
                  <div class="flex items-start justify-between">
                    <div>
                      <span
                        class={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded ${
                          alert.severity === "CRITICAL"
                            ? "bg-error text-on-error"
                            : alert.severity === "HIGH"
                            ? "bg-amber-600 text-white"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <h4 class="font-bold text-xs text-on-surface mt-1.5">{alert.type}</h4>
                    </div>
                    <span class="text-[11px] text-outline">{alert.timestamp}</span>
                  </div>

                  <p class="text-xs text-on-surface-variant mt-1 line-clamp-2">{alert.details}</p>

                  <div class="mt-2.5 pt-2 border-t border-outline-variant/40 flex items-center justify-between text-xs">
                    <button
                      onClick={() => navigateTo("driver-profile", { driverId: alert.driverId })}
                      class="font-semibold text-primary hover:underline"
                    >
                      {alert.driverName} ({alert.vehicleId})
                    </button>
                    {alert.status === "Unresolved" ? (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        class="text-[11px] font-bold text-error hover:underline"
                      >
                        Resolve
                      </button>
                    ) : (
                      <span class="text-[11px] font-semibold text-emerald-600">Resolved</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigateTo("alerts")}
            class="w-full mt-4 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl text-xs font-bold transition-all text-center"
          >
            Open Alert Management Center
          </button>
        </div>
      </div>
    </div>
  );
};
