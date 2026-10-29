import React, { useState, useEffect } from 'react';
import { SatelliteNode, AuditLog, AppsScriptSource } from '../types';
import { ShieldCheck, X, PlusCircle, PenLine, FileText, Download, CheckCircle, Trash2, Lock, Key, AlertTriangle, Wand2, Sparkles, RefreshCw, Globe, Zap, Search, Radio, Play, Pause, HardDrive, Check, ExternalLink, Activity, MapPin, Compass, Map, Navigation, Rocket, LogOut, UserCheck } from 'lucide-react';
import { IsroLogo } from './IsroLogo';
import { isValidChildUrl, formatExternalUrl, parseLocationCoordinates, buildGoogleMapsUrl } from '../utils/urlHelper';
import { StudentPortal } from './StudentPortal';

interface AdminModalProps {
  onClose: () => void;
  satellites: SatelliteNode[];
  onAddSatellite: (sat: SatelliteNode) => void;
  onUpdateSatellite: (sat: SatelliteNode) => void;
  onDeleteSatellite: (satelliteId: string) => void;
  isLiveStream: boolean;
  toggleLiveStream: () => void;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (status: boolean) => void;
  exportToCSV: (data: SatelliteNode[]) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  onClose,
  satellites,
  onAddSatellite,
  onUpdateSatellite,
  onDeleteSatellite,
  isLiveStream,
  toggleLiveStream,
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  exportToCSV
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [adminUsername, setAdminUsername] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [portalSide, setPortalSide] = useState<'publisher' | 'student'>(isAdminLoggedIn ? 'publisher' : 'publisher');
  const [activeTab, setActiveTab] = useState<'add' | 'apps-script' | 'manage' | 'logs'>('apps-script');
  const [successMsg, setSuccessMsg] = useState('');

  // Google Apps Script Ingestion state
  const [appsScriptSources, setAppsScriptSources] = useState<AppsScriptSource[]>([]);
  const [appsScriptUrlInput, setAppsScriptUrlInput] = useState(
    'https://script.google.com/macros/s/AKfycbwgx-6gvYORbZyNhPUIP0OfNFVJQlLHpprho2UKudWzYT8mt5_1HlBctcF9lHtbFHGh/exec'
  );
  const [appsScriptChildUrlInput, setAppsScriptChildUrlInput] = useState('https://indo-science.vercel.app/');
  const [appsScriptNameInput, setAppsScriptNameInput] = useState('Soumodip_GGS');
  const [appsScriptSatIdInput, setAppsScriptSatIdInput] = useState('CanSat-01');
  const [appsScriptLocationInput, setAppsScriptLocationInput] = useState('Kasba Peth');
  const [appsScriptPrincipalInput, setAppsScriptPrincipalInput] = useState('Archana Dharu');
  const [isTestingAppsScript, setIsTestingAppsScript] = useState(false);
  const [appsScriptTestResult, setAppsScriptTestResult] = useState<any>(null);
  const [isRegisteringAppsScript, setIsRegisteringAppsScript] = useState(false);

  // Landlocked Location & Google Maps Link state for Apps Script Module
  const [appsScriptLatInput, setAppsScriptLatInput] = useState('18.481817');
  const [appsScriptLngInput, setAppsScriptLngInput] = useState('73.954033');
  const [appsScriptMapLinkInput, setAppsScriptMapLinkInput] = useState('https://www.google.com/maps?q=18.481817,73.954033');
  const [appsScriptCoordParserInput, setAppsScriptCoordParserInput] = useState('');
  const [appsScriptCoordMsg, setAppsScriptCoordMsg] = useState<{ text: string; success: boolean } | null>(null);

