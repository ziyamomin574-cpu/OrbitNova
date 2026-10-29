import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard,
  Activity,
  Search, 
  Map, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ShieldCheck, 
  Lock,
  LogOut,
  Radio,
  Satellite
} from 'lucide-react';
import { IndoScienceLogo } from './IndoScienceLogo';
import { SparkLogo } from './SparkLogo';
import { IsroLogo } from './IsroLogo';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLiveStream: boolean;
  toggleLiveStream: () => void;
  totalSatellites: number;
  openAdminModal: () => void;
  isAdminLoggedIn: boolean;
  onLogoutAdmin?: () => void;
  onlyRegistered?: boolean;
  toggleOnlyRegistered?: () => void;
  registeredCount?: number;
  theme?: 'dark' | 'light';
  toggleTheme?: () => void;
  onOpenPortalView?: (view: 'school-login' | 'student-login' | 'admin-login') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isLiveStream,
  toggleLiveStream,
  totalSatellites,
  openAdminModal,
  isAdminLoggedIn,
  onLogoutAdmin,
  theme = 'dark',
  toggleTheme,
  onOpenPortalView
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const loginMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (loginMenuRef.current && !loginMenuRef.current.contains(event.target as Node)) {
        setLoginMenuOpen(false);
      }
    };
    if (loginMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [loginMenuOpen]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleSelectLoginOption = (view: 'school-login' | 'student-login' | 'admin-login') => {
    setLoginMenuOpen(false);
    setMobileMenuOpen(false);

    if (view === 'school-login') {
      setActiveTab('school-login');
      try { window.history.pushState({}, '', '/login/school'); } catch {}
    } else if (view === 'student-login') {
      setActiveTab('student-login');
      try { window.history.pushState({}, '', '/login/student'); } catch {}
    } else if (view === 'admin-login') {
      setActiveTab('admin-login');
      try { window.history.pushState({}, '', '/admin-login'); } catch {}
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#070d24] border-b-2 border-slate-200 dark:border-blue-900 px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-md transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
        {/* Top Tier: Logos, Project Antriksha Branding, Actions */}
        <div className="flex items-center justify-between gap-3 select-none">
          {/* Official Logos Container */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Indo Science Education Trust Logo */}
            <a
              href="https://indo-science.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              title="Visit Indo Science (indo-science.vercel.app)"
              className="bg-white p-1 md:p-1.5 rounded-xl border-2 border-slate-300 dark:border-blue-800 shadow-xs hover:scale-105 transition-transform flex items-center justify-center cursor-pointer shrink-0"
            >
              <IndoScienceLogo size="sm" showSubtext={true} />
            </a>

            {/* SPARK India Program Portal Logo */}
            <a
              href="https://indo-science.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              title="Visit SPARK India Program Portal (indo-science.vercel.app)"
              className="bg-white p-1 md:p-1.5 rounded-xl border-2 border-slate-300 dark:border-blue-800 shadow-xs hover:scale-105 transition-transform flex items-center justify-center cursor-pointer shrink-0"
            >
              <SparkLogo size="sm" showSubtitle={true} />
            </a>

            {/* ISRO Official Emblem */}
            <a
              href="https://www.isro.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              title="Visit ISRO Official Website (isro.gov.in)"
              className="bg-white p-1 md:p-1.5 rounded-xl border-2 border-slate-300 dark:border-blue-800 shadow-xs hover:scale-105 transition-transform inline-flex items-center shrink-0"
            >
              <IsroLogo size="sm" variant="full" />
            </a>
          </div>

          {/* Project Antriksha Title & Subtitle */}
          <div 
            className="flex-1 flex flex-col items-center sm:items-start pl-1 sm:pl-3 cursor-pointer group"
            onClick={() => handleTabClick('dashboard')}
          >
            <h1 className="font-orbitron font-black text-lg sm:text-2xl md:text-3xl lg:text-4xl text-slate-900 dark:text-white tracking-wider group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-none uppercase">
              PROJECT ANTRIKSHA{' '}
              <span className="text-amber-600 dark:text-[#FF9933] font-black tracking-normal">
                अंतरिक्ष
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-300 font-rajdhani font-bold tracking-wide mt-0.5">
              ISRO IndoSpark Student Micro-Satellite Telemetry Network
            </p>
          </div>

          {/* Top Right Actions: Login Dropdown, Separate Antriksha Admin Button, Theme Toggle, Mobile Menu Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Separate Antriksha Admin Panel Button */}
            <button
              type="button"
              onClick={openAdminModal}
              className="px-3 sm:px-3.5 py-1.5 rounded-xl border-2 border-amber-500/80 bg-amber-500/10 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 text-xs sm:text-sm font-rajdhani font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs min-h-[36px]"
              title="Open Antriksha Satellite Admin Panel (Separate)"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Antriksha Admin</span>
            </button>

            {/* Login Menu Dropdown (matching pd.indoscience.in) */}
            <div className="relative" ref={loginMenuRef}>
              <button
                type="button"
                onClick={() => setLoginMenuOpen(!loginMenuOpen)}
                className={`px-3.5 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs min-h-[36px] flex items-center gap-1.5 ${
                  isAdminLoggedIn
                    ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold'
                    : 'bg-white hover:bg-slate-50 dark:bg-[#111e48] dark:hover:bg-[#182963] border-slate-300 dark:border-blue-800 text-slate-800 dark:text-slate-100 hover:border-slate-400 dark:hover:border-blue-700'
                }`}
                aria-expanded={loginMenuOpen}
                aria-haspopup="true"
                title="Login to IndoScience Portals"
              >
                {isAdminLoggedIn ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-950 dark:text-emerald-900" />
                    <span>Admin Active</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>

              {/* Dropdown Menu Options matching user screenshot & pd.indoscience.in */}
              {loginMenuOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#0c1533] border border-slate-200 dark:border-blue-900/80 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/60 p-2 z-[100] flex flex-col gap-1 transition-all"
                  role="menu"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleSelectLoginOption('school-login')}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>🏫 School Login</span>
                    <span className="text-[10px] text-slate-400 font-mono">pd</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleSelectLoginOption('student-login')}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-blue-900/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>🎓 Student Login</span>
                    <span className="text-[10px] text-slate-400 font-mono">pd</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleSelectLoginOption('admin-login')}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-blue-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>🛡️ IndoScience Admin</span>
                    <span className="text-[10px] text-slate-400 font-mono">pd</span>
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-blue-900/60" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setLoginMenuOpen(false);
                      openAdminModal();
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>🛰️ Antriksha Admin Panel</span>
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </button>

                  {isAdminLoggedIn && (
                    <>
                      <div className="my-1 border-t border-slate-100 dark:border-blue-900/60" />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setLoginMenuOpen(false);
                          openAdminModal();
                        }}
                        className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <span>Open Admin Panel</span>
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>
                      {onLogoutAdmin && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setLoginMenuOpen(false);
                            onLogoutAdmin();
                          }}
                          className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer flex items-center justify-between"
                        >
                          <span>Sign Out</span>
                          <LogOut className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle (Light / Dark) */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 sm:px-2.5 sm:py-2 rounded-xl border border-slate-300 dark:border-blue-800 bg-white hover:bg-slate-50 dark:bg-[#111e48] dark:hover:bg-[#182963] text-slate-800 dark:text-slate-100 min-h-[36px] min-w-[36px] flex items-center justify-center shadow-xs cursor-pointer shrink-0 transition-all"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-[#FF9933] shrink-0" />
                ) : (
                  <Moon className="w-4 h-4 text-sky-600 shrink-0" />
                )}
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white dark:bg-[#111e48] border border-slate-300 dark:border-blue-800 text-slate-800 dark:text-white transition-all min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer shadow-xs shrink-0"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Tier 2 (Desktop): Main Navigation & Live Status Feed */}
        <div className="hidden lg:flex items-center justify-between pt-1 border-t border-slate-200 dark:border-blue-900/60">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => handleTabClick('dashboard')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs sm:text-sm font-rajdhani font-black transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md border-2 border-amber-600 font-black scale-105'
                  : 'bg-slate-100 dark:bg-[#111e48] text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#192b66] border-2 border-slate-300 dark:border-blue-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-950 dark:text-white" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => handleTabClick('explorer')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs sm:text-sm font-rajdhani font-black transition-all ${
                activeTab === 'explorer'
                  ? 'bg-blue-600 text-white shadow-md border-2 border-blue-700 font-black scale-105'
                  : 'bg-slate-100 dark:bg-[#111e48] text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#192b66] border-2 border-slate-300 dark:border-blue-800'
              }`}
            >
              <Search className="w-4 h-4 shrink-0" />
              <span>Satellites Directory ({totalSatellites})</span>
            </button>

            <button
              onClick={() => handleTabClick('map')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs sm:text-sm font-rajdhani font-black transition-all ${
                activeTab === 'map'
                  ? 'bg-emerald-600 text-white shadow-md border-2 border-emerald-700 font-black scale-105'
                  : 'bg-slate-100 dark:bg-[#111e48] text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#192b66] border-2 border-slate-300 dark:border-blue-800'
              }`}
            >
              <Map className="w-4 h-4 shrink-0" />
              <span>Orbital Radar Map</span>
            </button>
          </nav>

          {/* Right Live Status Badge */}
          <div className="flex items-center gap-2 text-xs font-rajdhani font-bold text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Ground Feed Active</span>
            </span>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t-2 border-slate-300 dark:border-blue-900 flex flex-col space-y-2 bg-white dark:bg-[#070d24] p-3 rounded-2xl border-2 border-slate-300 dark:border-blue-900 shadow-xl">
            <button
              onClick={() => handleTabClick('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-rajdhani font-black transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 border-2 border-amber-600 shadow-sm'
                  : 'bg-slate-100 dark:bg-[#111e48] text-slate-900 dark:text-white border border-slate-200 dark:border-blue-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => handleTabClick('explorer')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-rajdhani font-black transition-all ${
                activeTab === 'explorer'
                  ? 'bg-blue-600 text-white border-2 border-blue-700 shadow-sm'
                  : 'bg-slate-100 dark:bg-[#111e48] text-slate-900 dark:text-white border border-slate-200 dark:border-blue-800'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Satellite Directory ({totalSatellites})</span>
            </button>

            <button
              onClick={() => handleTabClick('map')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-rajdhani font-black transition-all ${
                activeTab === 'map'
                  ? 'bg-emerald-600 text-white border-2 border-emerald-700 shadow-sm'
                  : 'bg-slate-100 dark:bg-[#111e48] text-slate-900 dark:text-white border border-slate-200 dark:border-blue-800'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Orbital Radar Map</span>
            </button>

            <div className="pt-2 border-t border-slate-200 dark:border-blue-900 flex flex-col gap-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                Portals & Login
              </div>
              <button
                type="button"
                onClick={() => handleSelectLoginOption('school-login')}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-rajdhani font-black text-sm"
              >
                <span>School Login</span>
                <span>🏫</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectLoginOption('student-login')}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-rajdhani font-black text-sm"
              >
                <span>Student Login</span>
                <span>🎓</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectLoginOption('admin-login')}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-rajdhani font-black text-sm"
              >
                <span>IndoScience Admin</span>
                <span>🛡️</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAdminModal();
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-2 border-amber-500 font-rajdhani font-black text-sm"
              >
                <span>🛰️ Antriksha Admin Panel</span>
                <ShieldCheck className="w-4 h-4" />
              </button>

              {isAdminLoggedIn && onLogoutAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogoutAdmin();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-rajdhani font-black text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Admin</span>
                </button>
              )}

              {toggleTheme && (
                <button
                  onClick={() => {
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-[#111e48] border border-slate-300 dark:border-blue-800 text-slate-900 dark:text-slate-100 font-rajdhani font-black text-xs"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-[#FF9933]" />
                  ) : (
                    <Moon className="w-4 h-4 text-sky-600" />
                  )}
                  <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
