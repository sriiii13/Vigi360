import React, { useState, useEffect } from 'react';
import { BusHeader } from './components/BusHeader';
import { CameraFeed } from './components/CameraFeed';

const FALLBACK_DRIVERS = [
  { id: "DRV-001", name: "Arun Kumar", assignedVehicleId: "VEH-001" },
  { id: "DRV-002", name: "Kumar", assignedVehicleId: "VEH-002" },
  { id: "DRV-003", name: "Ravi", assignedVehicleId: "VEH-003" },
  { id: "DRV-004", name: "Suresh", assignedVehicleId: "VEH-004" }
];

const FALLBACK_VEHICLES = [
  { id: "VEH-001", regNumber: "KA-01-MJ-4829", model: "Toyota HiAce", assignedDriverId: "DRV-001" },
  { id: "VEH-002", regNumber: "KA-05-MH-9102", model: "Volvo FH16", assignedDriverId: "DRV-002" },
  { id: "VEH-003", regNumber: "KA-03-MK-2041", model: "Isuzu ELF", assignedDriverId: "DRV-003" },
  { id: "VEH-004", regNumber: "KA-04-MP-8833", model: "Tata Prima", assignedDriverId: "DRV-004" }
];

export default function App() {
  const [drivers, setDrivers] = useState(FALLBACK_DRIVERS);
  const [vehicles, setVehicles] = useState(FALLBACK_VEHICLES);

  const [activeDriverId, setActiveDriverId] = useState(() => {
    return localStorage.getItem('vigi360_active_driver') || "DRV-001";
  });

  const [activeVehicleId, setActiveVehicleId] = useState(() => {
    return localStorage.getItem('vigi360_active_vehicle') || "VEH-001";
  });

  // Fetch drivers and vehicles from backend API if available
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const [driversRes, vehiclesRes] = await Promise.all([
          fetch("http://localhost:5000/api/drivers"),
          fetch("http://localhost:5000/api/vehicles")
        ]);

        if (driversRes.ok) {
          const dJson = await driversRes.json();
          if (dJson.success && Array.isArray(dJson.data) && dJson.data.length > 0) {
            const mapped = dJson.data.map((d) => ({
              id: d.driverId || d._id,
              name: d.fullName || d.name || "Unknown Driver",
              assignedVehicleId: d.assignedVehicle || d.assignedVehicleId || ""
            }));
            setDrivers(mapped);
          }
        }

        if (vehiclesRes.ok) {
          const vJson = await vehiclesRes.json();
          if (vJson.success && Array.isArray(vJson.data) && vJson.data.length > 0) {
            const mapped = vJson.data.map((v) => ({
              id: v.vehicleId || v._id,
              model: v.model || "Commercial Vehicle",
              regNumber: v.regNumber || "",
              assignedDriverId: v.assignedDriverId || ""
            }));
            setVehicles(mapped);
          }
        }
      } catch (err) {
        console.warn("[Vigi360 Bus App] Server offline or fetch notice, using fallback drivers & vehicles:", err.message);
      }
    };

    fetchSessionData();
  }, []);

  // Handle Driver Selection Change
  const handleSelectDriver = (driverId) => {
    setActiveDriverId(driverId);
    localStorage.setItem('vigi360_active_driver', driverId);

    // Auto-select assigned vehicle if available
    const selectedDrv = drivers.find((d) => d.id === driverId);
    if (selectedDrv && selectedDrv.assignedVehicleId) {
      const matchVehicle = vehicles.find(
        (v) => v.id === selectedDrv.assignedVehicleId || v.id === selectedDrv.assignedVehicleId
      );
      if (matchVehicle) {
        setActiveVehicleId(matchVehicle.id);
        localStorage.setItem('vigi360_active_vehicle', matchVehicle.id);
      }
    }
  };

  // Handle Vehicle Selection Change
  const handleSelectVehicle = (vehicleId) => {
    setActiveVehicleId(vehicleId);
    localStorage.setItem('vigi360_active_vehicle', vehicleId);
  };

  const activeDriver = drivers.find((d) => d.id === activeDriverId) || drivers[0] || FALLBACK_DRIVERS[0];
  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0] || FALLBACK_VEHICLES[0];

  return (
    <div className="min-h-screen bg-busDark text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">

      {/* Top Header Navigation */}
      <BusHeader
        drivers={drivers}
        vehicles={vehicles}
        activeDriverId={activeDriver.id}
        activeVehicleId={activeVehicle.id}
        onSelectDriver={handleSelectDriver}
        onSelectVehicle={handleSelectVehicle}
      />

      {/* Main Content Area: Dedicated Live Camera Feed */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col">
        <CameraFeed
          activeDriver={activeDriver}
          activeVehicle={activeVehicle}
        />
      </main>

      {/* Footer */}
      <footer className="bg-busSurface/80 border-t border-busBorder py-3 px-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-sm">videocam</span>
            <span>Vigi360 Bus Camera — Active Monitoring Session</span>
          </div>
          <div className="text-slate-500">
            Assigned: <strong className="text-cyan-400">{activeDriver.name}</strong> ({activeDriver.id}) • Vehicle: <strong className="text-cyan-400">{activeVehicle.id}</strong>
          </div>
        </div>
      </footer>

    </div>
  );
}


