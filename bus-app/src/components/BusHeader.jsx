import React from 'react';

export const BusHeader = ({
  drivers = [],
  vehicles = [],
  activeDriverId = "",
  activeVehicleId = "",
  onSelectDriver = () => { },
  onSelectVehicle = () => { }
}) => {
  return (
    <header className="bg-busSurface border-b border-busBorder px-4 sm:px-6 py-4 shadow-xl">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

        {/* Brand & App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <span className="material-symbols-outlined text-black font-bold text-xl">videocam</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">Vigi360 Bus Camera</h1>
              <span className="bg-cyan-500/20 text-cyan-400 text-xs font-semibold px-2 py-0.5 rounded border border-cyan-500/30">
                LIVE CAMERA FEED
              </span>
            </div>
            <p className="text-xs text-slate-400">Driver Safety Telemetry & Monitoring Session</p>
          </div>
        </div>

        {/* Active Session Driver & Vehicle Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Driver Selection */}
          <div className="flex items-center gap-2 bg-busDark border border-busBorder px-3 py-1.5 rounded-xl text-xs flex-1 sm:flex-initial">
            <span className="material-symbols-outlined text-cyan-400 text-sm">person</span>
            <span className="text-slate-400 font-medium">Driver:</span>
            <select
              value={activeDriverId}
              onChange={(e) => onSelectDriver(e.target.value)}
              className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer border-none py-0.5 pr-1 max-w-[150px] sm:max-w-none truncate"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                  {d.name} ({d.id})
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Selection */}
          <div className="flex items-center gap-2 bg-busDark border border-busBorder px-3 py-1.5 rounded-xl text-xs flex-1 sm:flex-initial">
            <span className="material-symbols-outlined text-cyan-400 text-sm">directions_bus</span>
            <span className="text-slate-400 font-medium">Vehicle:</span>
            <select
              value={activeVehicleId}
              onChange={(e) => onSelectVehicle(e.target.value)}
              className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer border-none py-0.5 pr-1 max-w-[150px] sm:max-w-none truncate"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                  {v.model || v.regNumber} ({v.id})
                </option>
              ))}
            </select>
          </div>

          {/* Connection Status Badge */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-busDark px-3 py-1.5 rounded-xl border border-busBorder">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-semibold text-slate-300">Session Linked</span>
          </div>
        </div>

      </div>
    </header>
  );
};


