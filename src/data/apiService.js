import {
  initialDrivers,
  initialVehicles,
  initialAlerts,
  initialIncidents,
  initialMonitoringSessions
} from "./mockData";

const API_BASE_URL = "http://localhost:5000/api";

const mapBackendToFrontendDriver = (doc) => {
  if (!doc) return null;
  return {
    _id: doc._id,
    id: doc.driverId || doc._id,
    name: doc.fullName || "Unknown Driver",
    assignedVehicleId: doc.assignedVehicle || "Unassigned",
    assignedVehicleName: doc.assignedVehicle ? `Vehicle (${doc.assignedVehicle})` : "Unassigned",
    status: doc.status || "Safe",
    safetyScore: doc.safetyScore ?? 100,
    phone: doc.phoneNumber || "",
    licenseNumber: doc.licenseNumber || "",
    route: doc.assignedRoute || "",
    joinDate: doc.joiningDate
      ? new Date(doc.joiningDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    avatar:
      doc.profilePhoto ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    drowsinessEvents7D: doc.drowsinessEvents7D ?? 0,
    distractionEvents7D: doc.distractionEvents7D ?? 0,
    speedingEvents7D: doc.speedingEvents7D ?? 0,
    totalSessions7D: doc.monitoringSessions ?? 0,
    totalHoursMonitored: doc.totalHoursMonitored ?? (doc.monitoringSessions ? doc.monitoringSessions * 8 : 8)
  };
};

const mapFrontendToBackendDriver = (driverData) => {
  const generatedId = `DRV-${Math.floor(1000 + Math.random() * 9000)}`;
  return {
    fullName: driverData.name || driverData.fullName || "New Driver",
    driverId: driverData.driverId || driverData.id || generatedId,
    profilePhoto: driverData.avatar || driverData.profilePhoto || "",
    phoneNumber: driverData.phone || driverData.phoneNumber || "",
    licenseNumber: driverData.license || driverData.licenseNumber || "",
    assignedVehicle: driverData.vehicleId || driverData.assignedVehicleId || driverData.assignedVehicle || "",
    assignedRoute: driverData.route || driverData.assignedRoute || "",
    joiningDate: driverData.joinDate || driverData.joiningDate || new Date().toISOString(),
    status: driverData.status || "Safe",
    safetyScore: driverData.safetyScore ?? 90,
    totalIncidents: driverData.totalIncidents ?? 0,
    monitoringSessions: driverData.monitoringSessions ?? 0
  };
};

const mapBackendToFrontendVehicle = (doc) => {
  if (!doc) return null;
  return {
    _id: doc._id,
    id: doc.vehicleId || doc._id,
    regNumber: doc.regNumber || "KA-01-XX-9999",
    model: doc.model || "Commercial Vehicle",
    assignedDriverId: doc.assignedDriverId || "Unassigned",
    assignedDriverName: doc.assignedDriverName || "Unassigned",
    route: doc.route || "Main Route",
    systemStatus: doc.systemStatus || "Active & Monitored",
    lastActiveSession: doc.lastActiveSession || "MS-ACTIVE"
  };
};

const mapFrontendToBackendVehicle = (vehicleData) => {
  const generatedId = `VEH-${Math.floor(100 + Math.random() * 900)}`;
  return {
    vehicleId: vehicleData.vehicle_id || vehicleData.vehicleId || vehicleData.id || generatedId,
    regNumber: vehicleData.reg_number || vehicleData.regNumber || "KA-01-NEW-0000",
    model: vehicleData.model || "Commercial Truck",
    assignedDriverId: vehicleData.assigned_driver || vehicleData.assignedDriverId || "",
    assignedDriverName: vehicleData.assigned_driver_name || vehicleData.assignedDriverName || "",
    route: vehicleData.assigned_route || vehicleData.route || "Main Express Route",
    systemStatus: vehicleData.systemStatus || "Active & Monitored",
    lastActiveSession: vehicleData.lastActiveSession || "MS-NEW"
  };
};

// API Service Abstraction Layer for Vigi360 Fleet Safety Dashboard
class ApiService {
  constructor() {
    this.drivers = [...initialDrivers];
    this.vehicles = [];
    this.alerts = [...initialAlerts];
    this.incidents = [...initialIncidents];
    this.sessions = [...initialMonitoringSessions];
  }

  // --- DRIVER APIs (MongoDB + Express Backend) ---
  async getDrivers() {
    try {
      const res = await fetch(`${API_BASE_URL}/drivers`);
      if (!res.ok) throw new Error("Failed to fetch drivers from backend");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const backendDrivers = json.data.map(mapBackendToFrontendDriver);
        this.drivers = backendDrivers;
        return [...this.drivers];
      }
      throw new Error(json.message || "Invalid driver response from backend");
    } catch (err) {
      console.warn("Backend unavailable, using mock driver data fallback:", err.message);
      return [...this.drivers];
    }
  }

  async getDriverById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/drivers/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return mapBackendToFrontendDriver(json.data);
        }
      }
    } catch (err) {
      console.warn(`Backend fetch for driver ${id} failed, using local match:`, err.message);
    }
    const driver = this.drivers.find((d) => d.id === id || d._id === id) || this.drivers[0];
    return driver;
  }

  async createDriver(driverData) {
    const payload = mapFrontendToBackendDriver(driverData);
    try {
      const res = await fetch(`${API_BASE_URL}/drivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const created = mapBackendToFrontendDriver(json.data);
        this.drivers.unshift(created);
        return created;
      }
      throw new Error(json.message || "Failed to create driver on backend");
    } catch (err) {
      console.warn("Backend driver creation failed, using local fallback:", err.message);
      const fallbackDriver = {
        id: payload.driverId,
        name: payload.fullName,
        assignedVehicleId: payload.assignedVehicle || "VEH-001",
        assignedVehicleName: driverData.vehicleName || "Unassigned",
        status: payload.status,
        safetyScore: payload.safetyScore,
        phone: payload.phoneNumber || "+91 90000 00000",
        licenseNumber: payload.licenseNumber || "DL-PENDING",
        route: payload.assignedRoute || "Metro Area",
        joinDate: new Date().toISOString().split("T")[0],
        avatar:
          payload.profilePhoto ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        drowsinessEvents7D: 0,
        distractionEvents7D: 0,
        speedingEvents7D: 0,
        totalSessions7D: 1,
        totalHoursMonitored: 8
      };
      this.drivers.unshift(fallbackDriver);
      return fallbackDriver;
    }
  }

  async updateDriver(id, driverData) {
    const payload = mapFrontendToBackendDriver(driverData);
    try {
      const res = await fetch(`${API_BASE_URL}/drivers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const updated = mapBackendToFrontendDriver(json.data);
          this.drivers = this.drivers.map((d) => (d.id === id || d._id === id ? updated : d));
          return updated;
        }
      }
    } catch (err) {
      console.warn(`Backend update failed for driver ${id}:`, err.message);
    }
    return null;
  }

  async deleteDriver(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/drivers/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        this.drivers = this.drivers.filter((d) => d.id !== id && d._id !== id);
        return true;
      }
    } catch (err) {
      console.warn(`Backend delete failed for driver ${id}:`, err.message);
    }
    return false;
  }

  // --- VEHICLE APIs (MongoDB + Express Backend) ---
  async getVehicles() {
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles`);
      if (!res.ok) throw new Error("Failed to fetch vehicles from backend");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const backendVehicles = json.data.map(mapBackendToFrontendVehicle);
        this.vehicles = backendVehicles;
        return [...this.vehicles];
      }
      throw new Error(json.message || "Invalid vehicle response from backend");
    } catch (err) {
      console.warn("Backend unavailable, using mock vehicle data fallback:", err.message);
      return [...this.vehicles];
    }
  }

  async getVehicleById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return mapBackendToFrontendVehicle(json.data);
        }
      }
    } catch (err) {
      console.warn(`Backend fetch for vehicle ${id} failed:`, err.message);
    }
    return this.vehicles.find((v) => v.id === id || v._id === id) || this.vehicles[0];
  }

  async createVehicle(vehicleData) {
    const payload = mapFrontendToBackendVehicle(vehicleData);
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const created = mapBackendToFrontendVehicle(json.data);
        this.vehicles.unshift(created);
        return created;
      }
      throw new Error(json.message || "Failed to create vehicle on backend");
    } catch (err) {
      console.warn("Backend vehicle creation failed, using local fallback:", err.message);
      const fallbackVehicle = {
        id: payload.vehicleId,
        regNumber: payload.regNumber,
        model: payload.model,
        assignedDriverId: payload.assignedDriverId || "DRV-001",
        assignedDriverName: payload.assignedDriverName || "Arun Kumar",
        route: payload.route,
        systemStatus: payload.systemStatus,
        lastActiveSession: payload.lastActiveSession
      };
      this.vehicles.unshift(fallbackVehicle);
      return fallbackVehicle;
    }
  }

  async updateVehicle(id, vehicleData) {
    const payload = mapFrontendToBackendVehicle(vehicleData);
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const updated = mapBackendToFrontendVehicle(json.data);
          this.vehicles = this.vehicles.map((v) => (v.id === id || v._id === id ? updated : v));
          return updated;
        }
      }
    } catch (err) {
      console.warn(`Backend vehicle update failed for ${id}:`, err.message);
    }
    return null;
  }

  async deleteVehicle(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        this.vehicles = this.vehicles.filter((v) => v.id !== id && v._id !== id);
        return true;
      }
    } catch (err) {
      console.warn(`Backend vehicle delete failed for ${id}:`, err.message);
    }
    return false;
  }

  // --- ALERT APIs ---
  async getAlerts() {
    try {
      const res = await fetch(`${API_BASE_URL}/alerts`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          // Map backend alert objects to guarantee consistent id, status, and severity properties
          const backendAlerts = json.data.map((doc) => ({
            ...doc,
            id: doc.id || (doc._id ? String(doc._id) : `ALT-${Math.floor(1000 + Math.random() * 9000)}`),
            status: doc.status || "Unresolved",
            severity: doc.severity || "CRITICAL"
          }));

          const backendIds = new Set();
          backendAlerts.forEach((a) => {
            if (a.id) backendIds.add(String(a.id));
            if (a._id) backendIds.add(String(a._id));
          });

          const uniqueMockAlerts = this.alerts.filter(
            (a) => !backendIds.has(String(a.id)) && (!a._id || !backendIds.has(String(a._id)))
          );

          const combined = [...backendAlerts, ...uniqueMockAlerts];
          this.alerts = combined;
          return [...combined];
        }
      } else {
        console.warn(`[apiService] GET /api/alerts response failed with HTTP status ${res.status}`);
      }
    } catch (err) {
      console.warn("[apiService] Backend alerts unavailable, using local alerts fallback:", err.message);
    }
    return Promise.resolve([...this.alerts]);
  }

  async resolveAlert(alertId) {
    if (!alertId) return this.getAlerts();

    const targetIdStr = String(alertId);

    // Update local fallback array first so mock alerts update immediately
    this.alerts = this.alerts.map((alert) =>
      String(alert.id) === targetIdStr || (alert._id && String(alert._id) === targetIdStr)
        ? { ...alert, status: "Resolved" }
        : alert
    );

    try {
      const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/resolve`, {
        method: "PUT"
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          console.log(`[apiService] Backend alert ${alertId} resolved successfully:`, json.data);
        }
      } else {
        console.warn(`[apiService] PUT /api/alerts/${alertId}/resolve status: ${res.status}`);
      }
    } catch (err) {
      console.warn(`[apiService] Backend resolveAlert network warning for ${alertId}:`, err.message);
    }

    return this.getAlerts();
  }

  // --- INCIDENTS & SESSION APIs ---
  async getIncidentsByDriverId(driverId) {
    const filtered = this.incidents.filter((inc) => inc.driverId === driverId);
    return Promise.resolve(filtered.length > 0 ? filtered : this.incidents);
  }

  async getSessionsByDriverId(driverId) {
    const filtered = this.sessions.filter((s) => s.driverId === driverId);
    return Promise.resolve(filtered.length > 0 ? filtered : this.sessions);
  }
}

export const apiService = new ApiService();
