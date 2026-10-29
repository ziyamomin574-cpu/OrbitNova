import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Satellite,
  Thermometer,
  Droplets,
  Gauge,
  Rocket,
  Activity,
  MapPin,
  Radio,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Eye,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  Battery,
  Signal,
  Wind,
  Layers,
  LayoutDashboard,
  Map as MapIcon,
  Sun,
  Moon,
  ShieldCheck,
  Lock,
  X,
  User,
  UserCheck,
  Building2,
  GraduationCap,
  Mail,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  Download,
  Calendar,
  Clock
} from "lucide-react";

/* =========================================================
   TYPES & INTERFACES
========================================================= */
export interface SatelliteNode {
  id: number;
  satelliteId: string;
  collegeName: string;
  studentName?: string;
  principalName?: string;
  teacherName?: string;
  location: string;
  weatherCondition?: string;
  aqi?: number;
  temperature: number;
  humidity?: number;
  pressure?: number;
  windSpeed?: number;
  batteryLevel?: number;
  rssi?: number;
  orbitAltitude?: number;
  lat: number;
  lng: number;
  isLiveStream?: boolean;
  lastPing?: string;
  url?: string;
  childWebsiteUrl?: string;
  googleMapsUrl?: string;
  sourceType?: string;
  isCustom?: boolean;
  studentPhoto?: string;
  campusPhoto?: string;
  principalPhoto?: string;
  teacherPhoto?: string;
}

/* =========================================================
   INITIAL DATASET (IndoScience & ISRO Ground Stations)
========================================================= */
const INITIAL_STATIONS: SatelliteNode[] = [
  {
    id: 1789107210113,
    satelliteId: "CanSat-01",
    collegeName: "Soumodip_GGS",
    studentName: "Soumodip",
    principalName: "Archana Dharu",
    teacherName: "Dr. Archana Dharu",
    location: "Kasba Peth, Pune",
    weatherCondition: "Clear Sky",
    aqi: 35,
    temperature: 26.8,
    humidity: 55,
    pressure: 948,
    windSpeed: 12,
    batteryLevel: 95,
    rssi: -65,
    orbitAltitude: 500,
    lat: 18.519585,
    lng: 73.859096,
    isLiveStream: true,
    lastPing: "Live Feed Active",
    googleMapsUrl: "https://maps.app.goo.gl/xva3yjiyCSVs7F9Q7",
    isCustom: true
  },
  {
    id: 1789107210103,
    satelliteId: "CanSat-03",
    collegeName: "DR G.G.SHAH ENGLISH MEDIUM HIGH SCHOOL",
    studentName: "ARWA RAMPURWALA",
    principalName: "DR G.G.SHAH ENGLISH MEDIUM HIGH SCHOOL",
    teacherName: "Prof. S. Kulkarni",
    location: "Kasba Peth, Pune",
    weatherCondition: "Telemetry Connected",
    aqi: 36,
    temperature: 26.5,
    humidity: 60,
    pressure: 948.2,
    windSpeed: 11,
    batteryLevel: 94,
    rssi: -66,
    orbitAltitude: 520,
    lat: 18.5215,
    lng: 73.8612,
    isLiveStream: true,
    lastPing: "Live Feed Active",
    googleMapsUrl: "https://maps.google.com/?q=18.5215,73.8612",
    isCustom: true
  },
  {
    id: 1789107210109,
    satelliteId: "CanSat-09",
    collegeName: "Versatile School",
    studentName: "Ved Kher",
    principalName: "Versatile School",
    teacherName: "Mentor Joshi",
    location: "Pune, Maharashtra",
    weatherCondition: "Telemetry Link Standby",
    aqi: 39,
    temperature: 27.0,
    humidity: 58,
    pressure: 946.8,
    windSpeed: 12,
    batteryLevel: 95,
    rssi: -68,
    orbitAltitude: 540,
    lat: 18.5089,
    lng: 73.8258,
    isLiveStream: true,
    lastPing: "Live Feed Active",
    googleMapsUrl: "https://maps.google.com/?q=18.5089,73.8258",
    isCustom: true
  },
  {
    id: 1789107210130,
    satelliteId: "CanSat-30",
    collegeName: "Mansukhbhai Kothari National School",
    studentName: "Nabeel Ahmad Ansari",
    principalName: "Mansukhbhai Kothari National School",
    teacherName: "Mentor Ansari",
    location: "Kondhwa, Pune",
    weatherCondition: "Optimal Telemetry Link",
    aqi: 38,
    temperature: 27.2,
    humidity: 62,
    pressure: 947.1,
    windSpeed: 10,
    batteryLevel: 96,
    rssi: -64,
    orbitAltitude: 560,
    lat: 18.46216,
    lng: 73.89317,
    isLiveStream: true,
    lastPing: "Live Feed Active",
    googleMapsUrl: "https://maps.google.com/?q=18.46216,73.89317",
    isCustom: true
  },
  {
    id: 1789107210113,
    satelliteId: "CanSat-13",
    collegeName: "Apex International School",
    studentName: "Swara Digambar Rakshe",
    principalName: "Apex International School",
    teacherName: "Teacher Rakshe",
    location: "Pune, Maharashtra",
    weatherCondition: "Telemetry Link Standby",
    aqi: 35,
    temperature: 26.5,
    humidity: 55,
    pressure: 948.2,
    windSpeed: 9,
    batteryLevel: 98,
    rssi: -65,
    orbitAltitude: 550,
    lat: 18.5204,
    lng: 73.8567,
    isLiveStream: true,
    lastPing: "Live Feed Active",
    googleMapsUrl: "https://maps.google.com/?q=18.5204,73.8567",
    isCustom: true
  },
  {
    id: 1789107210114,
    satelliteId: "CanSat-014",
    collegeName: "Apex International School",
    studentName: "Siddhi Somnath More",
    principalName: "Apex International School",
    teacherName: "Prof. More",
    location: "Pune, Maharashtra",
    weatherCondition: "Telemetry Link Standby",
    aqi: 36,
    temperature: 26.8,
    humidity: 56,
    pressure: 947.9,
    windSpeed: 10,
    batteryLevel: 97,
    rssi: -66,
    orbitAltitude: 555,
    lat: 18.5204,
    lng: 73.8567,
    isLiveStream: true,
    lastPing: "Live Feed Active",
    googleMapsUrl: "https://maps.google.com/?q=18.5204,73.8567",
    isCustom: true
  },
  {
    id: 1789107210111,
    satelliteId: "CanSat-11",
    collegeName: "Arnav Shinde",
    studentName: "Arnav Shinde",
    principalName: "Apex International School",
    teacherName: "Lead Mentor",
    location: "Pune, Maharashtra",
    weatherCondition: "Ascending / In Flight",
    aqi: 35,
    temperature: 26.9,
    humidity: 66,
    pressure: 941.26,
    windSpeed: 12,
    batteryLevel: 91,
    rssi: -69,
    orbitAltitude: 617,
    lat: 18.481817,
    lng: 73.954033,
    isLiveStream: true,
    lastPing: "Live Feed Active",
    isCustom: true
  }
];

