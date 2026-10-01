import React, { useState } from "react";
import { useFleet } from "../context/FleetContext";

export const DriverProfilePage = () => {
  const { selectedDriver, incidents, sessions, navigateTo } = useFleet();
  const [timeRange, setTimeRange] = useState("7D");
  const [messageSent, setMessageSent] = useState(false);

  const driver = selectedDriver || {
    id: "DRV-001",
    name: "Arun Kumar",
    assignedVehicleId: "VEH-001",
    assignedVehicleName: "Toyota HiAce (VEH-001)",
    status: "Safe",
    safetyScore: 92,
    phone: "+91 98765 43210",
    licenseNumber: "DL-142011009876",
    route: "North Metro Delivery Route",
    drowsinessEvents7D: 2,
    distractionEvents7D: 4,
    speedingEvents7D: 1,
    totalSessions7D: 18,
    totalHoursMonitored: 142
  };

  const handleSendMessage = () => {
    setMessageSent(true);
    setTimeout(() => setMessageSent(false), 3000);
  };

  return (
    <div class="space-y-6">
      {/* Back Navigation Bar */}
      <div class="flex items-center justify-between">
        <button
          onClick={() => navigateTo("drivers")}
          class="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container-low transition-colors shadow-sm"
        >
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Drivers</span>
        </button>

        <div class="flex items-center gap-2">
          {["7D", "30D", "90D"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              class={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === range
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border border-outline-variant"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Driver Header Profile Card */}
      <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex items-center gap-5">
            <img
              src={driver.avatar}
              alt={driver.name}
              class="w-20 h-20 rounded-full object-cover border-4 border-surface-container-high shadow-md"
            />
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-extrabold text-on-surface">{driver.name}</h1>
                <span
                  class={`px-3 py-1 text-xs font-extrabold rounded-full ${
                    driver.status === "Safe"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  {driver.status}
                </span>
              </div>
              <p class="text-xs font-mono text-on-surface-variant mt-1">
                {driver.id} • Assigned: <strong class="text-on-surface">{driver.assignedVehicleName}</strong>
              </p>
              <div class="flex flex-wrap items-center gap-4 mt-2 text-xs text-on-surface-variant">
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px] text-outline">call</span>
                  {driver.phone}
                </span>
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px] text-outline">route</span>
                  {driver.route}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div class="flex items-center gap-3">
            <button
              onClick={handleSendMessage}
              class="px-4 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs hover:opacity-90 transition-all shadow-sm flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">chat</span>
              <span>{messageSent ? "Message Sent!" : "Message Driver"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Safety Score & Metrics Summary (Stitch ZIP 4) */}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Safety Score Gauge Card */}
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-outline">
            Safety Score ({timeRange})
          </span>
          <div class="my-3 flex items-baseline gap-2">
            <span class="text-4xl font-black text-on-surface">{driver.safetyScore}</span>
            <span class="text-base text-outline font-bold">/ 100</span>
          </div>
          <div class="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
            <div
              class="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${driver.safetyScore}%` }}
            ></div>
          </div>
        </div>

        {/* Drowsiness Events Card */}
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm">
          <span class="text-xs font-bold uppercase tracking-wider text-outline">
            Drowsiness Events
          </span>
          <div class="text-3xl font-black text-on-surface mt-2">{driver.drowsinessEvents7D}</div>
          <span class="text-xs text-emerald-600 font-bold mt-1 block">Low Risk Rating</span>
        </div>

        {/* Distraction Events Card */}
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm">
          <span class="text-xs font-bold uppercase tracking-wider text-outline">
            Distraction Events
          </span>
          <div class="text-3xl font-black text-on-surface mt-2">{driver.distractionEvents7D}</div>
          <span class="text-xs text-amber-600 font-bold mt-1 block">Needs Mild Attention</span>
        </div>

        {/* Total Hours Monitored */}
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm">
          <span class="text-xs font-bold uppercase tracking-wider text-outline">
            Monitored Sessions
          </span>
          <div class="text-3xl font-black text-on-surface mt-2">{driver.totalHoursMonitored}h</div>
          <span class="text-xs text-on-surface-variant font-bold mt-1 block">
            {driver.totalSessions7D} Total Sessions
          </span>
        </div>
      </div>

      {/* Incidents & Session Logs Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents Timeline (Stitch ZIP 4) */}
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-amber-600 text-xl">event_note</span>
              <h2 class="text-lg font-bold text-on-surface">Recent Safety Incidents</h2>
            </div>
            <span class="text-xs font-bold text-outline">{incidents.length} Events Logged</span>
          </div>

          <div class="space-y-3">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                class="p-4 rounded-xl border border-outline-variant bg-surface-container-low/50 space-y-1.5"
              >
                <div class="flex items-center justify-between">
                  <span
                    class={`px-2 py-0.5 text-[10px] font-extrabold rounded ${
                      inc.severity === "CRITICAL"
                        ? "bg-error text-on-error"
                        : inc.severity === "HIGH"
                        ? "bg-amber-600 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {inc.severity}
                  </span>
                  <span class="text-xs text-outline">{inc.time}</span>
                </div>
                <h4 class="font-bold text-sm text-on-surface">{inc.title}</h4>
                <p class="text-xs text-on-surface-variant">{inc.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Monitoring Session History Table (Stitch ZIP 4) */}
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-xl">history</span>
              <h2 class="text-lg font-bold text-on-surface">Monitoring Session History</h2>
            </div>
            <span class="text-xs font-semibold text-outline">Software-based Telemetry</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-outline-variant text-outline uppercase font-bold tracking-wider">
                  <th class="py-2.5 px-3">Session ID</th>
                  <th class="py-2.5 px-3">Date</th>
                  <th class="py-2.5 px-3">Duration</th>
                  <th class="py-2.5 px-3">Safety Score</th>
                  <th class="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/40 text-on-surface font-medium">
                {sessions.map((ses) => (
                  <tr key={ses.id} class="hover:bg-surface-container-low/50">
                    <td class="py-3 px-3 font-mono font-bold text-primary">{ses.id}</td>
                    <td class="py-3 px-3">{ses.date}</td>
                    <td class="py-3 px-3">{ses.duration}</td>
                    <td class="py-3 px-3 font-bold">{ses.safetyScore}%</td>
                    <td class="py-3 px-3">
                      <span
                        class={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          ses.status === "Active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ses.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
