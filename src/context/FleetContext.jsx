import React, { createContext, useContext, useState, useEffect } from "react";
import { apiService } from "../data/apiService";

const FleetContext = createContext(null);

export const FleetProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState({
    name: "Fleet Manager",
    email: "manager@fleet.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIhFFpOYGRXHrtxBFJubz9VDvlt3A1UnOwbmkt-cgqC9LXHxh2-wJtXUh4jifnmlYGezxYnPxfyFi8BTfdv67dVi_49jdl2n1h6dpn3-0kpZ6_-32FIrt2PKES8b3r9qthklB4niQLW1mWUMwLbVzcJExCC4bhzSEeQzMmOYVMhuc2NQPocxXY_4S4lZlKpOzG8UkCZ6-aWEh5aJ-iFVXpTjD5b0gE9KJZDtHzng83tocOe_EVq_2bUw"
  });

  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'alerts' | 'drivers' | 'driver-profile'
  const [selectedDriverId, setSelectedDriverId] = useState("DRV-001");

  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [sessions, setSessions] = useState([]);

  // Modals state
  const [isCreateDriverOpen, setIsCreateDriverOpen] = useState(false);
  const [isCreateVehicleOpen, setIsCreateVehicleOpen] = useState(false);

  // Filters state
  const [alertFilter, setAlertFilter] = useState("ALL");
  const [driverSearchQuery, setDriverSearchQuery] = useState("");
  const [driverFilterStatus, setDriverFilterStatus] = useState("All");

  // Notification Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load initial data from apiService
  useEffect(() => {
    const loadData = async () => {
      const d = await apiService.getDrivers();
      const v = await apiService.getVehicles();
      const a = await apiService.getAlerts();
      const inc = await apiService.getIncidentsByDriverId(selectedDriverId);
      const ses = await apiService.getSessionsByDriverId(selectedDriverId);

      setDrivers(d);
      setVehicles(v);
      setAlerts(a);
      setIncidents(inc);
      setSessions(ses);
    };
    loadData();
  }, []);

  // Poll backend for real-time live alerts periodically
  useEffect(() => {
    const pollAlerts = setInterval(async () => {
      const latestAlerts = await apiService.getAlerts();
      setAlerts(latestAlerts);
    }, 4000);
    return () => clearInterval(pollAlerts);
  }, []);


  // Update driver details when selectedDriverId changes
  useEffect(() => {
    const updateDriverDetails = async () => {
      if (selectedDriverId) {
        const inc = await apiService.getIncidentsByDriverId(selectedDriverId);
        const ses = await apiService.getSessionsByDriverId(selectedDriverId);
        setIncidents(inc);
        setSessions(ses);
      }
    };
    updateDriverDetails();
  }, [selectedDriverId]);

  const login = (email, password) => {
    setIsAuthenticated(true);
    setUser((prev) => ({ ...prev, email: email || "manager@fleet.com" }));
    setActiveTab("dashboard");
    showToast("Successfully logged in to Vigi360 Fleet Safety System");
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const navigateTo = (tab, params = {}) => {
    if (params.driverId) {
      setSelectedDriverId(params.driverId);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resolveAlert = async (alertId) => {
    if (!alertId) return;

    const targetIdStr = String(alertId);

    // Immediate optimistic state update in FleetContext
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        String(alert.id) === targetIdStr || (alert._id && String(alert._id) === targetIdStr)
          ? { ...alert, status: "Resolved" }
          : alert
      )
    );

    const updated = await apiService.resolveAlert(alertId);
    if (updated && Array.isArray(updated)) {
      setAlerts(updated);
    }
    showToast(`Alert ${alertId} resolved successfully.`);
  };

  const addDriver = async (driverData) => {
    const newDriver = await apiService.createDriver(driverData);
    setDrivers((prev) => [newDriver, ...prev]);
    setIsCreateDriverOpen(false);
    showToast(`New Driver ${newDriver.name} (${newDriver.id}) added successfully!`);
    navigateTo("drivers");
  };

  const addVehicle = async (vehicleData) => {
    const newVehicle = await apiService.createVehicle(vehicleData);
    setVehicles((prev) => [newVehicle, ...prev]);
    setIsCreateVehicleOpen(false);
    showToast(`New Vehicle ${newVehicle.id} (${newVehicle.model}) created successfully!`);
  };

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId || d._id === selectedDriverId) || drivers[0];

  return (
    <FleetContext.Provider
      value={{
        isAuthenticated,
        user,
        activeTab,
        selectedDriverId,
        selectedDriver,
        drivers,
        vehicles,
        alerts,
        incidents,
        sessions,
        isCreateDriverOpen,
        isCreateVehicleOpen,
        alertFilter,
        driverSearchQuery,
        driverFilterStatus,
        toastMessage,
        setToastMessage,
        setAlertFilter,
        setDriverSearchQuery,
        setDriverFilterStatus,
        login,
        logout,
        navigateTo,
        resolveAlert,
        addDriver,
        addVehicle,
        openCreateDriverModal: () => setIsCreateDriverOpen(true),
        closeCreateDriverModal: () => setIsCreateDriverOpen(false),
        openCreateVehicleModal: () => setIsCreateVehicleOpen(true),
        closeCreateVehicleModal: () => setIsCreateVehicleOpen(false),
      }}
    >
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = () => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error("useFleet must be used within a FleetProvider");
  }
  return context;
};
