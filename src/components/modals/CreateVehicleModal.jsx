import React, { useState } from "react";
import { useFleet } from "../../context/FleetContext";

export const CreateVehicleModal = () => {
  const { isCreateVehicleOpen, closeCreateVehicleModal, addVehicle, drivers } = useFleet();

  const [formData, setFormData] = useState({
    vehicle_id: "",
    reg_number: "",
    model: "Toyota HiAce (Delivery Van)",
    assigned_driver: drivers[0]?.id || "DRV-001",
    assigned_route: "",
    systemStatus: "Active & Monitored"
  });

  if (!isCreateVehicleOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const assignedDrv = drivers.find((d) => d.id === formData.assigned_driver);
    addVehicle({
      vehicle_id: formData.vehicle_id || `VEH-00${Math.floor(Math.random() * 90) + 10}`,
      reg_number: formData.reg_number || "KA-01-XX-9999",
      model: formData.model,
      assigned_driver: formData.assigned_driver,
      assigned_driver_name: assignedDrv ? assignedDrv.name : "Unassigned",
      assigned_route: formData.assigned_route || "Main Express Route"
    });
  };

  return (
    <div class="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-surface rounded-xl border border-outline-variant shadow-xl w-full max-w-xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div class="flex justify-between items-center px-6 py-4 border-b border-outline-variant bg-surface-container-low">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary text-2xl">directions_car</span>
            <h2 class="text-lg font-bold text-on-surface">Add New Vehicle</h2>
          </div>
          <button
            onClick={closeCreateVehicleModal}
            class="p-1 rounded-full text-outline hover:bg-surface-container-high hover:text-on-surface transition-colors"
          >
            <span class="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Form Body - Stitch ZIP 7 Layout */}
        <form onSubmit={handleSubmit} class="p-6 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">
                Vehicle ID *
              </label>
              <input
                type="text"
                required
                value={formData.vehicle_id}
                onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                placeholder="e.g. VEH-009"
                class="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">
                Registration Number *
              </label>
              <input
                type="text"
                required
                value={formData.reg_number}
                onChange={(e) => setFormData({ ...formData, reg_number: e.target.value })}
                placeholder="e.g. XYZ-1234"
                class="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">
                Vehicle Model & Type
              </label>
              <select
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                class="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="Toyota HiAce (Delivery Van)">Toyota HiAce (Delivery Van)</option>
                <option value="Volvo FH16 (Long Haul Truck)">Volvo FH16 (Long Haul Truck)</option>
                <option value="Isuzu ELF (Freight Transport)">Isuzu ELF (Freight Transport)</option>
                <option value="Tata Prima (Heavy Cargo Carrier)">Tata Prima (Heavy Cargo Carrier)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">
                Assigned Primary Driver
              </label>
              <select
                value={formData.assigned_driver}
                onChange={(e) => setFormData({ ...formData, assigned_driver: e.target.value })}
                class="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">
              Assigned Route
            </label>
            <input
              type="text"
              value={formData.assigned_route}
              onChange={(e) => setFormData({ ...formData, assigned_route: e.target.value })}
              placeholder="e.g. Route A - North City"
              class="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div class="p-3 bg-surface-container-low rounded-lg border border-outline-variant flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-xl">sensors</span>
              <span class="text-xs font-semibold text-on-surface">Vigi360 AI Monitoring Sensor Unit</span>
            </div>
            <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active
            </span>
          </div>

          <div class="pt-4 border-t border-outline-variant flex justify-end gap-3 items-center">
            <button
              type="button"
              onClick={closeCreateVehicleModal}
              class="px-4 py-2 bg-surface text-on-surface border border-outline-variant rounded-lg font-medium text-sm hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-5 py-2 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">directions_car</span>
              <span>Create Vehicle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
