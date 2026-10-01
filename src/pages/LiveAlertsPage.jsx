import React from "react";
import { useFleet } from "../context/FleetContext";

export const LiveAlertsPage = () => {
  const { alerts, alertFilter, setAlertFilter, resolveAlert, navigateTo } = useFleet();

  const unresolvedAlerts = alerts.filter(
    (a) => String(a.status || "").toLowerCase() === "unresolved"
  );

  const filteredAlerts = alertFilter === "ALL"
    ? unresolvedAlerts
    : unresolvedAlerts.filter(
        (a) => String(a.severity || "").toUpperCase() === String(alertFilter).toUpperCase()
      );

  const unresolvedCount = unresolvedAlerts.length;

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
        <div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-error text-2xl">warning</span>
            <h1 class="text-2xl font-extrabold text-on-surface">Vigi360 Live Alerts</h1>
          </div>
          <p class="text-xs text-on-surface-variant mt-1">
            Real-time severity stream of driver drowsiness and distraction warnings.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1 bg-error-container text-on-error-container font-bold text-xs rounded-full">
            {unresolvedCount} Unresolved Alerts
          </span>
        </div>
      </div>

      {/* Severity Filter Bar (Stitch ZIP 2 Buttons) */}
      <div class="flex items-center gap-2 overflow-x-auto pb-2">
        {["ALL", "CRITICAL", "HIGH", "WARNING"].map((filter) => {
          const isActive = alertFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setAlertFilter(filter)}
              class={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide transition-all ${isActive
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border border-outline-variant"
                }`}
            >
              {filter === "ALL" ? "ALL ALERTS" : filter}
            </button>
          );
        })}
      </div>

      {/* Alerts Stream List */}
      <div class="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div class="bg-surface-container-lowest p-12 text-center rounded-2xl border border-outline-variant">
            <span class="material-symbols-outlined text-outline text-4xl mb-2">check_circle</span>
            <h3 class="text-base font-bold text-on-surface">No alerts match the selected severity</h3>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id || alert._id}
              class={`p-5 rounded-2xl border transition-all ${alert.severity === "CRITICAL"
                ? "bg-red-50/40 border-red-200"
                : alert.severity === "HIGH"
                  ? "bg-amber-50/40 border-amber-200"
                  : "bg-surface-container-lowest border-outline-variant"
                }`}
            >
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-start gap-4">
                  <div
                    class={`p-3 rounded-xl ${alert.severity === "CRITICAL"
                      ? "bg-error text-on-error"
                      : alert.severity === "HIGH"
                        ? "bg-amber-600 text-white"
                        : "bg-blue-600 text-white"
                      }`}
                  >
                    <span class="material-symbols-outlined text-2xl">
                      {alert.type.includes("Drowsiness") ? "airline_seat_recline_extra" : "do_not_disturb_on"}
                    </span>
                  </div>

                  <div>
                    <div class="flex items-center gap-3">
                      <span
                        class={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded ${alert.severity === "CRITICAL"
                          ? "bg-error text-on-error"
                          : alert.severity === "HIGH"
                            ? "bg-amber-600 text-white"
                            : "bg-blue-600 text-white"
                          }`}
                      >
                        {alert.severity}
                      </span>
                      <span class="text-xs font-mono text-outline">{alert.id || alert._id}</span>
                      <span class="text-xs text-outline">• {alert.timestamp}</span>
                    </div>

                    <h3 class="font-extrabold text-base text-on-surface mt-1">{alert.type}</h3>
                    <p class="text-xs text-on-surface-variant mt-1 max-w-2xl">{alert.details}</p>

                    <div class="flex items-center gap-4 mt-3 text-xs">
                      <button
                        onClick={() => navigateTo("driver-profile", { driverId: alert.driverId })}
                        class="font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <span class="material-symbols-outlined text-[16px]">account_circle</span>
                        <span>{alert.driverName}</span>
                      </button>

                      <span class="text-outline">Assigned: <strong class="text-on-surface">{alert.vehicleId}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div class="flex items-center gap-3 self-end sm:self-center">
                  {String(alert.status || "").toLowerCase() === "unresolved" ? (
                    <button
                      onClick={() => resolveAlert(alert.id || alert._id)}
                      class="px-4 py-2 bg-error text-on-error rounded-xl font-bold text-xs hover:bg-error/90 transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <span class="material-symbols-outlined text-[16px]">check</span>
                      <span>Resolve Alert</span>
                    </button>
                  ) : (
                    <span class="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1">
                      <span class="material-symbols-outlined text-[16px]">verified</span>
                      <span>Resolved</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
