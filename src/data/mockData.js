export const initialDrivers = [
  {
    id: "DRV-001",
    name: "Arun Kumar",
    assignedVehicleId: "VEH-001",
    assignedVehicleName: "Toyota HiAce (VEH-001)",
    status: "Safe",
    safetyScore: 92,
    phone: "+91 98765 43210",
    licenseNumber: "DL-142011009876",
    route: "North Metro Delivery Route",
    joinDate: "2023-04-15",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8aln8cU27xfa2_ZQU7EenMc-ExevzFDr19EuQCWuSeQEL-p0NIVHVcbNbxUpqRVUc9eGFZiDPbivKKc0nLY1djatrfW6UT1xq6cMl7LP8V3ijKkTLpyhUFKtJ-KoQTQdzeAtjstVNHgYhzC3oknDoCcDvr1q9ztXTZG755WyXWk20XLWyo_6j0HzeQcs-8I8slJcAHtxjvyvw-eM60RrOaIqgDEqhCoAytYqxrJ8z2pLeYMX4ZWBdLw",
    drowsinessEvents7D: 2,
    distractionEvents7D: 4,
    speedingEvents7D: 1,
    totalSessions7D: 18,
    totalHoursMonitored: 142
  },
  {
    id: "DRV-002",
    name: "Kumar",
    assignedVehicleId: "VEH-002",
    assignedVehicleName: "Volvo FH16 (VEH-002)",
    status: "Needs Attention",
    safetyScore: 74,
    phone: "+91 98765 12345",
    licenseNumber: "DL-142011005432",
    route: "Interstate Highway Corridor 4",
    joinDate: "2022-11-01",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHpMb44pZ5JyR6VFvtGkOlq4cno4ngMLF3-tPmxvZApvfrfocKm463X2OTbTz5LaUor-16griDgyJmelhp-6LgEx5vc2J5Ip8hly4hVEQJvwU8YkM-Omr0Lqivv3Azq0W7rmBwpLNp1qoWK1S96pAZ1IGA1Q2LaeX13eH7QhJyor5o9cYpf6S_RfBQrn1lpMGrUtvlvjIxRVH97frfBYre7X3hK5Q87NWI8k9Iw80JKzLvMeTmebRI9w",
    drowsinessEvents7D: 6,
    distractionEvents7D: 9,
    speedingEvents7D: 3,
    totalSessions7D: 15,
    totalHoursMonitored: 120
  },
  {
    id: "DRV-003",
    name: "Ravi",
    assignedVehicleId: "VEH-003",
    assignedVehicleName: "Isuzu ELF (VEH-003)",
    status: "Safe",
    safetyScore: 88,
    phone: "+91 98765 67890",
    licenseNumber: "DL-142011006789",
    route: "South Zone Logistics Loop",
    joinDate: "2024-01-10",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmfEuAmCtj-0K-yMYQ1woNubAQzYL7DYHFK18yBpHjEdgA4R6NmBpzziCxNPmnZWMi6MXZxnvwYW5bqQzsOZPgYe41icI_kPNwyvX1gGJK2yC5tY-48snUx8R-nlbmGKlZXta4YOrU-UYrKoIkVoRlOafGbXCk41WKP-7Co66y5Aw8ihkaLYwIXF9KNO656w49K7goOsLplH4FLJW7Og52fahnY05F_4EqXFT9zhVfRnRaTw4cCu5IcQ",
    drowsinessEvents7D: 1,
    distractionEvents7D: 2,
    speedingEvents7D: 0,
    totalSessions7D: 20,
    totalHoursMonitored: 160
  },
  {
    id: "DRV-004",
    name: "Suresh",
    assignedVehicleId: "VEH-004",
    assignedVehicleName: "Tata Prima (VEH-004)",
    status: "Needs Attention",
    safetyScore: 65,
    phone: "+91 98765 99988",
    licenseNumber: "DL-142011009988",
    route: "East Freight Ring Road",
    joinDate: "2023-08-20",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    drowsinessEvents7D: 8,
    distractionEvents7D: 12,
    speedingEvents7D: 5,
    totalSessions7D: 14,
    totalHoursMonitored: 110
  }
];

