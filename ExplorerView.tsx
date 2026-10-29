import React, { useState, useMemo } from 'react';
import { SatelliteNode } from '../types';
import { Search, Grid3x3, List, RefreshCw, Satellite, MapPin, UserCheck, ChevronLeft, ChevronRight, Globe, ExternalLink, Thermometer, Droplets } from 'lucide-react';
import { isValidChildUrl, formatExternalUrl } from '../utils/urlHelper';

interface ExplorerViewProps {
  satellites: SatelliteNode[];
  onSelectSatellite: (sat: SatelliteNode) => void;
  onNavigateToChildSite?: (satelliteId: string) => void;
  isLiveStream: boolean;
  onlyRegistered?: boolean;
  toggleOnlyRegistered?: () => void;
  registeredCount?: number;
  totalCountAll?: number;
  theme?: 'dark' | 'light';
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  satellites,
  onSelectSatellite,
  onNavigateToChildSite,
  isLiveStream,
  onlyRegistered = false,
  toggleOnlyRegistered,
  registeredCount = 0,
  totalCountAll = 0,
  theme = 'dark'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherFilter, setWeatherFilter] = useState('ALL');
  const [humidityFilter, setHumidityFilter] = useState('ALL');
  const [childSiteFilter, setChildSiteFilter] = useState('ALL');
  const [sortOption, setSortOption] = useState('id-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);

  const handleOpenChildSite = (satId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onNavigateToChildSite) {
      onNavigateToChildSite(satId);
    } else {
      try {
        window.history.pushState({}, '', `/site/${encodeURIComponent(satId)}`);
      } catch (err) {
        console.warn('pushState error:', err);
      }
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const weatherOptions = [
    'ALL',
    'Partly Cloudy',
    'Light Rain',
    'Overcast',
    'Passing Showers',
    'Moderate Rain',
    'Light Drizzle',
    'Clear Sky'
  ];

  const filteredSatellites = useMemo(() => {
    return satellites
      .filter(s => {
        const q = searchQuery.toLowerCase().trim();
        const matchSearch =
          !q ||
          s.satelliteId.toLowerCase().includes(q) ||
          s.collegeName.toLowerCase().includes(q) ||
          (s.studentName && s.studentName.toLowerCase().includes(q)) ||
          (s.teacherName && s.teacherName.toLowerCase().includes(q)) ||
          (s.appsScriptUrl && s.appsScriptUrl.toLowerCase().includes(q)) ||
          s.location.toLowerCase().includes(q) ||
          s.principalName.toLowerCase().includes(q) ||
          s.weatherCondition.toLowerCase().includes(q);

        const matchWeather = weatherFilter === 'ALL' || s.weatherCondition === weatherFilter;

        let matchHumidity = true;
        const satHum = s.humidity ?? 78;
        if (humidityFilter === 'HIGH') matchHumidity = satHum >= 75;
        if (humidityFilter === 'MODERATE') matchHumidity = satHum < 75;

        let matchChild = true;
        if (childSiteFilter === 'REGISTERED') matchChild = !!s.url || !!s.isCustom;
        if (childSiteFilter === 'UNREGISTERED') matchChild = !s.url && !s.isCustom;

        return matchSearch && matchWeather && matchHumidity && matchChild;
      })
      .sort((a, b) => {
        if (sortOption === 'id-asc') return a.id - b.id;
        if (sortOption === 'id-desc') return b.id - a.id;
        if (sortOption === 'temp-desc') return b.temperature - a.temperature;
        if (sortOption === 'humidity-desc') return (b.humidity ?? 78) - (a.humidity ?? 78);
        if (sortOption === 'name-asc') return a.collegeName.localeCompare(b.collegeName);
        return 0;
      });
  }, [satellites, searchQuery, weatherFilter, humidityFilter, childSiteFilter, sortOption]);

  const totalPages = Math.ceil(filteredSatellites.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSatellites.slice(start, start + itemsPerPage);
  }, [filteredSatellites, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6 pb-12">
      {/* Control Panel */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Institution Name, Satellite ID, Student, Teacher, Principal, or Location..."
              className="input-isro pl-11 py-3 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 justify-between lg:justify-end">
            <div className="flex items-center gap-1 bg-[#09122C] p-1 rounded-lg border border-[#00E5FF]/20">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid' ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'table' ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <select
              value={itemsPerPage}
              onChange={e => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="select-isro text-xs w-auto py-2.5 px-3"
            >
              <option value={12}>12 Per Page</option>
              <option value={24}>24 Per Page</option>
              <option value={48}>48 Per Page</option>
              <option value={100}>100 Per Page</option>
            </select>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-[#00E5FF]/10">
          <div>
            <label className="text-[11px] font-rajdhani font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Station Type
            </label>
            <select
              value={childSiteFilter}
              onChange={e => {
                setChildSiteFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="select-isro text-xs"
            >
              <option value="ALL">All Satellite Nodes</option>
              <option value="REGISTERED">Registered Ground Stations</option>
              <option value="UNREGISTERED">Standard Seed Nodes</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-rajdhani font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Weather Condition
            </label>
            <select
              value={weatherFilter}
              onChange={e => {
                setWeatherFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="select-isro text-xs"
            >
              {weatherOptions.map(opt => (
                <option key={opt} value={opt}>
                  {opt === 'ALL' ? 'All Weather Types' : opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-rajdhani font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Relative Humidity
            </label>
            <select
              value={humidityFilter}
              onChange={e => {
                setHumidityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="select-isro text-xs"
            >
              <option value="ALL">All Humidity Levels</option>
              <option value="HIGH">High Humidity (≥ 75%)</option>
              <option value="MODERATE">Moderate (&lt; 75%)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-rajdhani font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Sort Telemetry
            </label>
            <select
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
              className="select-isro text-xs"
            >
              <option value="id-asc">Satellite ID (Ascending)</option>
              <option value="id-desc">Satellite ID (Descending)</option>
              <option value="temp-desc">Highest Temperature</option>
              <option value="humidity-desc">Highest Humidity</option>
              <option value="name-asc">Institution Name (A-Z)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setWeatherFilter('ALL');
                setHumidityFilter('ALL');
                setChildSiteFilter('ALL');
                setSortOption('id-asc');
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-rajdhani font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Sub-header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-slate-400 font-rajdhani font-semibold">
          Showing <span className="text-[#00E5FF] font-bold">{filteredSatellites.length}</span> matching satellites (Page {currentPage} of {totalPages})
        </p>
        {isLiveStream && (
          <span className="text-xs text-[#00E676] font-rajdhani font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-ping" />
            Live Sensors Streaming
          </span>
        )}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        paginatedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {paginatedItems.map(sat => (
              <div
                key={sat.satelliteId}
                onClick={() => onSelectSatellite(sat)}
                className="glass-panel p-5 flex flex-col justify-between space-y-4 hover:border-[#00E5FF]/60 cursor-pointer group transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Satellite className="w-4 h-4 text-[#FF9933] group-hover:rotate-12 transition-transform" />
                      <span className="font-orbitron font-bold text-sm text-[#FF9933]">
                        {sat.satelliteId}
                      </span>
                    </div>
                    <span className="text-[10px] font-rajdhani font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-[#00E5FF] border border-sky-500/30">
                      Humidity {sat.humidity !== undefined ? `${sat.humidity}%` : '78%'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-rajdhani font-bold text-base text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-[#00E5FF] transition-colors line-clamp-2 leading-tight">
                      {sat.collegeName}
                    </h3>
                    <div className="flex items-center justify-between flex-wrap gap-1 mt-1">
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-body flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-[#00E5FF]" /> {sat.location}
                      </p>
                      {typeof sat.lat === 'number' && typeof sat.lng === 'number' && (
                        <a
                          href={formatExternalUrl(sat.googleMapsUrl || `https://www.google.com/maps?q=${sat.lat},${sat.lng}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                          title={`Open ${sat.collegeName} in Google Maps (${sat.lat}°, ${sat.lng}°)`}
                        >
                          Maps ↗
                        </a>
                      )}
                    </div>
                    
                    {/* Registered Child Website or Generated Portal Link */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={(e) => handleOpenChildSite(sat.satelliteId, e)}
                        className="text-xs text-sky-600 dark:text-[#00E5FF] hover:underline font-rajdhani font-bold flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-none p-0"
                        title={`Open academic child station portal for ${sat.collegeName}`}
                      >
                        <Globe className="w-3.5 h-3.5" /> Visit Child Site
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </button>
                      {isValidChildUrl(sat.url || sat.childWebsiteUrl) && (
                        <a
                          href={formatExternalUrl(sat.url || sat.childWebsiteUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-600 dark:text-sky-300 hover:bg-sky-500/25 border border-sky-400/30 transition-colors inline-flex items-center gap-0.5"
                          title={`Direct external URL: ${formatExternalUrl(sat.url || sat.childWebsiteUrl)}`}
                        >
                          Ext ↗
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-[#070D22]/80 border border-slate-200 dark:border-white/5 space-y-1.5 text-xs text-slate-800 dark:text-slate-300">
                    {sat.studentName && (
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200/60 dark:border-white/5">
                        <span className="text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-1">
                          👩‍🎓 Student:
                        </span>
                        <div className="flex items-center gap-1.5">
                          {sat.studentPhoto && (
                            <img
                              src={sat.studentPhoto}
                              alt={sat.studentName}
                              className="w-5 h-5 rounded-full object-cover border border-cyan-400/50"
                            />
                          )}
                          <span className="font-bold line-clamp-1 text-right text-slate-900 dark:text-white">{sat.studentName}</span>
                        </div>
                      </div>
                    )}
                    {sat.teacherName && (
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200/60 dark:border-white/5">
                        <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                          👨‍🏫 Teacher:
                        </span>
                        <span className="font-semibold line-clamp-1 text-right text-slate-900 dark:text-white">{sat.teacherName}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-[#FF9933]" /> Principal:
                      </span>
                      <span className="font-semibold line-clamp-1 text-right text-slate-900 dark:text-white">{sat.principalName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Weather:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-200">{sat.weatherCondition}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-[#00E676]">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span className="font-orbitron font-semibold">{sat.temperature}°C</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sky-600 dark:text-[#00E5FF]">
                    <Droplets className="w-3.5 h-3.5" />
                    <span className="font-orbitron font-semibold">{sat.humidity !== undefined ? `${sat.humidity}%` : '78%'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center space-y-3">
            <Satellite className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="font-orbitron font-bold text-lg text-white">No Satellites Found</h3>
            <p className="text-xs text-slate-400 font-body max-w-md mx-auto">
              No satellite nodes are currently registered in the telemetry list. You can add satellites manually via the Admin Panel in the top bar.
            </p>
          </div>
        )
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="glass-panel overflow-hidden rounded-xl border border-[#00E5FF]/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#09122C] text-slate-300 font-rajdhani font-bold uppercase text-[11px] border-b border-[#00E5FF]/20">
                  <th className="p-3.5">Satellite ID</th>
                  <th className="p-3.5">Institution / School / College</th>
                  <th className="p-3.5">Principal Name</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Child Site</th>
                  <th className="p-3.5">Weather</th>
                  <th className="p-3.5">Temp (°C)</th>
                  <th className="p-3.5">Humidity (RH)</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {paginatedItems.map(sat => (
                  <tr
                    key={sat.satelliteId}
                    onClick={() => onSelectSatellite(sat)}
                    className="hover:bg-[#0E1A3D]/70 transition-colors cursor-pointer"
                  >
                    <td className="p-3.5 font-orbitron font-bold text-[#FF9933]">
                      {sat.satelliteId}
                    </td>
                    <td className="p-3.5 font-rajdhani font-bold text-white max-w-xs">
                      {sat.collegeName}
                    </td>
                    <td className="p-3.5 text-slate-300">{sat.principalName}</td>
                    <td className="p-3.5 text-slate-400">
                      <div>{sat.location}</div>
                      {typeof sat.lat === 'number' && typeof sat.lng === 'number' && (
                        <a
                          href={formatExternalUrl(sat.googleMapsUrl || `https://www.google.com/maps?q=${sat.lat},${sat.lng}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-mono text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                          title="View on Google Maps"
                        >
                          <MapPin className="w-2.5 h-2.5" />
                          {sat.lat.toFixed(2)}°, {sat.lng.toFixed(2)}°
                        </a>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={(e) => handleOpenChildSite(sat.satelliteId, e)}
                          className="text-[#00E5FF] hover:underline font-bold inline-flex items-center gap-1 text-xs cursor-pointer bg-transparent border-none p-0"
                          title={`Open academic child station portal for ${sat.collegeName}`}
                        >
                          <Globe className="w-3.5 h-3.5" /> Visit Child Site
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                        {isValidChildUrl(sat.url || sat.childWebsiteUrl) && (
                          <a
                            href={formatExternalUrl(sat.url || sat.childWebsiteUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-600 dark:text-sky-300 hover:bg-sky-500/25 border border-sky-400/30 transition-colors inline-flex items-center gap-0.5"
                            title={`Direct external URL: ${formatExternalUrl(sat.url || sat.childWebsiteUrl)}`}
                          >
                            Ext ↗
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-300">{sat.weatherCondition}</td>
                    <td className="p-3.5 font-orbitron font-semibold text-emerald-600 dark:text-[#00E676]">{sat.temperature}°C</td>
                    <td className="p-3.5 font-orbitron font-semibold text-sky-600 dark:text-[#00E5FF]">{sat.humidity !== undefined ? `${sat.humidity}%` : '78%'}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectSatellite(sat);
                        }}
                        className="text-xs text-[#00E5FF] hover:underline font-rajdhani font-bold"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4">
          <p className="text-xs text-slate-400 font-rajdhani">
            Page <span className="text-white font-bold">{currentPage}</span> of <span className="text-white font-bold">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-[#09122C] border border-white/10 disabled:opacity-40 text-slate-300 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-orbitron text-[#00E5FF] font-bold px-3">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-[#09122C] border border-white/10 disabled:opacity-40 text-slate-300 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