export const TelemetryTestDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Primary State
  const [satellites, setSatellites] = useState<SatelliteNode[]>(INITIAL_STATIONS);
  const [activeTab, setActiveTab] = useState<"dashboard" | "explorer" | "map">("dashboard");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [selectedStation, setSelectedStation] = useState<SatelliteNode | null>(null);

  // Auto-shift Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isAutoShift, setIsAutoShift] = useState(true);

  // Explorer State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "registered" | "standard">("all");
  const [filterCondition, setFilterCondition] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"id" | "temp" | "altitude" | "name">("id");

  // Portal Login Modal State (matching pd.indoscience.in)
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [activePortalView, setActivePortalView] = useState<"menu" | "school-login" | "student-login" | "admin-login" | "register">("menu");

  // In-modal login form inputs
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regSchoolName, setRegSchoolName] = useState("");
  const [regPrincipal, setRegPrincipal] = useState("");
  const [regLocation, setRegLocation] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Master Admin Panel State
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminError, setAdminError] = useState("");

  // New Node Form State
  const [newSatId, setNewSatId] = useState("");
  const [newCollege, setNewCollege] = useState("");
  const [newStudent, setNewStudent] = useState("");
  const [newPrincipal, setNewPrincipal] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newLat, setNewLat] = useState("18.5204");
  const [newLng, setNewLng] = useState("73.8567");

  // Leaflet Map Ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Sync hash routing if user opens with #/login?type=school etc.
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || "";
      if (hash.includes("/login?type=school") || hash === "#/login/school") {
        setActivePortalView("school-login");
        setIsPortalModalOpen(true);
      } else if (hash.includes("/login?type=student") || hash === "#/login/student") {
        setActivePortalView("student-login");
        setIsPortalModalOpen(true);
      } else if (hash.includes("/login/admin") || hash.includes("/admin/login")) {
        setActivePortalView("admin-login");
        setIsPortalModalOpen(true);
      } else if (hash.includes("/register")) {
        setActivePortalView("register");
        setIsPortalModalOpen(true);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Fetch live satellites from backend or proxy if available
  useEffect(() => {
    const fetchBackendSatellites = async () => {
      try {
        const res = await fetch("/api/satellites");
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.satellites) && data.satellites.length > 0) {
            setSatellites(data.satellites);
          }
        }
      } catch (e) {
        // Use initial dataset if backend proxy is offline
      }
    };
    fetchBackendSatellites();
  }, []);

  // Auto-shift carousel loop
  useEffect(() => {
    if (!isAutoShift || satellites.length === 0) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % satellites.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoShift, satellites.length]);

  const activeFocusNode = useMemo(() => {
    if (satellites.length === 0) return null;
    return satellites[carouselIndex % satellites.length];
  }, [satellites, carouselIndex]);

  // Aggregate telemetry averages
  const metrics = useMemo(() => {
    if (satellites.length === 0) {
      return { avgTemp: 26.5, avgHum: 58, avgPress: 948, avgAlt: 535 };
    }
    const totalTemp = satellites.reduce((acc, s) => acc + (s.temperature || 26), 0);
    const totalHum = satellites.reduce((acc, s) => acc + (s.humidity || 55), 0);
    const totalPress = satellites.reduce((acc, s) => acc + (s.pressure || 948), 0);
    const totalAlt = satellites.reduce((acc, s) => acc + (s.orbitAltitude || 500), 0);
    return {
      avgTemp: Number((totalTemp / satellites.length).toFixed(1)),
      avgHum: Number((totalHum / satellites.length).toFixed(1)),
      avgPress: Number((totalPress / satellites.length).toFixed(1)),
      avgAlt: Number((totalAlt / satellites.length).toFixed(0)),
    };
  }, [satellites]);

  // Filtered Satellites for Explorer
  const filteredSatellites = useMemo(() => {
    return satellites
      .filter((s) => {
        const q = searchQuery.toLowerCase().trim();
        const matchSearch =
          !q ||
          s.satelliteId.toLowerCase().includes(q) ||
          s.collegeName.toLowerCase().includes(q) ||
          (s.studentName && s.studentName.toLowerCase().includes(q)) ||
          (s.principalName && s.principalName.toLowerCase().includes(q)) ||
          (s.teacherName && s.teacherName.toLowerCase().includes(q)) ||
          s.location.toLowerCase().includes(q);

        const matchType =
          filterType === "all" ||
          (filterType === "registered" && s.isCustom) ||
          (filterType === "standard" && !s.isCustom);

        const matchCondition =
          filterCondition === "all" ||
          (s.weatherCondition && s.weatherCondition.toLowerCase().includes(filterCondition.toLowerCase()));

        return matchSearch && matchType && matchCondition;
      })
      .sort((a, b) => {
        if (sortBy === "id") return a.satelliteId.localeCompare(b.satelliteId);
        if (sortBy === "temp") return (b.temperature || 0) - (a.temperature || 0);
        if (sortBy === "altitude") return (b.orbitAltitude || 0) - (a.orbitAltitude || 0);
        if (sortBy === "name") return a.collegeName.localeCompare(b.collegeName);
        return 0;
      });
  }, [satellites, searchQuery, filterType, filterCondition, sortBy]);

  // Initialize & Update Leaflet Radar Map
  useEffect(() => {
    if (activeTab !== "map" || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([20.5937, 78.9629], 5);

      L.tileLayer(
        theme === "dark"
          ? "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          : "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        { maxZoom: 18 }
      ).addTo(map);

      L.control.zoom({ position: "topright" }).addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.invalidateSize();
    }

    // Add / Update Markers
    const currentMap = mapInstanceRef.current;
    if (currentMap) {
      (Object.values(markersRef.current) as L.Marker[]).forEach((m) => m.remove());
      markersRef.current = {};

      satellites.forEach((sat) => {
        if (typeof sat.lat !== "number" || typeof sat.lng !== "number") return;

        const customIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `
            <div style="
              width: 32px; 
              height: 32px; 
              background: #2563eb; 
              border: 2px solid #ffffff; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              box-shadow: 0 0 14px rgba(37,99,235,0.7);
              cursor: pointer;
            ">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M13 7 9 3 5 7"/><path d="M9 3v18"/><path d="m19 13 4 4-4 4"/><path d="M23 17H3"/>
              </svg>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([sat.lat, sat.lng], { icon: customIcon }).addTo(currentMap);
        marker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px; padding: 4px;">
            <div style="font-weight: 800; font-size: 14px; color: #1e3a8a; margin-bottom: 2px;">${sat.satelliteId}</div>
            <div style="font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 4px;">${sat.collegeName}</div>
            <div style="font-size: 11px; color: #64748b;">📍 ${sat.location}</div>
            ${sat.studentName ? `<div style="font-size: 11px; color: #059669; margin-top: 2px;">🎓 Operator: ${sat.studentName}</div>` : ""}
            <div style="display: flex; gap: 8px; margin-top: 6px; font-size: 11px; font-weight: 700;">
              <span style="color: #dc2626;">🌡️ ${sat.temperature}°C</span>
              <span style="color: #2563eb;">💧 ${sat.humidity || 55}%</span>
              <span style="color: #d97706;">⚡ ${sat.pressure || 948} hPa</span>
            </div>
          </div>
        `);
        markersRef.current[sat.satelliteId] = marker;
      });
    }
  }, [activeTab, satellites, theme]);

  // Handle in-modal Login Form submission
  const handlePortalLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    const cleanPass = loginPassword.trim();
    if (!cleanPass) {
      setAuthError("Please enter your account password.");
      return;
    }

    // 1. Instant Verification for Master Admin password
    if (cleanPass === "14/11" || cleanPass === "ISRO@1200") {
      setAuthSuccess("Master Authorization Verified! Loading Control Center...");
      setTimeout(() => {
        setIsPortalModalOpen(false);
        setIsAdminAuthenticated(true);
        setIsAdminPanelOpen(true);
      }, 1000);
      return;
    }

    setAuthLoading(true);
    try {
      const endpoint =
        activePortalView === "student-login"
          ? "/api/auth/student-login"
          : activePortalView === "admin-login"
          ? "/api/auth/admin/login"
          : "/api/auth/login";

      const payload =
        activePortalView === "student-login"
          ? { username: loginIdentifier.trim().toLowerCase(), password: cleanPass }
          : { email: loginIdentifier.trim().toLowerCase(), password: cleanPass };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success !== false) {
        setAuthSuccess("Authentication successful! Welcome to IndoScience.");
        setTimeout(() => {
          setIsPortalModalOpen(false);
          // Navigate to respective dashboard if using react-router-dom
          if (activePortalView === "school-login") {
            try { navigate("/school"); } catch (e) {}
          } else if (activePortalView === "student-login") {
            try { navigate("/student"); } catch (e) {}
          } else if (activePortalView === "admin-login") {
            try { navigate("/admin"); } catch (e) {}
          }
        }, 1200);
      } else {
        setAuthError(data?.message || "Invalid credentials. For demo access use password: 14/11");
      }
    } catch (err: any) {
      setAuthError(err.message || "Connection error. For demo access use password: 14/11");
    } finally {
      setAuthLoading(false);
    }
  };

  // Add new satellite node in Admin Panel
  const handleAddSatellite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSatId || !newCollege) {
      setAdminError("Please fill in Satellite ID and College Name.");
      return;
    }

    const newNode: SatelliteNode = {
      id: Date.now(),
      satelliteId: newSatId.trim(),
      collegeName: newCollege.trim(),
      studentName: newStudent.trim() || undefined,
      principalName: newPrincipal.trim() || undefined,
      location: newLocation.trim() || "Pune, Maharashtra",
      temperature: 26.5 + (Math.random() - 0.5) * 3,
      humidity: 55 + Math.floor((Math.random() - 0.5) * 10),
      pressure: 948 + Math.floor((Math.random() - 0.5) * 5),
      windSpeed: 10 + Math.floor(Math.random() * 5),
      batteryLevel: 98,
      rssi: -65,
      orbitAltitude: 550,
      lat: parseFloat(newLat) || 18.5204,
      lng: parseFloat(newLng) || 73.8567,
      isLiveStream: true,
      lastPing: "Live Feed Active",
      isCustom: true
    };

    setSatellites((prev) => [newNode, ...prev]);
    setNewSatId("");
    setNewCollege("");
    setNewStudent("");
    setNewPrincipal("");
    setAdminError("");
  };

  // CSV Export
  const exportSatellitesCSV = () => {
    const headers = "Satellite ID,Institution,Operator,Principal,Location,Latitude,Longitude,Temperature,Humidity,Pressure,Altitude\n";
    const rows = satellites
      .map((s) => `"${s.satelliteId}","${s.collegeName}","${s.studentName || ""}","${s.principalName || ""}","${s.location}",${s.lat},${s.lng},${s.temperature},${s.humidity || 55},${s.pressure || 948},${s.orbitAltitude || 500}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `antriksha_ground_satellites_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`antriksha-app ${theme}`}>
      {/* ========================================================
          EMBEDDED STYLES FOR ZERO-DEPENDENCY COMPATIBILITY
          ======================================================== */}
      <style>{`
        * { box-sizing: border-box; }
        .antriksha-app {
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-height: 100vh;
          background: #030712;
          color: #f8fafc;
          position: relative;
          overflow-x: hidden;
        }
        .antriksha-app.light {
          background: #f8fafc;
          color: #0f172a;
        }

        /* HEADER */
        .antriksha-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(3, 7, 18, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 153, 51, 0.25);
          padding: 12px 24px;
        }
        .light .antriksha-header {
          background: rgba(255, 255, 255, 0.9);
          border-bottom: 1px solid #e2e8f0;
        }
        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .brand-section {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .partner-emblems {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .partner-emblem-badge {
          background: #ffffff;
          padding: 3px 8px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          display: flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          color: #0f172a;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .partner-emblem-badge:hover {
          transform: translateY(-1px);
        }
        .title-block h1 {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 0.05em;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .title-block .subtitle {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 600;
          letter-spacing: 0.04em;
        }
        .light .title-block .subtitle {
          color: #64748b;
        }

        /* NAVIGATION TABS */
        .nav-tabs {
          display: flex;
          background: rgba(15, 23, 42, 0.6);
          padding: 4px;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          gap: 4px;
        }
        .light .nav-tabs {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
        .nav-tab-btn {
          padding: 8px 16px;
          border-radius: 9999px;
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .light .nav-tab-btn {
          color: #64748b;
        }
        .nav-tab-btn.active {
          background: #2563eb;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }
        .light .nav-tab-btn.active {
          background: #2563eb;
          color: #ffffff;
        }

        /* HEADER ACTIONS */
        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .icon-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          cursor: pointer;
          color: #cbd5e1;
          transition: all 0.2s;
        }
        .light .icon-btn {
          background: #ffffff;
          border-color: #e2e8f0;
          color: #475569;
        }
        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }
        .light .icon-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        /* MAIN CONTENT LAYOUT */
        .main-container {
          max-width: 1400px;
          margin: 24px auto 80px auto;
          padding: 0 20px;
        }

        /* TOP DUAL CARDS (DASHBOARD) */
        .top-dual-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        @media (max-width: 900px) {
          .top-dual-grid { grid-template-columns: 1fr; }
        }

        .dashboard-hero-card {
          background: linear-gradient(145deg, #0b1329 0%, #060b18 100%);
          border: 1px solid rgba(59, 130, 246, 0.25);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
          position: relative;
          overflow: hidden;
        }
        .light .dashboard-hero-card {
          background: #ffffff;
          border-color: #e2e8f0;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);
        }

        .network-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(37, 99, 235, 0.2);
          color: #60a5fa;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .light .network-badge {
          background: #eff6ff;
          color: #2563eb;
        }

        .network-counter-val {
          font-size: 44px;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }
        .light .network-counter-val {
          color: #0f172a;
        }
        .network-subtext {
          font-size: 13px;
          color: #94a3b8;
          margin-bottom: 16px;
        }
        .light .network-subtext {
          color: #64748b;
        }

        /* 4 METRICS CARDS */
        .metrics-quad-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        @media (max-width: 1024px) {
          .metrics-quad-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .metrics-quad-grid { grid-template-columns: 1fr; }
        }

        .metric-card {
          background: #0d1527;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 20px;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .light .metric-card {
          background: #ffffff;
          border-color: #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .metric-card:hover {
          transform: translateY(-2px);
          border-color: #3b82f6;
        }
        .metric-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .metric-title {
          font-size: 12px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
        }
        .light .metric-title { color: #64748b; }
        .metric-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: grid;
          place-items: center;
        }
        .metric-val {
          font-size: 28px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 4px;
        }
        .light .metric-val { color: #0f172a; }
        .metric-desc {
          font-size: 11px;
          color: #64748b;
        }
        .light .metric-desc { color: #94a3b8; }

        /* FEATURED STATIONS GRID */
        .section-heading {
          font-size: 18px;
          font-weight: 800;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .stations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
          gap: 16px;
        }
        .station-card {
          background: #0d1527;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 18px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .light .station-card {
          background: #ffffff;
          border-color: #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .station-card:hover {
          transform: translateY(-2px);
          border-color: #2563eb;
          box-shadow: 0 10px 24px -5px rgba(37, 99, 235, 0.2);
        }

        /* EXPLORER VIEW CONTROLS */
        .explorer-controls {
          background: #0d1527;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }
        .light .explorer-controls {
          background: #ffffff;
          border-color: #e2e8f0;
        }
        .search-box {
          flex: 1;
          min-width: 240px;
          position: relative;
        }
        .search-input {
          width: 100%;
          padding: 10px 14px 10px 38px;
          background: #060b18;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          color: #ffffff;
          font-size: 13px;
        }
        .light .search-input {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }
        .filter-select {
          padding: 10px 14px;
          background: #060b18;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          color: #ffffff;
          font-size: 13px;
        }
        .light .filter-select {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        /* MAP VIEW */
        .map-wrapper {
          height: 600px;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
        }

        /* FLOATING PORTAL LOGIN BUTTON (Bottom Right - Matching pd.indoscience.in) */
        .iset-portal-trigger-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 22px;
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%);
          color: #ffffff;
          font-family: inherit;
          font-size: 15px;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 9999px;
          cursor: pointer;
          box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.3);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          text-decoration: none;
        }
        .iset-portal-trigger-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 14px 30px -4px rgba(59, 130, 246, 0.6);
        }

        /* MODAL BACKDROP & CARD */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(3, 7, 18, 0.75);
          backdrop-filter: blur(8px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .modal-card {
          background: #ffffff;
          color: #0f172a;
          border-radius: 24px;
          width: 100%;
          max-width: 540px;
          padding: 28px;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35);
        }
        .dark .modal-card.dark-theme {
          background: #0d1527;
          color: #f8fafc;
          border: 1px solid #1e293b;
        }
        .modal-close-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          background: #f1f5f9;
          border: none;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          cursor: pointer;
          color: #64748b;
        }
        .dark .modal-close-btn {
          background: #1e293b;
          color: #94a3b8;
        }

        /* PORTAL LOGIN OPTIONS */
        .portal-option-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 14px 18px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #fafaf9;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 10px;
          color: inherit;
        }
        .dark .portal-option-btn {
          background: #111a33;
          border-color: #1e293b;
        }
        .portal-option-btn:hover {
          background: #ffffff;
          border-color: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 8px 18px -4px rgba(37, 99, 235, 0.15);
        }
        .dark .portal-option-btn:hover {
          background: #172344;
          border-color: #3b82f6;
        }
      `}</style>

      {/* ========================================================
          TOP COMMAND HEADER
          ======================================================== */}
      <header className="antriksha-header">
        <div className="header-content">
          <div className="brand-section">
            <div className="partner-emblems">
              <a
                href="https://indoscience.org"
                target="_blank"
                rel="noopener noreferrer"
                className="partner-emblem-badge"
                title="Indo Science Education Trust"
              >
                <span>🌐 IndoScience</span>
              </a>
              <a
                href="https://indo-science.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="partner-emblem-badge"
                title="SPARK India Program"
              >
                <span>⚡ SPARK India</span>
              </a>
              <a
                href="https://www.isro.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="partner-emblem-badge"
                title="Indian Space Research Organisation"
              >
                <span>🛰️ ISRO</span>
              </a>
            </div>

            <div className="title-block">
              <h1>
                <Rocket className="w-5 h-5 text-amber-500" />
                <span>PROJECT ANTRIKSHA अंतरिक्ष</span>
              </h1>
              <span className="subtitle">
                ISRO IndoSpark Student Micro-Satellite Telemetry Network
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="nav-tabs">
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === "explorer" ? "active" : ""}`}
              onClick={() => setActiveTab("explorer")}
            >
              <Search size={16} />
              <span>Satellites</span>
            </button>
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === "map" ? "active" : ""}`}
              onClick={() => setActiveTab("map")}
            >
              <MapIcon size={16} />
              <span>Orbital Map</span>
            </button>
          </nav>

          {/* Header Controls */}
          <div className="header-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setIsAdminPanelOpen(true)}
              title="Admin Station Control Center (password: 14/11)"
            >
              <Lock size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          MAIN VIEWS CONTAINER
          ======================================================== */}
      <main className="main-container">
        {/* =======================
            TAB 1: DASHBOARD
            ======================= */}
        {activeTab === "dashboard" && (
          <div>
            {/* Top Row: Dual Hero Cards */}
            <div className="top-dual-grid">
              {/* Card 1: Total Ground Satellites */}
              <div className="dashboard-hero-card">
                <span className="network-badge">
                  <Activity size={12} />
                  Active Student Satellite Network
                </span>
                <div className="network-counter-val">
                  {satellites.length} / 1200
                </div>
                <div className="network-subtext">
                  ISRO IndoSpark Certified Ground Stations Across India
                </div>
                <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "9999px", overflow: "hidden", marginBottom: "14px" }}>
                  <div style={{ width: `${Math.min(100, (satellites.length / 1200) * 100 * 20)}%`, height: "100%", background: "#2563eb" }} />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={exportSatellitesCSV}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "inherit",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    <Download size={14} /> Export CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("explorer")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#2563eb",
                      border: "none",
                      color: "#ffffff",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    Explore Directory →
                  </button>
                </div>
              </div>

              {/* Card 2: Live Node Auto-Shift Carousel */}
              {activeFocusNode && (
                <div className="dashboard-hero-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span className="network-badge" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34d399" }}>
                      <Radio size={12} />
                      Live Node: {activeFocusNode.satelliteId}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAutoShift(!isAutoShift)}
                      style={{
                        background: isAutoShift ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "9999px",
                        padding: "4px 10px",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "inherit",
                        cursor: "pointer"
                      }}
                    >
                      {isAutoShift ? "🔄 Auto Shift" : "⏸️ Paused"}
                    </button>
                  </div>

                  <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 4px 0" }}>
                    {activeFocusNode.collegeName}
                  </h3>
                  <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                    <MapPin size={13} /> {activeFocusNode.location}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "rgba(0,0,0,0.25)", padding: "12px", borderRadius: "12px", marginBottom: "14px" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", display: "block" }}>Student Operator</span>
                      <strong style={{ fontSize: "13px" }}>{activeFocusNode.studentName || "Student Lead"}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", display: "block" }}>Faculty Mentor</span>
                      <strong style={{ fontSize: "13px" }}>{activeFocusNode.principalName || "Director"}</strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "#f87171" }}>
                        🌡️ {activeFocusNode.temperature}°C
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "#60a5fa" }}>
                        💧 {activeFocusNode.humidity || 55}%
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "#fbbf24" }}>
                        ⚡ {activeFocusNode.pressure || 948} hPa
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedStation(activeFocusNode)}
                      style={{
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      View Live Telemetry →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Second Row: 4 Metric Cards */}
            <div className="metrics-quad-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-title">Average Temperature</span>
                  <div className="metric-icon-box" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
                    <Thermometer size={18} />
                  </div>
                </div>
                <div className="metric-val">{metrics.avgTemp}°C</div>
                <div className="metric-desc">Ground Sensors Network Average</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-title">Average Humidity</span>
                  <div className="metric-icon-box" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
                    <Droplets size={18} />
                  </div>
                </div>
                <div className="metric-val">{metrics.avgHum}%</div>
                <div className="metric-desc">Air Moisture & Clouds Reading</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-title">Average Pressure</span>
                  <div className="metric-icon-box" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
                    <Gauge size={18} />
                  </div>
                </div>
                <div className="metric-val">{metrics.avgPress} hPa</div>
                <div className="metric-desc">Barometric Ground Pressure</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-title">Average Altitude</span>
                  <div className="metric-icon-box" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                    <Rocket size={18} />
                  </div>
                </div>
                <div className="metric-val">{metrics.avgAlt} m</div>
                <div className="metric-desc">Elevation Above Sea Level</div>
              </div>
            </div>

            {/* Third Row: Featured Stations */}
            <h2 className="section-heading">
              <Sparkles size={18} className="text-amber-500" />
              Featured Academic Stations Across India
            </h2>
            <div className="stations-grid">
              {satellites.slice(0, 6).map((sat) => (
                <div
                  key={sat.satelliteId}
                  className="station-card"
                  onClick={() => setSelectedStation(sat)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#3b82f6" }}>
                      {sat.satelliteId}
                    </span>
                    <span style={{ fontSize: "11px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "2px 8px", borderRadius: "9999px", fontWeight: 700 }}>
                      Live Active
                    </span>
                  </div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 4px 0" }}>
                    {sat.collegeName}
                  </h4>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
                    📍 {sat.location}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px" }}>
                    <span>🌡️ {sat.temperature}°C</span>
                    <span>💧 {sat.humidity || 55}%</span>
                    <span>⚡ {sat.pressure || 948} hPa</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =======================
            TAB 2: EXPLORER DIRECTORY
            ======================= */}
        {activeTab === "explorer" && (
          <div>
            <div className="explorer-controls">
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by school, student, ID, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <select
                value={filterType}
                onChange={(e: any) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Station Types</option>
                <option value="registered">Registered Stations Only</option>
                <option value="standard">Standard Seed Network</option>
              </select>

              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="id">Sort by Satellite ID</option>
                <option value="temp">Sort by Temperature</option>
                <option value="altitude">Sort by Altitude</option>
                <option value="name">Sort by School Name</option>
              </select>
            </div>

            <div className="stations-grid">
              {filteredSatellites.map((sat) => (
                <div
                  key={sat.satelliteId}
                  className="station-card"
                  onClick={() => setSelectedStation(sat)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#3b82f6" }}>
                      {sat.satelliteId}
                    </span>
                    <span style={{ fontSize: "11px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "2px 8px", borderRadius: "9999px", fontWeight: 700 }}>
                      Optimal Link
                    </span>
                  </div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 4px 0" }}>
                    {sat.collegeName}
                  </h4>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
                    📍 {sat.location}
                  </div>
                  {sat.studentName && (
                    <div style={{ fontSize: "12px", color: "#059669", marginBottom: "8px", fontWeight: 600 }}>
                      🎓 Operator: {sat.studentName}
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px" }}>
                    <span>🌡️ {sat.temperature}°C</span>
                    <span>💧 {sat.humidity || 55}%</span>
                    <span>⚡ {sat.pressure || 948} hPa</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =======================
            TAB 3: ORBITAL MAP
            ======================= */}
        {activeTab === "map" && (
          <div>
            <div style={{ marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="section-heading" style={{ margin: 0 }}>
                <MapPin size={18} className="text-blue-500" />
                Live CanSat Radar Ground Stations (India)
              </h2>
              <span style={{ fontSize: "12px", background: "rgba(37,99,235,0.15)", color: "#60a5fa", padding: "4px 12px", borderRadius: "9999px", fontWeight: 700 }}>
                {satellites.length} Active Pins Mapped
              </span>
            </div>
            <div ref={mapContainerRef} className="map-wrapper" />
          </div>
        )}
      </main>

      {/* ========================================================
          QUICK ACCESS FLOATING PORTAL LOGIN BUTTON (Bottom-Right)
          ======================================================== */}
      <button
        id="isetPortalBtn"
        className="iset-portal-trigger-btn"
        type="button"
        onClick={() => {
          setIsPortalModalOpen(true);
          setActivePortalView("menu");
          setAuthError("");
          setAuthSuccess("");
        }}
        aria-label="Open Portal Login Menu"
        title="Login to School, Student, or Admin Portal"
      >
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" width="18" height="18">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        <span>Portal Login</span>
      </button>

      {/* ========================================================
          ROLE-BASED PORTAL LOGIN MODAL
          ======================================================== */}
      {isPortalModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPortalModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setIsPortalModalOpen(false)}
            >
              ✕
            </button>

            {/* Menu View */}
            {activePortalView === "menu" && (
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#2563eb", background: "#eff6ff", padding: "3px 8px", borderRadius: "9999px", textTransform: "uppercase" }}>
                  IndoScience Space Portals
                </span>
                <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "8px 0 4px 0" }}>
                  Select Login Portal
                </h2>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px 0" }}>
                  Choose your account type below to access live station management
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* School Login */}
                  <button
                    type="button"
                    className="portal-option-btn"
                    onClick={() => setActivePortalView("school-login")}
                  >
                    <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#eff6ff", color: "#2563eb", display: "grid", placeItems: "center", fontSize: "20px" }}>
                      🏫
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "15px", fontWeight: 700 }}>
                        School Login <span style={{ fontSize: "10px", background: "#dbeafe", color: "#1e40af", padding: "2px 6px", borderRadius: "9999px" }}>Faculty</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        Manage student accounts & school ground telemetry
                      </div>
                    </div>
                    <div style={{ color: "#94a3b8" }}>→</div>
                  </button>

                  {/* Student Login */}
                  <button
                    type="button"
                    className="portal-option-btn"
                    onClick={() => setActivePortalView("student-login")}
                  >
                    <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#ecfdf5", color: "#059669", display: "grid", placeItems: "center", fontSize: "20px" }}>
                      🎓
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "15px", fontWeight: 700 }}>
                        Student Login <span style={{ fontSize: "10px", background: "#d1fae5", color: "#065f46", padding: "2px 6px", borderRadius: "9999px" }}>Learners</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        View live trajectory, sensors & mission graphs
                      </div>
                    </div>
                    <div style={{ color: "#94a3b8" }}>→</div>
                  </button>

                  {/* Admin Login */}
                  <button
                    type="button"
                    className="portal-option-btn"
                    onClick={() => {
                      setIsPortalModalOpen(false);
                      setIsAdminPanelOpen(true);
                    }}
                  >
                    <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#fdf2f8", color: "#db2777", display: "grid", placeItems: "center", fontSize: "20px" }}>
                      🛡️
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "15px", fontWeight: 700 }}>
                        Administrator Login <span style={{ fontSize: "10px", background: "#fce7f3", color: "#9d174d", padding: "2px 6px", borderRadius: "9999px" }}>Control Center</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        Network oversight & master telemetry settings (pass: 14/11)
                      </div>
                    </div>
                    <div style={{ color: "#94a3b8" }}>→</div>
                  </button>
                </div>

                <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#64748b" }}>
                  <span>Want to register a school?</span>
                  <button
                    type="button"
                    onClick={() => setActivePortalView("register")}
                    style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer" }}
                  >
                    Register School Account →
                  </button>
                </div>
              </div>
            )}

            {/* School / Student Login Form */}
            {(activePortalView === "school-login" || activePortalView === "student-login") && (
              <div>
                <button
                  type="button"
                  onClick={() => setActivePortalView("menu")}
                  style={{ background: "none", border: "none", color: "#64748b", fontSize: "12px", fontWeight: 700, cursor: "pointer", marginBottom: "12px" }}
                >
                  ← Back to Portal Choices
                </button>

                <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 4px 0" }}>
                  {activePortalView === "school-login" ? "🏫 School Account Login" : "🎓 Student Operator Login"}
                </h2>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 16px 0" }}>
                  Enter your credentials to access your station dashboard
                </p>

                {authError && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "10px", borderRadius: "10px", fontSize: "12px", marginBottom: "12px" }}>
                    ⚠️ {authError}
                  </div>
                )}
                {authSuccess && (
                  <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", padding: "10px", borderRadius: "10px", fontSize: "12px", marginBottom: "12px" }}>
                    ✓ {authSuccess}
                  </div>
                )}

                <form onSubmit={handlePortalLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                      {activePortalView === "school-login" ? "School Email Address" : "Student Username"}
                    </label>
                    <input
                      type={activePortalView === "school-login" ? "email" : "text"}
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={activePortalView === "school-login" ? "admin@school.edu.in" : "e.g. arwa.ggs"}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password (demo: 14/11)"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                      required
                    />
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                      Tip: Master admin / demo password is <strong style={{ color: "#d97706" }}>14/11</strong>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    style={{
                      background: "#2563eb",
                      color: "#fff",
                      border: "none",
                      padding: "12px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 800,
                      cursor: "pointer",
                      marginTop: "6px"
                    }}
                  >
                    {authLoading ? "Verifying..." : "Sign In to Portal"}
                  </button>
                </form>
              </div>
            )}

            {/* School Registration Form */}
            {activePortalView === "register" && (
              <div>
                <button
                  type="button"
                  onClick={() => setActivePortalView("menu")}
                  style={{ background: "none", border: "none", color: "#64748b", fontSize: "12px", fontWeight: 700, cursor: "pointer", marginBottom: "12px" }}
                >
                  ← Back to Portal Choices
                </button>

                <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 4px 0" }}>
                  🏫 Register School Account
                </h2>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 16px 0" }}>
                  Join the ISRO IndoSpark student micro-satellite ground network
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <input
                    type="text"
                    placeholder="School / Institution Name"
                    value={regSchoolName}
                    onChange={(e) => setRegSchoolName(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                  <input
                    type="text"
                    placeholder="Principal / Coordinator Name"
                    value={regPrincipal}
                    onChange={(e) => setRegPrincipal(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                  <input
                    type="text"
                    placeholder="City / Location (e.g. Pune, Maharashtra)"
                    value={regLocation}
                    onChange={(e) => setRegLocation(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                  <input
                    type="email"
                    placeholder="Official Contact Email"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                  <input
                    type="password"
                    placeholder="Create Account Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAuthSuccess("Registration submitted! Please login with your school email or use demo password 14/11.");
                      setTimeout(() => setActivePortalView("school-login"), 1500);
                    }}
                    style={{ background: "#2563eb", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: 800, cursor: "pointer", marginTop: "6px" }}
                  >
                    Submit School Registration
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          STATION DETAIL MODAL
          ======================================================== */}
      {selectedStation && (
        <div className="modal-overlay" onClick={() => setSelectedStation(null)}>
          <div className="modal-card dark-theme" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedStation(null)}
            >
              ✕
            </button>

            <span style={{ fontSize: "11px", fontWeight: 800, color: "#3b82f6", background: "rgba(59,130,246,0.15)", padding: "3px 8px", borderRadius: "9999px" }}>
              CanSat Ground Station #{selectedStation.satelliteId}
            </span>
            <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "8px 0 4px 0" }}>
              {selectedStation.collegeName}
            </h2>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "16px" }}>
              📍 {selectedStation.location} ({selectedStation.lat.toFixed(4)}, {selectedStation.lng.toFixed(4)})
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "12px" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Temperature</span>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#ef4444" }}>{selectedStation.temperature}°C</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "12px" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Humidity</span>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#3b82f6" }}>{selectedStation.humidity || 55}%</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "12px" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Pressure</span>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#f59e0b" }}>{selectedStation.pressure || 948} hPa</div>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: "12px", fontSize: "12px", color: "#94a3b8", marginBottom: "16px" }}>
              <div>🎓 <strong>Lead Student:</strong> {selectedStation.studentName || "Operator Not Assigned"}</div>
              <div style={{ marginTop: "4px" }}>👨‍🏫 <strong>Principal / Mentor:</strong> {selectedStation.principalName || "School Coordinator"}</div>
              <div style={{ marginTop: "4px" }}>📡 <strong>Telemetry Status:</strong> Live Feed Active • RSSI: {selectedStation.rssi || -65} dBm • Battery: {selectedStation.batteryLevel || 95}%</div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStation(null)}
              style={{ width: "100%", padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }}
            >
              Close Telemetry Inspector
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          ADMIN PANEL MODAL (Password Protected: 14/11)
          ======================================================== */}
      {isAdminPanelOpen && (
        <div className="modal-overlay" onClick={() => setIsAdminPanelOpen(false)}>
          <div className="modal-card dark-theme" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setIsAdminPanelOpen(false)}
            >
              ✕
            </button>

            {!isAdminAuthenticated ? (
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#ef4444", background: "rgba(239,68,68,0.15)", padding: "3px 8px", borderRadius: "9999px" }}>
                  ISRO IndoScience Security Bridge
                </span>
                <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "8px 0 4px 0" }}>
                  Master Station Control Login
                </h2>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 16px 0" }}>
                  Enter master publisher credentials to manage satellite telemetry nodes
                </p>

                {adminError && (
                  <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", marginBottom: "12px" }}>
                    ⚠️ {adminError}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <input
                    type="password"
                    placeholder="Enter Master Password (Hint: 14/11)"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", background: "#060b18", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: "13px" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (adminPasswordInput.trim() === "14/11" || adminPasswordInput.trim() === "ISRO@1200") {
                        setIsAdminAuthenticated(true);
                        setAdminError("");
                      } else {
                        setAdminError("Invalid master password. Please use 14/11.");
                      }
                    }}
                    style={{ background: "#2563eb", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: 800, cursor: "pointer" }}
                  >
                    Unlock Station Manager
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#10b981", background: "rgba(16,185,129,0.15)", padding: "3px 8px", borderRadius: "9999px" }}>
                  Master Admin Session Active
                </span>
                <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "8px 0 4px 0" }}>
                  Add / Provision Ground Station
                </h2>

                <form onSubmit={handleAddSatellite} style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <input
                      type="text"
                      placeholder="Satellite ID (e.g. CanSat-45)"
                      value={newSatId}
                      onChange={(e) => setNewSatId(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: "8px", background: "#060b18", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: "12px" }}
                      required
                    />
                    <input
                      type="text"
                      placeholder="School / College Name"
                      value={newCollege}
                      onChange={(e) => setNewCollege(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: "8px", background: "#060b18", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: "12px" }}
                      required
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <input
                      type="text"
                      placeholder="Student Operator Name"
                      value={newStudent}
                      onChange={(e) => setNewStudent(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: "8px", background: "#060b18", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: "12px" }}
                    />
                    <input
                      type="text"
                      placeholder="Principal / Coordinator"
                      value={newPrincipal}
                      onChange={(e) => setNewPrincipal(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: "8px", background: "#060b18", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: "12px" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                    <input
                      type="text"
                      placeholder="Location (e.g. Pune)"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: "8px", background: "#060b18", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: "12px" }}
                    />
                    <input
                      type="text"
                      placeholder="Latitude (18.5204)"
                      value={newLat}
                      onChange={(e) => setNewLat(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: "8px", background: "#060b18", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: "12px" }}
                    />
                    <input
                      type="text"
                      placeholder="Longitude (73.8567)"
                      value={newLng}
                      onChange={(e) => setNewLng(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: "8px", background: "#060b18", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: "12px" }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{ background: "#10b981", color: "#fff", border: "none", padding: "10px", borderRadius: "10px", fontWeight: 800, cursor: "pointer", marginTop: "6px" }}
                  >
                    + Register Ground Station
                  </button>
                </form>

                <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between" }}>
                  <button
                    type="button"
                    onClick={exportSatellitesCSV}
                    style={{ background: "none", border: "none", color: "#3b82f6", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                  >
                    ⬇️ Download Full Network CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdminAuthenticated(false)}
                    style={{ background: "none", border: "none", color: "#ef4444", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Lock Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TelemetryTestDashboard;