export const initialVehicles = [
  {
    id: "VEH-001",
    regNumber: "KA-01-MJ-4829",
    model: "Toyota HiAce (Delivery Van)",
    assignedDriverId: "DRV-001",
    assignedDriverName: "Arun Kumar",
    route: "North Metro Delivery Route",
    systemStatus: "Active & Monitored",
    lastActiveSession: "MS-9402"
  },
  {
    id: "VEH-002",
    regNumber: "KA-05-MH-9102",
    model: "Volvo FH16 (Long Haul Truck)",
    assignedDriverId: "DRV-002",
    assignedDriverName: "Kumar",
    route: "Interstate Highway Corridor 4",
    systemStatus: "Active & Monitored",
    lastActiveSession: "MS-9399"
  },
  {
    id: "VEH-003",
    regNumber: "KA-03-MK-2041",
    model: "Isuzu ELF (Freight Transport)",
    assignedDriverId: "DRV-003",
    assignedDriverName: "Ravi",
    route: "South Zone Logistics Loop",
    systemStatus: "Active & Monitored",
    lastActiveSession: "MS-9401"
  },
  {
    id: "VEH-004",
    regNumber: "KA-04-MP-8833",
    model: "Tata Prima (Heavy Cargo Carrier)",
    assignedDriverId: "DRV-004",
    assignedDriverName: "Suresh",
    route: "East Freight Ring Road",
    systemStatus: "Active & Monitored",
    lastActiveSession: "MS-9400"
  }
];

export const initialAlerts = [
  {
    id: "ALT-1001",
    driverId: "DRV-001",
    driverName: "Arun Kumar",
    vehicleId: "VEH-001",
    type: "Severe Drowsiness",
    severity: "CRITICAL", // CRITICAL, HIGH, WARNING
    timestamp: "10 mins ago",
    details: "Multiple microsleep eyes closed events detected (> 2.5s duration)",
    status: "Unresolved"
  },
  {
    id: "ALT-1002",
    driverId: "DRV-004",
    driverName: "Suresh",
    vehicleId: "VEH-004",
    type: "Mobile Phone Usage",
    severity: "HIGH",
    timestamp: "25 mins ago",
    details: "Continuous phone viewing while driver monitoring active",
    status: "Unresolved"
  },
  {
    id: "ALT-1003",
    driverId: "DRV-002",
    driverName: "Kumar",
    vehicleId: "VEH-002",
    type: "Driver Distraction",
    severity: "WARNING",
    timestamp: "1 hour ago",
    details: "Head posture off-road angle exceeding safety threshold for 15s",
    status: "Resolved"
  },
  {
    id: "ALT-1004",
    driverId: "DRV-003",
    driverName: "Ravi",
    vehicleId: "VEH-003",
    type: "Yawning Cluster",
    severity: "WARNING",
    timestamp: "2 hours ago",
    details: "Repeated yawning frequency threshold alert",
    status: "Resolved"
  }
];

export const initialIncidents = [
  {
    id: "INC-501",
    driverId: "DRV-001",
    title: "Severe Eye Closure Event",
    time: "Today, 08:42 AM",
    severity: "CRITICAL",
    status: "Action Required",
    description: "Camera AI detected eye closure over 2.4 seconds during active driving session."
  },
  {
    id: "INC-502",
    driverId: "DRV-001",
    title: "Yawning Cluster Detected",
    time: "Yesterday, 16:15 PM",
    severity: "HIGH",
    status: "Reviewed",
    description: "4 consecutive yawn cycles in 5 minute interval indicating onset fatigue."
  },
  {
    id: "INC-503",
    driverId: "DRV-001",
    title: "Phone View Distraction",
    time: "08 Aug 2026, 11:20 AM",
    severity: "WARNING",
    status: "Resolved",
    description: "Gaze diverted downwards towards handheld device."
  }
];

export const initialMonitoringSessions = [
  {
    id: "MS-9402",
    driverId: "DRV-001",
    vehicleId: "VEH-001",
    date: "12 Aug 2026",
    timeRange: "07:30 AM - 11:45 AM",
    duration: "4h 15m",
    safetyScore: 92,
    incidentsCount: 1,
    status: "Active"
  },
  {
    id: "MS-9388",
    driverId: "DRV-001",
    vehicleId: "VEH-001",
    date: "11 Aug 2026",
    timeRange: "08:00 AM - 05:30 PM",
    duration: "9h 30m",
    safetyScore: 95,
    incidentsCount: 0,
    status: "Completed"
  },
  {
    id: "MS-9310",
    driverId: "DRV-001",
    vehicleId: "VEH-001",
    date: "10 Aug 2026",
    timeRange: "07:45 AM - 04:15 PM",
    duration: "8h 30m",
    safetyScore: 89,
    incidentsCount: 2,
    status: "Completed"
  },
  {
    id: "MS-9255",
    driverId: "DRV-001",
    vehicleId: "VEH-001",
    date: "09 Aug 2026",
    timeRange: "08:15 AM - 06:00 PM",
    duration: "9h 45m",
    safetyScore: 94,
    incidentsCount: 0,
    status: "Completed"
  }
];
