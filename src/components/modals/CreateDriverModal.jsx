import React, { useState } from "react";
import { useFleet } from "../../context/FleetContext";

export const CreateDriverModal = () => {
  const { isCreateDriverOpen, closeCreateDriverModal, addDriver, vehicles } = useFleet();

  const [formData, setFormData] = useState({
    name: "",
    driverId: "",
    phone: "",
    license: "",
    route: "",
    vehicleId: vehicles[0]?.id || "VEH-001",
    joinDate: new Date().toISOString().split("T")[0],
    avatar: ""
  });

  if (!isCreateDriverOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const assignedVeh = vehicles.find((v) => v.id === formData.vehicleId);
    addDriver({
      name: formData.name || "New Driver",
      driverId: formData.driverId,
      vehicleId: formData.vehicleId,
      vehicleName: assignedVeh ? `${assignedVeh.model} (${assignedVeh.id})` : "Unassigned",
      phone: formData.phone,
      license: formData.license,
      route: formData.route,
      joinDate: formData.joinDate,
      avatar: formData.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    });
  };

  return (
    <div class="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-surface rounded-xl border border-outline-variant shadow-xl w-full max-w-xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div class="flex justify-between items-center px-6 py-4 border-b border-outline-variant bg-surface-container-low">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary text-2xl">person_add</span>
            <h2 class="text-lg font-bold text-on-surface">Add New Driver</h2>
          </div>
          <button
            onClick={closeCreateDriverModal}
            class="p-1 rounded-full text-outline hover:bg-surface-container-high hover:text-on-surface transition-colors"
          >
            <span class="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Form Body - Stitch ZIP 6 Layout */}
        <form onSubmit={handleSubmit} class="p-6 space-y-4">
          {/* Avatar Dropzone */}
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-full bg-surface-container-high border border-outline flex items-center justify-center relative overflow-hidden group cursor-pointer">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Preview" class="w-full h-full object-cover" />
              ) : (
                <span class="material-symbols-outlined text-3xl text-outline">add_a_photo</span>
              )}
            </div>
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">
                Driver Profile Photo URL
              </label>
              <input
                type="url"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                class="w-full bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <span class="text-[11px] text-outline">Optional avatar image URL</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Jane Doe"
                class="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">
                Driver ID
              </label>
              <input
                type="text"
                value={formData.driverId}
                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                placeholder="e.g. DRV-8492"
                class="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 00000"
                class="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">
                Driver License Number
              </label>
              <input
                type="text"
                value={formData.license}
                onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                placeholder="e.g. DL-14201100"
                class="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">
                Assigned Vehicle
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                class="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.model} ({v.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">
                Assigned Route
              </label>
              <input
                type="text"
                value={formData.route}
                onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                placeholder="e.g. North Metro Route"
                class="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div class="pt-4 border-t border-outline-variant flex justify-end gap-3 items-center">
            <button
              type="button"
              onClick={closeCreateDriverModal}
              class="px-4 py-2 bg-surface text-on-surface border border-outline-variant rounded-lg font-medium text-sm hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-5 py-2 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">add</span>
              <span>Create Driver</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