  // Safe URL Normalizer helper that cleans quotes, spaces, tabs, and ensures valid protocol
  const sanitizeUrl = (raw: string): string => {
    if (!raw) return '';
    let cleaned = String(raw).trim();
    // Strip accidental quotes, backticks, brackets, and spaces
    cleaned = cleaned.replace(/^["'`<\s]+|["'`>\s]+$/g, '').trim();
    // Strip newlines / carriage returns
    cleaned = cleaned.replace(/[\r\n\t]/g, '');
    if (cleaned && !cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = `https://${cleaned}`;
    }
    return cleaned;
  };

  // Auto-fetch & extraction state for normal websites
  const [urlInputForAuto, setUrlInputForAuto] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [autoFilledMsg, setAutoFilledMsg] = useState('');

  // Form for Registering New Satellite / Child Website Node
  const [formData, setFormData] = useState({
    satelliteId: `Satellite_${satellites.length + 1}`,
    collegeName: '',
    childUrl: '',
    location: 'Shivajinagar, Pune',
    principalName: '',
    weatherCondition: 'Partly Cloudy',
    aqi: 35,
    temperature: 26,
    windSpeed: 14,
    lat: 18.5204,
    lng: 73.8567,
    googleMapsUrl: 'https://www.google.com/maps?q=18.5204,73.8567',
    mapLinkOrCoordInput: ''
  });

  const [locationParseMsg, setLocationParseMsg] = useState<{ text: string; success: boolean } | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SatelliteNode | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 1, time: new Date().toLocaleTimeString(), text: 'ISRO Admin session initialized successfully.' },
    { id: 2, time: new Date().toLocaleTimeString(), text: 'Google Apps Script Hardware Bridge connected to Pen Drive CCCOMA_X64FRE_EN-GB_DV9.' }
  ]);

  // Load Apps Script Sources
  const fetchAppsScriptSources = async () => {
    try {
      const res = await fetch('/api/hardware/apps-script/sources');
      if (res.ok) {
        const data = await res.json();
        if (data.sources) {
          setAppsScriptSources(data.sources);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch apps script sources:', e);
    }
  };

  useEffect(() => {
    fetchAppsScriptSources();
    const interval = setInterval(fetchAppsScriptSources, 3000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (text: string) => {
    setAuditLogs(prev => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), text },
      ...prev
    ]);
  };

  // Test Google Apps Script URL
  const handleTestAppsScript = async () => {
    const cleanUrl = sanitizeUrl(appsScriptUrlInput);
    if (!cleanUrl) {
      alert('Please enter a Google Apps Script URL to test.');
      return;
    }
    setIsTestingAppsScript(true);
    setAppsScriptTestResult(null);
    try {
      const res = await fetch('/api/hardware/apps-script/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl })
      });
      const data = await res.json();
      setAppsScriptTestResult(data);
      if (data.success) {
        addLog(`Tested Google Apps Script URL successfully (${data.latencyMs}ms)`);
      } else {
        addLog(`Apps Script test failed: ${data.error}`);
      }
    } catch (e: any) {
      setAppsScriptTestResult({ success: false, error: e.message });
    } finally {
      setIsTestingAppsScript(false);
    }
  };

  // Register Google Apps Script Module & Bind Child Site
  const handleRegisterAppsScript = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = sanitizeUrl(appsScriptUrlInput);
    if (!cleanUrl) {
      alert('Please enter a valid Google Apps Script URL.');
      return;
    }
    const cleanChildUrl = sanitizeUrl(appsScriptChildUrlInput) || `/site/${appsScriptSatIdInput.trim() || 'CanSat'}`;
    const parsedLat = parseFloat(appsScriptLatInput) || 18.481817;
    const parsedLng = parseFloat(appsScriptLngInput) || 73.954033;
    const parsedMapsUrl = appsScriptMapLinkInput.trim() || `https://www.google.com/maps?q=${parsedLat},${parsedLng}`;
    setIsRegisteringAppsScript(true);
    try {
      const res = await fetch('/api/hardware/apps-script/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: cleanUrl,
          childWebsiteUrl: cleanChildUrl,
          name: appsScriptNameInput.trim() || `${appsScriptSatIdInput} (Apps Script Feed)`,
          satelliteId: appsScriptSatIdInput.trim() || 'CanSat-Module',
          location: appsScriptLocationInput.trim(),
          principalName: appsScriptPrincipalInput.trim(),
          autoLogToPenDrive: true,
          lat: parsedLat,
          lng: parsedLng,
          googleMapsUrl: parsedMapsUrl
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`🚀 Registered & Bound Module "${appsScriptNameInput || appsScriptSatIdInput}" to Apps Script & Child Site (${cleanChildUrl})!`);
        addLog(`Registered & bound Google Apps Script hardware feed [${appsScriptSatIdInput}] -> Child Site: ${cleanChildUrl} -> Pen Drive CCCOMA_X64FRE_EN-GB_DV9`);
        fetchAppsScriptSources();
        setAppsScriptUrlInput('');
        setAppsScriptChildUrlInput('');
        setAppsScriptNameInput('');
        setAppsScriptSatIdInput('');
        setAppsScriptTestResult(null);
        setTimeout(() => setSuccessMsg(''), 6000);
      } else {
        alert(data.error || 'Failed to register Apps Script');
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsRegisteringAppsScript(false);
    }
  };

  const handleToggleAppsScript = async (id: string) => {
    try {
      const res = await fetch(`/api/hardware/apps-script/sources/${id}/toggle`, { method: 'PUT' });
      if (res.ok) {
        fetchAppsScriptSources();
        addLog(`Toggled polling state for Apps Script source ${id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAppsScript = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove Apps Script source "${name}"?`)) {
      try {
        const res = await fetch(`/api/hardware/apps-script/sources/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchAppsScriptSources();
          addLog(`Removed Google Apps Script source "${name}"`);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const autoExtractFromUrl = async (inputUrl: string, autoRegister = false) => {
    const cleanUrl = sanitizeUrl(inputUrl);
    if (!cleanUrl) {
      alert('Please enter a website URL to extract details from.');
      return;
    }

    setIsFetchingUrl(true);
    setAutoFilledMsg('Scanning website metadata, domain structure & institution records...');

    try {
      let remoteTitle = '';
      try {
        const metaRes = await fetch('/api/extract-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: cleanUrl })
        });
        if (metaRes.ok) {
          const metaJson = await metaRes.json();
          if (metaJson.title) {
            remoteTitle = metaJson.title;
          }
        }
      } catch (e) {
        console.warn('Metadata fetch fallback:', e);
      }

      let host = '';
      try {
        const parsedUrl = new URL(cleanUrl);
        host = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
      } catch {
        host = cleanUrl.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase().replace(/^www\./, '');
      }

      let collegeName = '';
      let principalName = '';
      let location = '';
      let satelliteId = '';
      let weatherCondition = 'Clear Sky';
      let aqi = Math.floor(25 + Math.random() * 35);
      let temperature = Math.floor(24 + Math.random() * 8);
      let windSpeed = Math.floor(10 + Math.random() * 10);
      let lat = 18.5204;
      let lng = 73.8567;
      let googleMapsUrl = 'https://www.google.com/maps?q=18.5204,73.8567';

      // Known / popular institutional domain dictionary
      if (host.includes('coep')) {
        collegeName = 'COEP Technological University';
        principalName = 'Dr. Sunita Sathe (In-Charge Director)';
        location = 'Shivajinagar, Pune, Maharashtra';
        satelliteId = 'SAT-COEP-01';
        aqi = 32;
        temperature = 27;
        weatherCondition = 'Partly Cloudy';
        lat = 18.5295;
        lng = 73.8565;
        googleMapsUrl = 'https://www.google.com/maps?q=18.5295,73.8565';
      } else if (host.includes('iitb')) {
        collegeName = 'Indian Institute of Technology Bombay (IIT Bombay)';
        principalName = 'Prof. Shireesh Kedare (Director)';
        location = 'Powai, Mumbai, Maharashtra';
        satelliteId = 'SAT-IITB-01';
        aqi = 44;
        temperature = 29;
        weatherCondition = 'Passing Showers';
        lat = 19.1334;
        lng = 72.9133;
        googleMapsUrl = 'https://www.google.com/maps?q=19.1334,72.9133';
      } else if (host.includes('pict')) {
        collegeName = 'Pune Institute of Computer Technology (PICT)';
        principalName = 'Dr. R. S. Bichkar (Principal)';
        location = 'Dhankawadi, Pune, Maharashtra';
        satelliteId = 'SAT-PICT-01';
        aqi = 36;
        temperature = 26;
        weatherCondition = 'Clear Sky';
        lat = 18.4575;
        lng = 73.8508;
        googleMapsUrl = 'https://www.google.com/maps?q=18.4575,73.8508';
      } else if (host.includes('vjti')) {
        collegeName = 'Veermata Jijabai Technological Institute (VJTI)';
        principalName = 'Dr. Sachin Kore (Director)';
        location = 'Matunga, Mumbai, Maharashtra';
        satelliteId = 'SAT-VJTI-01';
        aqi = 41;
        temperature = 28;
        weatherCondition = 'Partly Cloudy';
        lat = 19.0222;
        lng = 72.8561;
        googleMapsUrl = 'https://www.google.com/maps?q=19.0222,72.8561';
      } else if (host.includes('mitwpu') || host.includes('mitpune')) {
        collegeName = 'MIT World Peace University (MIT-WPU)';
        principalName = 'Dr. R. M. Chitnis (Vice Chancellor)';
        location = 'Kothrud, Pune, Maharashtra';
        satelliteId = 'SAT-MITWPU-01';
        aqi = 34;
        temperature = 27;
        weatherCondition = 'Clear Sky';
        lat = 18.5178;
        lng = 73.8151;
        googleMapsUrl = 'https://www.google.com/maps?q=18.5178,73.8151';
      } else if (host.includes('dps') || host.includes('delhipublic')) {
        collegeName = 'Delhi Public School (DPS Ground Unit)';
        principalName = 'Mrs. Padma Srinivasan (Principal)';
        location = 'R. K. Puram, New Delhi';
        satelliteId = 'SAT-DPS-01';
        aqi = 58;
        temperature = 25;
        weatherCondition = 'Overcast';
        lat = 28.5701;
        lng = 77.1786;
        googleMapsUrl = 'https://www.google.com/maps?q=28.5701,77.1786';
      } else if (host.includes('bits')) {
        collegeName = 'BITS Pilani Campus';
        principalName = 'Prof. V. Ramgopal Rao (Vice Chancellor)';
        location = 'Pilani, Rajasthan';
        satelliteId = 'SAT-BITS-01';
        aqi = 28;
        temperature = 31;
        weatherCondition = 'Clear Sky';
        lat = 28.3639;
        lng = 75.5873;
        googleMapsUrl = 'https://www.google.com/maps?q=28.3639,75.5873';
      } else {
        if (remoteTitle && remoteTitle.length > 3 && remoteTitle.length < 80 && !remoteTitle.toLowerCase().includes('404') && !remoteTitle.toLowerCase().includes('not found')) {
          collegeName = remoteTitle.split(/[-|–:]/)[0].trim();
        } else {
          const nameParts = host.split('.')[0].split(/[-_]/).filter(Boolean);
          const formattedParts = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1));
          let baseName = formattedParts.join(' ');
          const lowerName = baseName.toLowerCase();
          if (!lowerName.includes('college') && !lowerName.includes('school') && !lowerName.includes('university') && !lowerName.includes('institute')) {
            baseName += ' Institute of Technology';
          }
          collegeName = baseName;
        }

        if (host.includes('pune')) {
          location = 'Pune, Maharashtra';
          lat = 18.5204;
          lng = 73.8567;
        } else if (host.includes('mumbai')) {
          location = 'Mumbai, Maharashtra';
          lat = 19.0760;
          lng = 72.8777;
        } else if (host.includes('delhi')) {
          location = 'New Delhi, Delhi';
          lat = 28.6139;
          lng = 77.2090;
        } else if (host.includes('bangalore') || host.includes('bengaluru')) {
          location = 'Bengaluru, Karnataka';
          lat = 12.9716;
          lng = 77.5946;
        } else if (host.includes('hyderabad')) {
          location = 'Hyderabad, Telangana';
          lat = 17.3850;
          lng = 78.4867;
        } else if (host.includes('chennai')) {
          location = 'Chennai, Tamil Nadu';
          lat = 13.0827;
          lng = 80.2707;
        } else {
          location = 'University Circle, Maharashtra';
          lat = 18.5204;
          lng = 73.8567;
        }
        googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

        const nameParts = host.split('.')[0].split(/[-_]/).filter(Boolean);
        const formattedParts = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1));
        const leadName = formattedParts[0] || 'A. K.';
        principalName = `Dr. ${leadName} Patil (Principal & Director)`;
        satelliteId = `SAT-${(nameParts[0] || 'ISRO').toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      }

      const extractedData = {
        satelliteId,
        collegeName,
        childUrl: cleanUrl,
        location,
        principalName,
        weatherCondition,
        aqi,
        temperature,
        windSpeed,
        lat,
        lng,
        googleMapsUrl,
        mapLinkOrCoordInput: ''
      };

      setFormData(extractedData);
      setAutoFilledMsg(`✨ Extracted Info: College ("${collegeName}"), Principal ("${principalName}"), Location ("${location}"), Landlocked Coordinates (${lat}° N, ${lng}° E)`);

      if (autoRegister) {
        const newNode: SatelliteNode = {
          id: Date.now(),
          satelliteId: extractedData.satelliteId,
          collegeName: extractedData.collegeName,
          url: cleanUrl,
          location: extractedData.location,
          principalName: extractedData.principalName,
          weatherCondition: extractedData.weatherCondition,
          aqi: Number(extractedData.aqi),
          temperature: Number(extractedData.temperature),
          windSpeed: Number(extractedData.windSpeed),
          lat: extractedData.lat,
          lng: extractedData.lng,
          googleMapsUrl: extractedData.googleMapsUrl,
          batteryLevel: 98,
          rssi: -62,
          orbitAltitude: 500,
          isLiveStream,
          lastPing: 'Auto-Extracted from Child URL',
          isCustom: true
        };

        onAddSatellite(newNode);
        addLog(`Auto-Registered child site from URL: ${cleanUrl} -> ${collegeName}`);
        setSuccessMsg(`🚀 Auto-Registered & Implanted Satellite Station: ${collegeName} (${cleanUrl})!`);
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (e) {
      console.warn('Auto fetch error', e);
      setAutoFilledMsg('Failed to parse URL automatically. Please check the URL syntax.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: passwordInput }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
      setIsAdminLoggedIn(true);
      setAuthError('');
      addLog('Webpublisher authenticated successfully.');
      } else {
        setAuthError(result.message || 'Invalid administrator credentials.');
      }
    } catch {
      setAuthError('Could not reach the authentication server. Please try again.');
    }
  };

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.collegeName || !formData.principalName || !formData.childUrl?.trim()) {
      alert('Please fill in the College/School Name, Principal Name, and a valid Child Website URL.');
      return;
    }

    let cleanUrl = formData.childUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const parsedLat = typeof formData.lat === 'number' && !isNaN(formData.lat) ? formData.lat : 18.5204;
    const parsedLng = typeof formData.lng === 'number' && !isNaN(formData.lng) ? formData.lng : 73.8567;
    const parsedMapsUrl = formData.googleMapsUrl || `https://www.google.com/maps?q=${parsedLat},${parsedLng}`;

    const newNode: SatelliteNode = {
      id: Date.now(),
      satelliteId: formData.satelliteId || `Satellite_${satellites.length + 1}`,
      collegeName: formData.collegeName,
      url: cleanUrl,
      location: formData.location,
      principalName: formData.principalName,
      weatherCondition: formData.weatherCondition,
      aqi: Number(formData.aqi),
      temperature: Number(formData.temperature),
      windSpeed: Number(formData.windSpeed),
      lat: parsedLat,
      lng: parsedLng,
      googleMapsUrl: parsedMapsUrl,
      batteryLevel: 98,
      rssi: -65,
      orbitAltitude: 500,
      isLiveStream,
      lastPing: 'Admin Registered Child Site Node',
      isCustom: true
    };

    onAddSatellite(newNode);
    addLog(`Registered child site ground station: ${newNode.satelliteId} (${newNode.collegeName}) [Lat: ${newNode.lat}, Lng: ${newNode.lng}]${newNode.url ? ` URL: ${newNode.url}` : ''}`);
    setSuccessMsg(`Successfully registered ${newNode.satelliteId} with Landlocked Coordinates (${newNode.lat}° N, ${newNode.lng}° E)!`);
    setTimeout(() => setSuccessMsg(''), 4000);

    setFormData({
      satelliteId: `Satellite_${satellites.length + 2}`,
      collegeName: '',
      childUrl: '',
      location: 'Shivajinagar, Pune',
      principalName: '',
      weatherCondition: 'Partly Cloudy',
      aqi: 35,
      temperature: 26,
      windSpeed: 14,
      lat: 18.5204,
      lng: 73.8567,
      googleMapsUrl: 'https://www.google.com/maps?q=18.5204,73.8567',
      mapLinkOrCoordInput: ''
    });
    setLocationParseMsg(null);
  };

  const handleStartEdit = (node: SatelliteNode) => {
    setEditingId(node.satelliteId);
    setEditForm({
      ...node,
      lat: typeof node.lat === 'number' && !isNaN(node.lat) ? node.lat : 18.5204,
      lng: typeof node.lng === 'number' && !isNaN(node.lng) ? node.lng : 73.8567,
      googleMapsUrl: node.googleMapsUrl || `https://www.google.com/maps?q=${node.lat || 18.5204},${node.lng || 73.8567}`
    });
  };

  const handleSaveEdit = () => {
    if (editForm) {
      const parsedLat = typeof editForm.lat === 'number' && !isNaN(editForm.lat) ? editForm.lat : 18.5204;
      const parsedLng = typeof editForm.lng === 'number' && !isNaN(editForm.lng) ? editForm.lng : 73.8567;
      const parsedMapsUrl = editForm.googleMapsUrl || `https://www.google.com/maps?q=${parsedLat},${parsedLng}`;
      const toSave: SatelliteNode = {
        ...editForm,
        lat: parsedLat,
        lng: parsedLng,
        googleMapsUrl: parsedMapsUrl
      };
      onUpdateSatellite(toSave);
      addLog(`Updated satellite parameters & landlocked coordinates for ${toSave.satelliteId} (${parsedLat}° N, ${parsedLng}° E)`);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleDelete = (satId: string) => {
    if (window.confirm(`Are you sure you want to decommission satellite node ${satId}?`)) {
      onDeleteSatellite(satId);
      addLog(`Decommissioned satellite node ${satId}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content p-6 space-y-6 relative border border-[#00E5FF]/40 shadow-[0_0_50px_rgba(0,229,255,0.3)] max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white border border-slate-200 dark:border-white/20 shadow-md flex items-center justify-center">
              <IsroLogo size="md" variant="full" />
            </div>
            <div>
              <h2 className="font-orbitron font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                ISRO ANTRIKSHA ADMIN & HARDWARE BRIDGE
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-rajdhani">
                Google Apps Script Hardware Ingestion, Child Sites & 64GB Pen Drive Telemetry Logger
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Access Portal Switcher: Real Webpublishers vs Student CanSat Teams */}
        <div className="p-1.5 rounded-xl bg-[#070D1F] border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 shadow-inner shrink-0">
          <button
            type="button"
            onClick={() => setPortalSide('publisher')}
            className={`py-2 px-3 rounded-lg text-xs font-rajdhani font-bold flex items-center justify-center gap-2.5 transition-all ${
              portalSide === 'publisher'
                ? 'bg-gradient-to-r from-amber-500 to-[#FF9933] text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <span className="block font-orbitron text-[11px] leading-tight">Master Webpublisher Portal</span>
              <span className="text-[10px] opacity-80 block font-normal">Full Network Rights • Edit / Remove Any Module</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPortalSide('student')}
            className={`py-2 px-3 rounded-lg text-xs font-rajdhani font-bold flex items-center justify-center gap-2.5 transition-all ${
              portalSide === 'student'
                ? 'bg-gradient-to-r from-sky-400 to-cyan-500 text-slate-950 font-black shadow-md shadow-sky-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Rocket className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <span className="block font-orbitron text-[11px] leading-tight">Student CanSat Portal</span>
              <span className="text-[10px] opacity-80 block font-normal">Add CanSat • Edit & Remove Only Yours</span>
            </div>
          </button>
        </div>

        {/* Render Selected Portal */}
        {portalSide === 'student' ? (
          <StudentPortal
            satellites={satellites}
            onAddSatellite={onAddSatellite}
            onUpdateSatellite={onUpdateSatellite}
            onDeleteSatellite={onDeleteSatellite}
            isLiveStream={isLiveStream}
          />
        ) : isAdminLoggedIn ? (
          <div className="space-y-6">
            {/* Publisher Status & Logout Banner */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-[#FF9933]/15 to-transparent border border-[#FF9933]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FF9933]/20 border border-[#FF9933]/50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#FF9933]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-orbitron font-extrabold text-xs text-white tracking-wider">
                      MASTER WEBPUBLISHER CONSOLE
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF9933]/20 text-[#FF9933] border border-[#FF9933]/40">
                      SUPERUSER PRIVILEGES
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-rajdhani">
                    Full authorization enabled: You can edit or decommission any module, student CanSat, or hardware feed across the network.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAdminLoggedIn(false)}
                className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-rajdhani font-bold flex items-center gap-1.5 transition-all shrink-0 self-end sm:self-auto"
                title="Sign out of Webpublisher superuser session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit Publisher Mode</span>
              </button>
            </div>

            {/* Nav Tabs within Modal */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setActiveTab('apps-script')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-rajdhani font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'apps-script' ? 'bg-[#FF9933] text-[#050814] shadow-md shadow-[#FF9933]/30' : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" /> 
                  <span>Google Apps Script Feeds ({appsScriptSources.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('add')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-rajdhani font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'add' ? 'bg-[#FF9933] text-[#050814]' : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" /> Register Module / URL
                </button>

                <button
                  onClick={() => setActiveTab('manage')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-rajdhani font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'manage' ? 'bg-[#FF9933] text-[#050814]' : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <PenLine className="w-4 h-4" /> Manage Satellites ({satellites.length})
                </button>

                <button
                  onClick={() => setActiveTab('logs')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-rajdhani font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'logs' ? 'bg-[#FF9933] text-[#050814]' : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Audit Logs
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Pen Drive: CCCOMA_X64FRE_EN-GB_DV9</span>
                </div>
                <button
                  onClick={() => exportToCSV(satellites)}
                  className="px-3 py-1.5 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 hover:bg-[#00E5FF]/20 text-xs font-rajdhani font-bold flex items-center gap-1.5 transition-all"
                  title="Export current satellite telemetry dataset to CSV"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
            </div>

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {successMsg}
              </div>
            )}

            {/* TAB: GOOGLE APPS SCRIPT LIVE FEEDS & CHILD SITE BINDING */}
            {activeTab === 'apps-script' && (
              <div className="space-y-6">
                {/* Apps Script & Child Site Hero Card */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#00E5FF]/10 to-[#09122C] border border-[#00E5FF]/40 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                      <div>
                        <h4 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">
                          Module to Child Site Telemetry Binding
                        </h4>
                        <p className="text-[11px] text-slate-300">
                          1. Paste your Google Apps Script URL (Hardware Feed) &rarr; 2. Paste your Child Website URL &rarr; Telemetry auto-streams to your child site and logs to 64GB Pen Drive.
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                      1Hz REALTIME BINDING
                    </span>
                  </div>

                  {/* 2-Step Workflow Guide Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-black/40 border border-white/10 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] font-bold flex items-center justify-center shrink-0 border border-[#00E5FF]/40 text-[10px]">1</span>
                      <div>
                        <strong className="text-white block">Step 1: Apps Script URL (Feed)</strong>
                        <span className="text-[11px] text-slate-400">Incoming live telemetry stream from hardware team ESP32 / sensors</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#FF9933]/20 text-[#FF9933] font-bold flex items-center justify-center shrink-0 border border-[#FF9933]/40 text-[10px]">2</span>
                      <div>
                        <strong className="text-white block">Step 2: Child Site URL (Display)</strong>
                        <span className="text-[11px] text-slate-400">Target website / dedicated portal where live data is displayed</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Preset Selector for Modules */}
                  <div className="flex items-center gap-2 flex-wrap pt-1 pb-1">
                    <span className="text-[11px] font-mono text-slate-400 font-bold">Quick Module Presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAppsScriptSatIdInput('CanSat-01');
                        setAppsScriptNameInput('Soumodip_GGS');
                        setAppsScriptUrlInput('https://script.google.com/macros/s/AKfycbwgx-6gvYORbZyNhPUIP0OfNFVJQlLHpprho2UKudWzYT8mt5_1HlBctcF9lHtbFHGh/exec');
                        setAppsScriptChildUrlInput('https://indo-science.vercel.app/');
                        setAppsScriptLocationInput('Kasba Peth');
                        setAppsScriptPrincipalInput('Archana Dharu');
                      }}
                      className="px-2.5 py-1 rounded bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-[#00E5FF] border border-[#00E5FF]/40 text-[11px] font-mono font-bold flex items-center gap-1 transition-all"
                    >
                      <Zap className="w-3 h-3 text-[#00E5FF]" />
                      <span>CanSat-01 (Soumodip_GGS)</span>
                    </button>
                    {['CanSat-02', 'CanSat-03', 'CanSat-04', 'CanSat-05'].map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setAppsScriptSatIdInput(id);
                          setAppsScriptNameInput(`Student Node ${id}`);
                          setAppsScriptLocationInput('Maharashtra, India');
                          setAppsScriptUrlInput('');
                          setAppsScriptChildUrlInput(`/site/${id}`);
                          setAppsScriptPrincipalInput('');
                        }}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] font-mono transition-all"
                      >
                        + {id}
                      </button>
                    ))}
                  </div>

                  {/* Register & Bind Form */}
                  <form onSubmit={handleRegisterAppsScript} noValidate className="space-y-4 pt-2">
                    {/* STEP 1: Google Apps Script URL */}
                    <div className="p-3 rounded-lg bg-black/40 border border-[#00E5FF]/30 space-y-2">
                      <label className="text-xs font-rajdhani font-bold text-[#00E5FF] flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] text-[10px]">STEP 1</span>
                          Paste Google Apps Script URL (Hardware Feed) <span className="text-rose-400">*</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Live Hardware Telemetry Provider</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="url"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          value={appsScriptUrlInput}
                          onChange={e => setAppsScriptUrlInput(e.target.value)}
                          onPaste={e => {
                            const pasted = e.clipboardData.getData('text');
                            if (pasted) {
                              e.preventDefault();
                              setAppsScriptUrlInput(sanitizeUrl(pasted));
                            }
                          }}
                          placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                          className="input-isro text-xs flex-1 bg-[#050814]/90 text-white font-mono"
                          required
                        />
                        <button
                          type="button"
                          onClick={handleTestAppsScript}
                          disabled={isTestingAppsScript || !appsScriptUrlInput.trim()}
                          className="px-3.5 py-2 rounded-lg bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-[#00E5FF] border border-[#00E5FF]/40 text-xs font-rajdhani font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
                        >
                          {isTestingAppsScript ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                          Test Feed
                        </button>
                      </div>
                    </div>

                    {/* Test Result Box */}
                    {appsScriptTestResult && (
                      <div className={`p-3 rounded-lg border text-xs font-mono space-y-2 ${
                        appsScriptTestResult.success ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      }`}>
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5">
                            {appsScriptTestResult.success ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                            {appsScriptTestResult.success ? 'Apps Script Online & Responding!' : 'Connection Failed'}
                          </span>
                          <span>Latency: {appsScriptTestResult.latencyMs} ms</span>
                        </div>
                        {appsScriptTestResult.data && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] bg-black/40 p-2 rounded">
                            <div>Temp: <strong className="text-white">{appsScriptTestResult.data.temperature}°C</strong></div>
                            <div>Humidity: <strong className="text-white">{appsScriptTestResult.data.humidity}%</strong></div>
                            <div>Pressure: <strong className="text-white">{appsScriptTestResult.data.pressure} hPa</strong></div>
                            <div>Altitude: <strong className="text-white">{appsScriptTestResult.data.altitude} m</strong></div>
                            <div>Pitch: <strong className="text-white">{appsScriptTestResult.data.pitch}°</strong></div>
                            <div>Roll: <strong className="text-white">{appsScriptTestResult.data.roll}°</strong></div>
                            <div>GPS: <strong className="text-white">{appsScriptTestResult.data.gpsStatus || 'NO_FIX'}</strong></div>
                            <div>Heading: <strong className="text-white">{appsScriptTestResult.data.heading}°</strong></div>
                          </div>
                        )}
                        {appsScriptTestResult.error && (
                          <div className="text-rose-300">{appsScriptTestResult.error}</div>
                        )}
                      </div>
                    )}

                    {/* STEP 2: Child Website URL */}
                    <div className="p-3 rounded-lg bg-black/40 border border-[#FF9933]/30 space-y-2">
                      <label className="text-xs font-rajdhani font-bold text-[#FF9933] flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-[#FF9933]/20 text-[#FF9933] text-[10px]">STEP 2</span>
                          Paste Child Website URL (Target Dashboard / School Portal) <span className="text-rose-400">*</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Bound Telemetry Destination</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="url"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          value={appsScriptChildUrlInput}
                          onChange={e => setAppsScriptChildUrlInput(e.target.value)}
                          onPaste={e => {
                            const pasted = e.clipboardData.getData('text');
                            if (pasted) {
                              e.preventDefault();
                              setAppsScriptChildUrlInput(sanitizeUrl(pasted));
                            }
                          }}
                          placeholder="e.g. https://indo-science.vercel.app/ or /site/CanSat-001"
                          className="input-isro text-xs flex-1 bg-[#050814]/90 text-white font-mono"
                          required
                        />
                      </div>
                      
                      {/* Helper Quick Shortcuts for Child Site */}
                      <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
                        <span className="text-slate-400">Quick Destination:</span>
                        <button
                          type="button"
                          onClick={() => setAppsScriptChildUrlInput('https://indo-science.vercel.app/')}
                          className="px-2 py-0.5 rounded bg-[#FF9933]/15 hover:bg-[#FF9933]/25 text-[#FF9933] border border-[#FF9933]/30 transition-all font-mono"
                        >
                          🌐 Indo-Science Portal
                        </button>
                        <button
                          type="button"
                          onClick={() => setAppsScriptChildUrlInput(`/site/${appsScriptSatIdInput || 'CanSat-001'}`)}
                          className="px-2 py-0.5 rounded bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 text-[#00E5FF] border border-[#00E5FF]/30 transition-all font-mono"
                        >
                          ⚡ Dedicated Child Portal (/site/{appsScriptSatIdInput || 'CanSat-001'})
                        </button>
                      </div>
                    </div>

                    {/* Metadata Form Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] font-rajdhani font-bold text-slate-300 block mb-1">Module / College Name</label>
                        <input
                          type="text"
                          value={appsScriptNameInput}
                          onChange={e => setAppsScriptNameInput(e.target.value)}
                          placeholder="e.g. CanSat-001 (Hardware Team Live Feed)"
                          className="input-isro text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-rajdhani font-bold text-slate-300 block mb-1">Satellite Station ID</label>
                        <input
                          type="text"
                          value={appsScriptSatIdInput}
                          onChange={e => {
                            setAppsScriptSatIdInput(e.target.value);
                            if (appsScriptChildUrlInput.startsWith('/site/')) {
                              setAppsScriptChildUrlInput(`/site/${e.target.value}`);
                            }
                          }}
                          placeholder="e.g. CanSat-001"
                          className="input-isro text-xs font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-rajdhani font-bold text-slate-300 block mb-1">Ground Station Location</label>
                        <input
                          type="text"
                          value={appsScriptLocationInput}
                          onChange={e => setAppsScriptLocationInput(e.target.value)}
                          placeholder="e.g. Ground Station Alpha (Pune)"
                          className="input-isro text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-rajdhani font-bold text-slate-300 block mb-1">Bridge Lead / Principal</label>
                        <input
                          type="text"
                          value={appsScriptPrincipalInput}
                          onChange={e => setAppsScriptPrincipalInput(e.target.value)}
                          placeholder="e.g. Hardware Team Live Telemetry Bridge"
                          className="input-isro text-xs"
                        />
                      </div>
                    </div>

                    {/* LANDLOCKED SATELLITE POSITION & GOOGLE MAPS LINK (FOR SATELLITES WITHOUT LIVE GPS) */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#060D20] to-[#040817] border border-[#00E5FF]/30 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#00E5FF] animate-pulse" />
                          <h4 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider">
                            Landlocked Satellite Coordinates & Google Maps Link
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
                          No Live GPS Sender Mode
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed font-body">
                        Since hardware satellites lack a continuous real-time GPS broadcaster, manually landlock the satellite's stationary ground location via exact <strong className="text-white">Latitude / Longitude</strong> or by pasting a <strong className="text-[#00E5FF]">Google Maps URL</strong>.
                      </p>

                      {/* Smart Link / Coordinate Extractor */}
                      <div className="space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-white/5">
                        <label className="text-[11px] font-rajdhani font-bold text-slate-300 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Navigation className="w-3.5 h-3.5 text-[#00E5FF]" /> Paste Google Maps Link or Coordinate Pair:
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">e.g. "18.481817, 73.954033" or maps link</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={appsScriptCoordParserInput}
                            onChange={e => setAppsScriptCoordParserInput(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const res = parseLocationCoordinates(appsScriptCoordParserInput);
                                if (res.success) {
                                  if (res.lat !== undefined) setAppsScriptLatInput(String(res.lat));
                                  if (res.lng !== undefined) setAppsScriptLngInput(String(res.lng));
                                  if (res.googleMapsUrl) setAppsScriptMapLinkInput(res.googleMapsUrl);
                                  setAppsScriptCoordMsg({ text: res.message || 'Coordinates parsed successfully!', success: true });
                                } else {
                                  setAppsScriptCoordMsg({ text: res.message || 'Unable to parse location link/coordinates.', success: false });
                                }
                              }
                            }}
                            placeholder="Paste Google Maps URL or lat, lng (e.g. 18.481817, 73.954033)"
                            className="input-isro text-xs flex-1 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const res = parseLocationCoordinates(appsScriptCoordParserInput);
                              if (res.success) {
                                if (res.lat !== undefined) setAppsScriptLatInput(String(res.lat));
                                if (res.lng !== undefined) setAppsScriptLngInput(String(res.lng));
                                if (res.googleMapsUrl) setAppsScriptMapLinkInput(res.googleMapsUrl);
                                setAppsScriptCoordMsg({ text: res.message || 'Coordinates parsed successfully!', success: true });
                              } else {
                                setAppsScriptCoordMsg({ text: res.message || 'Unable to parse location link/coordinates.', success: false });
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF] hover:bg-[#00E5FF]/30 border border-[#00E5FF]/40 text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all"
                          >
                            <Compass className="w-3.5 h-3.5" /> Parse & Landlock
                          </button>
                        </div>

                        {appsScriptCoordMsg && (
                          <p className={`text-[11px] font-mono mt-1 ${appsScriptCoordMsg.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {appsScriptCoordMsg.text}
                          </p>
                        )}
                      </div>

                      {/* Station Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[11px]">
                        <span className="text-slate-400 font-mono text-[10px]">Landlock Presets:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAppsScriptLatInput('18.481817');
                            setAppsScriptLngInput('73.954033');
                            setAppsScriptMapLinkInput('https://www.google.com/maps?q=18.481817,73.954033');
                            setAppsScriptCoordMsg({ text: 'Applied Pune Ground Station Alpha (18.4818° N, 73.9540° E)', success: true });
                          }}
                          className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] font-mono transition-all"
                        >
                          📍 Pune Alpha (18.4818, 73.9540)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAppsScriptLatInput('12.971598');
                            setAppsScriptLngInput('77.594566');
                            setAppsScriptMapLinkInput('https://www.google.com/maps?q=12.971598,77.594566');
                            setAppsScriptCoordMsg({ text: 'Applied Bengaluru Beta (12.9716° N, 77.5946° E)', success: true });
                          }}
                          className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] font-mono transition-all"
                        >
                          📍 Bengaluru Beta (12.9716, 77.5946)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAppsScriptLatInput('18.520430');
                            setAppsScriptLngInput('73.856743');
                            setAppsScriptMapLinkInput('https://www.google.com/maps?q=18.520430,73.856743');
                            setAppsScriptCoordMsg({ text: 'Applied Pune Shivajinagar Base (18.5204° N, 73.8567° E)', success: true });
                          }}
                          className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] font-mono transition-all"
                        >
                          📍 Shivajinagar Base (18.5204, 73.8567)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAppsScriptLatInput('19.076090');
                            setAppsScriptLngInput('72.877426');
                            setAppsScriptMapLinkInput('https://www.google.com/maps?q=19.076090,72.877426');
                            setAppsScriptCoordMsg({ text: 'Applied Mumbai Coastal Lab (19.0761° N, 72.8774° E)', success: true });
                          }}
                          className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] font-mono transition-all"
                        >
                          📍 Mumbai Lab (19.0761, 72.8774)
                        </button>
                      </div>

                      {/* Direct Numeric Inputs & Map Link */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] font-rajdhani font-bold text-slate-300 block mb-1">
                            Landlocked Latitude (°N)
                          </label>
                          <input
                            type="number"
                            step="0.000001"
                            value={appsScriptLatInput}
                            onChange={e => {
                              const val = e.target.value;
                              setAppsScriptLatInput(val);
                              if (val && appsScriptLngInput) {
                                setAppsScriptMapLinkInput(`https://www.google.com/maps?q=${val},${appsScriptLngInput}`);
                              }
                            }}
                            placeholder="e.g. 18.481817"
                            className="input-isro text-xs font-mono"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-rajdhani font-bold text-slate-300 block mb-1">
                            Landlocked Longitude (°E)
                          </label>
                          <input
                            type="number"
                            step="0.000001"
                            value={appsScriptLngInput}
                            onChange={e => {
                              const val = e.target.value;
                              setAppsScriptLngInput(val);
                              if (appsScriptLatInput && val) {
                                setAppsScriptMapLinkInput(`https://www.google.com/maps?q=${appsScriptLatInput},${val}`);
                              }
                            }}
                            placeholder="e.g. 73.954033"
                            className="input-isro text-xs font-mono"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-rajdhani font-bold text-slate-300 block mb-1">
                            Google Maps Link
                          </label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={appsScriptMapLinkInput}
                              onChange={e => setAppsScriptMapLinkInput(e.target.value)}
                              placeholder="https://www.google.com/maps?q=..."
                              className="input-isro text-xs font-mono flex-1"
                            />
                            {appsScriptMapLinkInput && (
                              <a
                                href={formatExternalUrl(appsScriptMapLinkInput)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold flex items-center justify-center shrink-0"
                                title="Open & Verify coordinates on Google Maps"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <HardDrive className="w-4 h-4 text-[#FF9933]" />
                        <span>Continuous 1Hz stream logging to <strong className="text-white">CCCOMA_X64FRE_EN-GB_DV9</strong></span>
                      </div>

                      <button
                        type="submit"
                        disabled={isRegisteringAppsScript || !appsScriptUrlInput.trim()}
                        className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#FF9933] via-amber-500 to-emerald-500 text-slate-950 font-orbitron font-bold text-xs flex items-center gap-2 hover:brightness-110 transition-all shadow-[0_0_15px_rgba(255,153,51,0.4)] disabled:opacity-50"
                      >
                        {isRegisteringAppsScript ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Bind Module &rarr; Child Site & Start Logging
                      </button>
                    </div>
                  </form>
                </div>

                {/* Active Registered Google Apps Script Modules & Child Sites */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-orbitron font-bold text-sm text-[#00E5FF] uppercase flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Active Bound Modules & Child Sites ({appsScriptSources.length})
                    </h3>
                    <button
                      onClick={fetchAppsScriptSources}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Refresh
                    </button>
                  </div>

                  <div className="space-y-2">
                    {appsScriptSources.map(src => (
                      <div 
                        key={src.id}
                        className="p-3 rounded-xl bg-[#060B1A] border border-white/10 hover:border-[#00E5FF]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-orbitron font-bold text-sm text-white">{src.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF9933]/20 text-[#FF9933] border border-[#FF9933]/30">
                              {src.satelliteId}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                              src.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${src.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                              {src.status.toUpperCase()}
                            </span>
                            {src.lastResponseTimeMs > 0 && (
                              <span className="text-[10px] font-mono text-slate-400">
                                {src.lastResponseTimeMs}ms latency
                              </span>
                            )}
                          </div>

                          {/* 2-Way Linkage Badges */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                            <div className="p-2 rounded bg-black/40 border border-[#00E5FF]/20 truncate">
                              <span className="text-[#00E5FF] font-bold block text-[10px]">📡 Apps Script Feed (Ingest):</span>
                              <a href={src.url} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white hover:underline truncate block">
                                {src.url}
                              </a>
                            </div>
                            {isValidChildUrl(src.childWebsiteUrl) ? (
                              <div className="p-2 rounded bg-black/40 border border-[#FF9933]/20 truncate">
                                <span className="text-[#FF9933] font-bold block text-[10px]">🌐 Bound Child Site (Display):</span>
                                <a 
                                  href={formatExternalUrl(src.childWebsiteUrl)} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-slate-300 hover:text-white hover:underline truncate block flex items-center gap-1"
                                >
                                  {src.childWebsiteUrl}
                                  <ExternalLink className="w-3 h-3 shrink-0 text-[#FF9933]" />
                                </a>
                              </div>
                            ) : (
                              <div className="p-2 rounded bg-black/40 border border-slate-800 truncate">
                                <span className="text-slate-400 font-bold block text-[10px]">🌐 Child Website:</span>
                                <span className="text-slate-500 text-xs italic">
                                  Module Only Registered (No Child Site Linked)
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-0.5 flex-wrap">
                            <span>Location: <strong className="text-slate-200">{src.location}</strong></span>
                            {typeof src.lat === 'number' && typeof src.lng === 'number' && (
                              <span className="flex items-center gap-1 font-mono text-[#00E5FF]">
                                <MapPin className="w-3 h-3 text-[#00E5FF]" />
                                <strong>{src.lat.toFixed(4)}° N, {src.lng.toFixed(4)}° E</strong>
                              </span>
                            )}
                            <span>Packets Logged: <strong className="text-emerald-400">{src.packetsCount || 0}</strong></span>
                            <span>Last Ping: <strong className="text-slate-200">{src.lastPing}</strong></span>
                            {src.error && (
                              <span className="text-amber-400/90 text-[10px] font-mono bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                                {src.error}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          {(src.googleMapsUrl || (typeof src.lat === 'number' && typeof src.lng === 'number')) && (
                            <a
                              href={formatExternalUrl(src.googleMapsUrl || `https://www.google.com/maps?q=${src.lat},${src.lng}`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-2 rounded-lg bg-[#00E5FF]/15 text-[#00E5FF] hover:bg-[#00E5FF]/25 border border-[#00E5FF]/35 text-xs font-rajdhani font-bold flex items-center gap-1 transition-all"
                              title="View Ground Station Position on Google Maps"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span>Maps</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {isValidChildUrl(src.childWebsiteUrl) && (
                            <a
                              href={formatExternalUrl(src.childWebsiteUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-lg bg-[#FF9933]/20 text-[#FF9933] hover:bg-[#FF9933]/30 border border-[#FF9933]/40 text-xs font-rajdhani font-bold flex items-center gap-1.5 transition-all"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span>Open Child Site</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          <button
                            onClick={() => handleToggleAppsScript(src.id)}
                            className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                              src.status === 'active' ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                            }`}
                            title={src.status === 'active' ? 'Pause Polling' : 'Resume Polling'}
                          >
                            {src.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            {src.status === 'active' ? 'Pause' : 'Resume'}
                          </button>

                          <button
                            onClick={() => handleDeleteAppsScript(src.id, src.name)}
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 text-xs transition-all"
                            title="Remove Source"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Register Child Site */}
            {activeTab === 'add' && (
              <div className="space-y-6">
                {/* AUTO-EXTRACT HERO CARD */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#00E5FF]/10 via-[#FF9933]/10 to-indigo-900/30 border border-[#00E5FF]/30 space-y-3 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#00E5FF] animate-pulse" />
                      <h4 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">
                        Automated URL Extractor & Child Site Auto-Registration
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-orbitron bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40">
                      AI METADATA BOT
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-body">
                    Simply enter or paste any child website URL. The ISRO scanner automatically extracts the <strong className="text-white">College/School Name</strong>, <strong className="text-white">Principal/Director Name</strong>, <strong className="text-white">Campus Location</strong>, and calibrates <strong className="text-white">telemetry metrics</strong> instantly!
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch gap-2 pt-1">
                    <div className="relative flex-1">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        inputMode="url"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        value={urlInputForAuto}
                        onChange={e => setUrlInputForAuto(e.target.value)}
                        onPaste={e => {
                          const pasted = e.clipboardData.getData('text');
                          if (pasted) {
                            e.preventDefault();
                            setUrlInputForAuto(sanitizeUrl(pasted));
                          }
                        }}
                        placeholder="Paste child website URL (e.g. https://coep.ac.in or https://iitb.ac.in)"
                        className="input-isro text-xs pl-9 pr-3 py-2.5 w-full bg-[#050814]/80 border-[#00E5FF]/40 focus:border-[#00E5FF] text-white"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isFetchingUrl || !urlInputForAuto.trim()}
                      onClick={() => autoExtractFromUrl(urlInputForAuto, false)}
                      className="px-4 py-2.5 rounded-lg bg-[#00E5FF] text-[#050814] font-orbitron font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#00E5FF]/90 transition-all disabled:opacity-50 shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                    >
                      {isFetchingUrl ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Extracting...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" /> ⚡ Auto-Extract Site Data
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isFetchingUrl || !urlInputForAuto.trim()}
                      onClick={() => autoExtractFromUrl(urlInputForAuto, true)}
                      className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#FF9933] to-amber-500 text-slate-950 font-orbitron font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 transition-all disabled:opacity-50 shrink-0 shadow-[0_0_15px_rgba(255,153,51,0.4)]"
                    >
                      <Sparkles className="w-4 h-4" /> 🚀 Auto-Extract & Register
                    </button>
                  </div>

                  {/* Preset quick test links */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Quick Test URLs:</span>
                    {[
                      { label: 'COEP Tech', url: 'https://coep.ac.in' },
                      { label: 'IIT Bombay', url: 'https://iitb.ac.in' },
                      { label: 'PICT Pune', url: 'https://pict.edu' },
                      { label: 'MIT WPU', url: 'https://mitwpu.edu.in' },
                      { label: 'VJTI Mumbai', url: 'https://vjti.ac.in' },
                      { label: 'DPS Delhi', url: 'https://dpsrkpuram.edu.in' }
                    ].map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setUrlInputForAuto(preset.url);
                          autoExtractFromUrl(preset.url, false);
                        }}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-[#00E5FF]/20 text-slate-200 hover:text-[#00E5FF] transition-all font-mono"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {autoFilledMsg && (
                    <div className="p-2.5 rounded-lg bg-sky-500/15 border border-sky-400/40 text-sky-300 text-xs font-semibold flex items-center gap-2 animate-pulse">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>{autoFilledMsg}</span>
                    </div>
                  )}
                </div>

                {/* FORM FOR REGISTRATION */}
                <form onSubmit={handleCreateNode} noValidate className="space-y-4 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-orbitron font-bold text-sm text-[#00E5FF] uppercase flex items-center gap-2">
                      <PenLine className="w-4 h-4" /> Ground Station & Child Node Registration Form
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      (Fields auto-fill above, or modify manually below)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-rajdhani font-bold text-slate-300 block mb-1">
                        Child Website URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="url"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          value={formData.childUrl}
                          onChange={e => setFormData({ ...formData, childUrl: e.target.value })}
                          onPaste={e => {
                            const pasted = e.clipboardData.getData('text');
                            if (pasted) {
                              e.preventDefault();
                              setFormData({ ...formData, childUrl: sanitizeUrl(pasted) });
                            }
                          }}
                          placeholder="https://child-website.edu"
                          className="input-isro text-xs flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.childUrl) {
                              autoExtractFromUrl(formData.childUrl, false);
                            } else {
                              alert('Please enter a URL first.');
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 hover:bg-[#00E5FF]/20 text-xs font-bold shrink-0 flex items-center gap-1"
                          title="Auto fill all remaining fields from this URL"
                        >
                          <Wand2 className="w-3.5 h-3.5" /> Auto-Fill
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-rajdhani font-bold text-slate-300 block mb-1">
                        Satellite Station ID
                      </label>
                      <input
                        type="text"
                        value={formData.satelliteId}
                        onChange={e => setFormData({ ...formData, satelliteId: e.target.value })}
                        placeholder="e.g. Satellite_1201"
                        className="input-isro text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-rajdhani font-bold text-slate-300 block mb-1">
                        College / School / University Name
                      </label>
                      <input
                        type="text"
                        value={formData.collegeName}
                        onChange={e => setFormData({ ...formData, collegeName: e.target.value })}
                        placeholder="e.g. Pune Institute of Technology"
                        className="input-isro text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-rajdhani font-bold text-slate-300 block mb-1">
                        Principal / Director Name
                      </label>
                      <input
                        type="text"
                        value={formData.principalName}
                        onChange={e => setFormData({ ...formData, principalName: e.target.value })}
                        placeholder="e.g. Dr. S. T. Gandhe"
                        className="input-isro text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-rajdhani font-bold text-slate-300 block mb-1">
                        Location / Campus Address
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Dhankawadi, Pune"
                        className="input-isro text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-rajdhani font-bold text-slate-300 block mb-1">
                        Weather Condition
                      </label>
                      <select
                        value={formData.weatherCondition}
                        onChange={e => setFormData({ ...formData, weatherCondition: e.target.value })}
                        className="select-isro text-xs"
                      >
                        <option value="Partly Cloudy">Partly Cloudy</option>
                        <option value="Light Rain">Light Rain</option>
                        <option value="Overcast">Overcast</option>
                        <option value="Passing Showers">Passing Showers</option>
                        <option value="Moderate Rain">Moderate Rain</option>
                        <option value="Light Drizzle">Light Drizzle</option>
                        <option value="Clear Sky">Clear Sky</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-rajdhani font-bold text-slate-300 block mb-1">
                        Air Quality Index (AQI)
                      </label>
                      <input
                        type="number"
                        value={formData.aqi}
                        onChange={e => setFormData({ ...formData, aqi: Number(e.target.value) })}
                        className="input-isro text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-rajdhani font-bold text-slate-300 block mb-1">
                        Initial Temperature (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.temperature}
                        onChange={e => setFormData({ ...formData, temperature: Number(e.target.value) })}
                        className="input-isro text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-rajdhani font-bold text-slate-300 block mb-1">
                        Wind Speed (km/h)
                      </label>
                      <input
                        type="number"
                        value={formData.windSpeed}
                        onChange={e => setFormData({ ...formData, windSpeed: Number(e.target.value) })}
                        className="input-isro text-xs"
                      />
                    </div>
                  </div>

                  {/* LANDLOCKED SATELLITE POSITION & GOOGLE MAPS LINK */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#060D20] to-[#040817] border border-[#00E5FF]/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#00E5FF] animate-pulse" />
                        <h4 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider">
                          Landlocked Satellite Coordinates & Google Maps Link
                        </h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
                        Stationary Landlock Mode (No Live GPS)
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-body">
                      Hardware satellites without live GPS sender capabilities rely on manual landlocking. Paste a Google Maps link or enter exact latitude/longitude to anchor this satellite node.
                    </p>

                    {/* Coordinate Parser Box */}
                    <div className="space-y-1.5 bg-black/40 p-3 rounded-lg border border-white/5">
                      <label className="text-xs font-rajdhani font-bold text-slate-300 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-[#00E5FF]" /> Paste Google Maps Link or Coordinate Pair:
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">e.g. 18.52043, 73.85674 or maps link</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.mapLinkOrCoordInput || ''}
                          onChange={e => setFormData({ ...formData, mapLinkOrCoordInput: e.target.value })}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const res = parseLocationCoordinates(formData.mapLinkOrCoordInput || '');
                              if (res.success) {
                                setFormData({
                                  ...formData,
                                  lat: res.lat ?? formData.lat,
                                  lng: res.lng ?? formData.lng,
                                  googleMapsUrl: res.googleMapsUrl || formData.googleMapsUrl
                                });
                                setLocationParseMsg({ text: res.message || 'Coordinates parsed successfully!', success: true });
                              } else {
                                setLocationParseMsg({ text: res.message || 'Unable to parse location coordinates.', success: false });
                              }
                            }
                          }}
                          placeholder="Paste Google Maps URL or lat, lng (e.g. 18.52043, 73.85674)"
                          className="input-isro text-xs flex-1 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const res = parseLocationCoordinates(formData.mapLinkOrCoordInput || '');
                            if (res.success) {
                              setFormData({
                                ...formData,
                                lat: res.lat ?? formData.lat,
                                lng: res.lng ?? formData.lng,
                                googleMapsUrl: res.googleMapsUrl || formData.googleMapsUrl
                              });
                              setLocationParseMsg({ text: res.message || 'Coordinates parsed successfully!', success: true });
                            } else {
                              setLocationParseMsg({ text: res.message || 'Unable to parse location coordinates.', success: false });
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF] hover:bg-[#00E5FF]/30 border border-[#00E5FF]/40 text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all"
                        >
                          <Compass className="w-3.5 h-3.5" /> Parse & Apply
                        </button>
                      </div>

                      {locationParseMsg && (
                        <p className={`text-[11px] font-mono mt-1 ${locationParseMsg.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {locationParseMsg.text}
                        </p>
                      )}
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs">
                      <span className="text-slate-400 font-mono text-[10px]">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            lat: 18.5204,
                            lng: 73.8567,
                            googleMapsUrl: 'https://www.google.com/maps?q=18.5204,73.8567',
                            location: formData.location || 'Shivajinagar, Pune'
                          });
                          setLocationParseMsg({ text: 'Applied Pune Base (18.5204° N, 73.8567° E)', success: true });
                        }}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] font-mono transition-all"
                      >
                        📍 Pune (18.5204, 73.8567)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            lat: 12.9716,
                            lng: 77.5946,
                            googleMapsUrl: 'https://www.google.com/maps?q=12.9716,77.5946',
                            location: formData.location || 'Bengaluru, Karnataka'
                          });
                          setLocationParseMsg({ text: 'Applied Bengaluru Center (12.9716° N, 77.5946° E)', success: true });
                        }}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] font-mono transition-all"
                      >
                        📍 Bengaluru (12.9716, 77.5946)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            lat: 19.0760,
                            lng: 72.8777,
                            googleMapsUrl: 'https://www.google.com/maps?q=19.0760,72.8777',
                            location: formData.location || 'Mumbai, Maharashtra'
                          });
                          setLocationParseMsg({ text: 'Applied Mumbai Lab (19.0760° N, 72.8777° E)', success: true });
                        }}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] font-mono transition-all"
                      >
                        📍 Mumbai (19.0760, 72.8777)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            lat: 28.6139,
                            lng: 77.2090,
                            googleMapsUrl: 'https://www.google.com/maps?q=28.6139,77.2090',
                            location: formData.location || 'New Delhi, Delhi'
                          });
                          setLocationParseMsg({ text: 'Applied Delhi Base (28.6139° N, 77.2090° E)', success: true });
                        }}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] font-mono transition-all"
                      >
                        📍 New Delhi (28.6139, 77.2090)
                      </button>
                    </div>

                    {/* Numeric Coordinate & Link Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="text-xs font-rajdhani font-bold text-slate-300 block mb-1">
                          Latitude (°N)
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={formData.lat ?? 18.5204}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            setFormData({
                              ...formData,
                              lat: isNaN(val) ? 0 : val,
                              googleMapsUrl: `https://www.google.com/maps?q=${isNaN(val) ? 0 : val},${formData.lng ?? 73.8567}`
                            });
                          }}
                          className="input-isro text-xs font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-rajdhani font-bold text-slate-300 block mb-1">
                          Longitude (°E)
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={formData.lng ?? 73.8567}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            setFormData({
                              ...formData,
                              lng: isNaN(val) ? 0 : val,
                              googleMapsUrl: `https://www.google.com/maps?q=${formData.lat ?? 18.5204},${isNaN(val) ? 0 : val}`
                            });
                          }}
                          className="input-isro text-xs font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-rajdhani font-bold text-slate-300 block mb-1">
                          Google Maps URL
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={formData.googleMapsUrl || `https://www.google.com/maps?q=${formData.lat ?? 18.5204},${formData.lng ?? 73.8567}`}
                            onChange={e => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                            placeholder="https://www.google.com/maps?q=..."
                            className="input-isro text-xs font-mono flex-1"
                          />
                          {formData.googleMapsUrl && (
                            <a
                              href={formatExternalUrl(formData.googleMapsUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold flex items-center justify-center shrink-0"
                              title="Verify on Google Maps"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-isro text-xs py-2.5 px-6 font-bold"
                  >
                    Register Child Website & Add Station Node
                  </button>
                </form>
              </div>
            )}

            {/* TAB: Manage Fleet */}
            {activeTab === 'manage' && (
              <div className="space-y-4">
                <h3 className="font-orbitron font-bold text-sm text-[#00E5FF] uppercase">
                  Ground Station Fleet Table ({satellites.length} Entries)
                </h3>

                <div className="max-h-80 overflow-y-auto border border-white/10 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#09122C] text-slate-400 font-rajdhani font-bold sticky top-0">
                      <tr>
                        <th className="p-2.5">ID</th>
                        <th className="p-2.5">Institution</th>
                        <th className="p-2.5">Principal</th>
                        <th className="p-2.5">Location</th>
                        <th className="p-2.5">Landlocked Map / Coords</th>
                        <th className="p-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {satellites.slice(0, 80).map(node => (
                        <tr key={node.satelliteId} className="hover:bg-white/5">
                          <td className="p-2.5 font-orbitron font-bold text-[#FF9933]">
                            {node.satelliteId}
                          </td>
                          <td className="p-2.5 text-white font-bold max-w-xs truncate">
                            {editingId === node.satelliteId ? (
                              <input
                                type="text"
                                value={editForm?.collegeName || ''}
                                onChange={e => setEditForm(editForm ? { ...editForm, collegeName: e.target.value } : null)}
                                className="input-isro text-xs py-1"
                              />
                            ) : (
                              node.collegeName
                            )}
                          </td>
                          <td className="p-2.5 text-slate-300">
                            {editingId === node.satelliteId ? (
                              <input
                                type="text"
                                value={editForm?.principalName || ''}
                                onChange={e => setEditForm(editForm ? { ...editForm, principalName: e.target.value } : null)}
                                className="input-isro text-xs py-1"
                              />
                            ) : (
                              node.principalName
                            )}
                          </td>
                          <td className="p-2.5 text-slate-400">
                            {editingId === node.satelliteId ? (
                              <input
                                type="text"
                                value={editForm?.location || ''}
                                onChange={e => setEditForm(editForm ? { ...editForm, location: e.target.value } : null)}
                                className="input-isro text-xs py-1"
                              />
                            ) : (
                              node.location
                            )}
                          </td>
                          <td className="p-2.5">
                            {editingId === node.satelliteId ? (
                              <div className="space-y-1 min-w-[200px]">
                                <div className="flex gap-1">
                                  <input
                                    type="number"
                                    step="0.000001"
                                    placeholder="Lat"
                                    value={editForm?.lat ?? ''}
                                    onChange={e => {
                                      const val = parseFloat(e.target.value);
                                      setEditForm(editForm ? { 
                                        ...editForm, 
                                        lat: isNaN(val) ? 0 : val,
                                        googleMapsUrl: `https://www.google.com/maps?q=${isNaN(val) ? 0 : val},${editForm.lng || 0}`
                                      } : null);
                                    }}
                                    className="input-isro text-[10px] py-0.5 px-1.5 font-mono w-24"
                                    title="Latitude"
                                  />
                                  <input
                                    type="number"
                                    step="0.000001"
                                    placeholder="Lng"
                                    value={editForm?.lng ?? ''}
                                    onChange={e => {
                                      const val = parseFloat(e.target.value);
                                      setEditForm(editForm ? { 
                                        ...editForm, 
                                        lng: isNaN(val) ? 0 : val,
                                        googleMapsUrl: `https://www.google.com/maps?q=${editForm.lat || 0},${isNaN(val) ? 0 : val}`
                                      } : null);
                                    }}
                                    className="input-isro text-[10px] py-0.5 px-1.5 font-mono w-24"
                                    title="Longitude"
                                  />
                                </div>
                                <input
                                  type="text"
                                  placeholder="Google Maps URL"
                                  value={editForm?.googleMapsUrl ?? ''}
                                  onChange={e => setEditForm(editForm ? { ...editForm, googleMapsUrl: e.target.value } : null)}
                                  className="input-isro text-[10px] py-0.5 px-1.5 font-mono w-full"
                                  title="Google Maps URL"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {typeof node.lat === 'number' && typeof node.lng === 'number' ? (
                                  <span className="font-mono text-[11px] text-[#00E5FF] flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-[#00E5FF]/20">
                                    <MapPin className="w-3 h-3 text-[#00E5FF]" />
                                    {node.lat.toFixed(4)}°, {node.lng.toFixed(4)}°
                                  </span>
                                ) : (
                                  <span className="text-slate-500 italic text-[10px]">Unanchored</span>
                                )}
                                <a
                                  href={formatExternalUrl(node.googleMapsUrl || `https://www.google.com/maps?q=${node.lat || 18.5204},${node.lng || 73.8567}`)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition-all"
                                  title="Open Satellite Location in Google Maps"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </td>
                          <td className="p-2.5 text-right space-x-2">
                            {editingId === node.satelliteId ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={handleSaveEdit}
                                  className="px-2 py-1 bg-emerald-500 text-slate-900 font-bold rounded text-[10px] hover:bg-emerald-400 transition-all"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditForm(null);
                                  }}
                                  className="px-2 py-1 bg-slate-700 text-slate-200 font-bold rounded text-[10px] hover:bg-slate-600 transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleStartEdit(node)}
                                className="p-1 text-[#00E5FF] hover:bg-[#00E5FF]/20 rounded transition-all"
                                title="Edit Node (Webpublisher Full Rights)"
                              >
                                <PenLine className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {editingId !== node.satelliteId && (
                              <button
                                onClick={() => handleDelete(node.satelliteId)}
                                className="p-1 text-rose-400 hover:bg-rose-500/20 rounded"
                                title="Delete Node"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: Audit Logs */}
            {activeTab === 'logs' && (
              <div className="space-y-3">
                <h3 className="font-orbitron font-bold text-sm text-[#00E5FF] uppercase">
                  ISRO System Action Log
                </h3>
                <div className="p-4 rounded-xl bg-[#060B1A] border border-white/10 max-h-60 overflow-y-auto space-y-2 text-xs font-mono">
                  {auditLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 border-b border-white/5 pb-1.5">
                      <span className="text-slate-500">[{log.time}]</span>
                      <span className="text-slate-200">{log.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Password Authentication Form for Webpublisher */
          <form onSubmit={handleLogin} className="space-y-5 py-4 max-w-md mx-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#FF9933]/15 border border-[#FF9933]/40 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6 text-[#FF9933] animate-pulse" />
              </div>
              <h3 className="font-orbitron font-bold text-lg text-white">
                Webpublisher Authentication
              </h3>
              <p className="text-xs text-slate-400 font-rajdhani">
                Administrator credentials are required for publisher access.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-rajdhani font-bold text-slate-300 uppercase tracking-wider block">
                Administrator Username
              </label>
              <input
                type="text"
                value={adminUsername}
                onChange={e => setAdminUsername(e.target.value)}
                placeholder="Enter administrator username"
                className="input-isro text-sm"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-rajdhani font-bold text-slate-300 uppercase tracking-wider block">
                Administrator Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="Enter administrator password"
                  className="input-isro pl-10 text-sm"
                  autoFocus
                />
              </div>
              {authError && (
                <p className="text-xs text-rose-400 font-semibold flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {authError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-isro w-full justify-center text-sm py-3"
            >
              Authenticate as Master Webpublisher
            </button>

            {/* Student Switcher Banner */}
            <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-400/30 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-sky-300 font-rajdhani">
                <Rocket className="w-4 h-4 text-sky-400" />
                <span>Are you a Student or College Team?</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-rajdhani">
                Students do not need the master publisher password! Switch to the <strong>Student CanSat Portal</strong> to register your station and manage strictly your own module.
              </p>
              <button
                type="button"
                onClick={() => setPortalSide('student')}
                className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs font-rajdhani transition-all flex items-center justify-center gap-1.5 mx-auto"
              >
                <span>Switch to Student CanSat Portal</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
