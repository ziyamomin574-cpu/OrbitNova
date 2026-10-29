import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  Key, 
  Mail, 
  User, 
  Lock, 
  ExternalLink, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  School,
  Sparkles
} from 'lucide-react';

interface PortalAuthModalProps {
  onOpenISROAdmin?: () => void;
  theme?: 'dark' | 'light';
  isOpenView?: ActivePortalView;
  onCloseView?: () => void;
  showFloatingTrigger?: boolean;
}

export type ActivePortalView = 'menu' | 'school-login' | 'student-login' | 'admin-login' | 'register' | null;

export const PortalAuthModal: React.FC<PortalAuthModalProps> = ({
  onOpenISROAdmin,
  theme = 'dark',
  isOpenView,
  onCloseView,
  showFloatingTrigger = false
}) => {
  const [activeView, setActiveView] = useState<ActivePortalView>(isOpenView || null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [location, setLocation] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync with prop if passed
  useEffect(() => {
    if (isOpenView !== undefined) {
      setActiveView(isOpenView);
    }
  }, [isOpenView]);

  // Support custom window event trigger from any header button
  useEffect(() => {
    const handlePortalEvent = (e: any) => {
      if (e && e.detail && e.detail.view) {
        setActiveView(e.detail.view);
      }
    };
    window.addEventListener('antriksha:open-portal', handlePortalEvent as EventListener);
    return () => window.removeEventListener('antriksha:open-portal', handlePortalEvent as EventListener);
  }, []);

  // Sync with browser hash route (#/login?type=school, #/login?type=student, #/admin/login, #/register)
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash || '';
      if (hash.includes('/login?type=school') || hash === '#/login/school') {
        setActiveView('school-login');
      } else if (hash.includes('/login?type=student') || hash === '#/login/student') {
        setActiveView('student-login');
      } else if (hash.includes('/admin/login') || hash === '#/login/admin') {
        setActiveView('admin-login');
      } else if (hash.includes('/register')) {
        setActiveView('register');
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  const handleClose = () => {
    setActiveView(null);
    if (onCloseView) onCloseView();
    setErrorMsg('');
    setSuccessMsg('');
    if (window.location.hash.startsWith('#/login') || window.location.hash.startsWith('#/register') || window.location.hash.startsWith('#/admin')) {
      try {
        window.history.pushState(null, '', window.location.pathname);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleNavigateTo = (view: ActivePortalView, hashRoute?: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    setActiveView(view);
    if (hashRoute) {
      try {
        window.location.hash = hashRoute;
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const idClean = identifier.trim();
    if (!idClean || !password) {
      setErrorMsg(activeView === 'student-login' ? 'Please enter your username and password.' : 'Please enter your email and password.');
      return;
    }

    if (activeView === 'school-login' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(idClean)) {
      setErrorMsg('Please enter a valid school email address.');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = activeView === 'student-login'
        ? '/api/auth/student-login'
        : activeView === 'admin-login'
        ? '/api/auth/admin/login'
        : '/api/auth/login';

      const payload = activeView === 'student-login'
        ? { username: idClean.toLowerCase(), password }
        : { email: idClean.toLowerCase(), password };

      // Attempt login to local API proxy
      let res: Response | null = null;
      try {
        res = await fetch(endpoint, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch {
        throw new Error('Could not reach the authentication server. Please try again.');
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.success === false) {
          setErrorMsg(data.message || 'Authentication failed.');
        } else {
          setSuccessMsg('Authentication successful! Welcome to IndoScience Space Portal.');
          setTimeout(() => {
            handleClose();
            if (activeView === 'admin-login' && onOpenISROAdmin) {
              onOpenISROAdmin();
            }
          }, 1200);
        }
      } else {
        let errMsg = 'Unable to sign in. Please check your credentials and try again.';
        if (res) {
          try {
            const errData = await res.json();
            if (errData && errData.message) errMsg = errData.message;
          } catch {}
        }
        setErrorMsg(errMsg);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!schoolName.trim() || !identifier.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      let res: Response | null = null;
      const payload = {
        name: schoolName.trim(),
        email: identifier.trim().toLowerCase(),
        password,
        principal: principalName.trim(),
        location: location.trim()
      };

      try {
        res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch {
        res = await fetch('https://pd.indoscience.in/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res && res.ok) {
        setSuccessMsg('School registration submitted successfully! Please check your email for verification.');
        setTimeout(() => {
          handleNavigateTo('school-login', '#/login?type=school');
        }, 2000);
      } else {
        setErrorMsg('Registration request submitted. You may now sign in or verify your email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ========================================================
          QUICK ACCESS FLOATING PORTAL LOGIN BUTTON (Bottom-Right)
          ======================================================== */}
      {showFloatingTrigger && (
        <button
          id="isetPortalBtn"
          className="iset-portal-trigger-btn"
          type="button"
          onClick={() => {
            if (activeView) {
              handleClose();
            } else {
              setActiveView('menu');
            }
          }}
          aria-label="Open Portal Login Menu"
          title="Login to School, Student, or Admin Portal"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" className="w-[18px] h-[18px]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span>Portal Login</span>
        </button>
      )}

      {/* ========================================================
          ROLE-BASED PORTAL LOGIN MENU DIALOG
          ======================================================== */}
      {activeView === 'menu' && (
        <div 
          id="isetLoginModal" 
          className="iset-modal-backdrop active" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="isetModalTitle"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="iset-modal-card">
            <button 
              id="isetModalCloseBtn" 
              className="iset-modal-close-btn" 
              type="button" 
              aria-label="Close Login Menu"
              onClick={handleClose}
            >
              ✕
            </button>

            <div className="iset-modal-header">
              <span className="iset-modal-badge">IndoScience Space Portals</span>
              <h2 id="isetModalTitle" className="iset-modal-title">Select Login Portal</h2>
              <p className="iset-modal-subtitle">Choose your portal type below to access your account</p>
            </div>

            <div className="iset-login-grid">
              {/* School Login */}
              <button
                type="button"
                className="iset-login-option text-left w-full"
                onClick={() => handleNavigateTo('school-login', '#/login?type=school')}
              >
                <div className="iset-login-icon-box iset-icon-school">🏫</div>
                <div className="iset-login-text">
                  <div className="iset-login-role-title">
                    <span>School Login</span>
                    <span className="text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                      Admin & Faculty
                    </span>
                  </div>
                  <p className="iset-login-desc">
                    Manage student accounts, coordinate ground station activities, and view school satellite telemetry.
                  </p>
                </div>
                <div className="iset-login-arrow">→</div>
              </button>

              {/* Student Login */}
              <button
                type="button"
                className="iset-login-option text-left w-full"
                onClick={() => handleNavigateTo('student-login', '#/login?type=student')}
              >
                <div className="iset-login-icon-box iset-icon-student">🎓</div>
                <div className="iset-login-text">
                  <div className="iset-login-role-title">
                    <span>Student Login</span>
                    <span className="text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                      Learners
                    </span>
                  </div>
                  <p className="iset-login-desc">
                    View real-time satellite telemetry, CanSat trajectory data, mission payloads, and graphs.
                  </p>
                </div>
                <div className="iset-login-arrow">→</div>
              </button>

              {/* Admin Login */}
              <button
                type="button"
                className="iset-login-option text-left w-full"
                onClick={() => {
                  if (onOpenISROAdmin) {
                    handleClose();
                    onOpenISROAdmin();
                  } else {
                    handleNavigateTo('admin-login', '#/admin/login');
                  }
                }}
              >
                <div className="iset-login-icon-box iset-icon-admin">🛡️</div>
                <div className="iset-login-text">
                  <div className="iset-login-role-title">
                    <span>Administrator Login</span>
                    <span className="text-[11px] font-semibold bg-pink-100 dark:bg-pink-900/60 text-pink-800 dark:text-pink-200 px-2 py-0.5 rounded-full">
                      Control Center
                    </span>
                  </div>
                  <p className="iset-login-desc">
                    Platform administration, school approval, system oversight, and telemetry stream configuration.
                  </p>
                </div>
                <div className="iset-login-arrow">→</div>
              </button>
            </div>

            <div className="iset-modal-footer">
              <span>New school wanting to join?</span>
              <button
                type="button"
                onClick={() => handleNavigateTo('register', '#/register')}
                className="text-blue-600 hover:underline font-bold text-xs"
              >
                Register School Account →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          FULL-SCREEN / OVERLAY LOGIN FORM (School & Student Login)
          ======================================================== */}
      {(activeView === 'school-login' || activeView === 'student-login' || activeView === 'admin-login') && (
        <div 
          className="fixed inset-0 z-[10001] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="relative w-full max-w-[420px] bg-white dark:bg-[#0c1533] border border-slate-200 dark:border-blue-900 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-900 dark:text-white transition-all">
            {/* Top Bar with Back and Close */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-blue-900/60">
              <button
                type="button"
                onClick={() => handleNavigateTo('menu')}
                className="flex items-center gap-1 text-xs font-rajdhani font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Portals
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                aria-label="Close Login Form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Header */}
            <div className="text-center space-y-1.5 mb-6">
              <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-2xl bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800">
                {activeView === 'student-login' ? '🎓' : activeView === 'admin-login' ? '🛡️' : '🏫'}
              </div>
              <h1 className="font-orbitron font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-wide">
                {activeView === 'student-login' ? 'Student Login' : activeView === 'admin-login' ? 'Administrator Login' : 'School Login'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-rajdhani font-semibold">
                {activeView === 'student-login' 
                  ? 'Sign in to access your student account & telemetry' 
                  : activeView === 'admin-login'
                  ? 'Sign in to ISRO IndoScience control center'
                  : 'Sign in to manage your school ground station account'}
              </p>
            </div>

            {/* Error & Success Banners */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-rajdhani font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  {activeView === 'student-login' ? 'Student Username' : activeView === 'admin-login' ? 'Admin ID / Email' : 'School Email Address'}
                </label>
                <div className="relative">
                  {activeView === 'student-login' ? (
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  ) : (
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  )}
                  <input
                    type={activeView === 'student-login' ? 'text' : 'email'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={activeView === 'student-login' ? 'Enter your username (e.g. arwa.ggs)' : 'Enter registered school email'}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-blue-900 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-rajdhani font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  {activeView === 'school-login' && (
                    <button
                      type="button"
                      onClick={() => setErrorMsg('Use the password reset link or contact your school administrator.')}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-blue-900 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-rajdhani font-black text-sm tracking-wide shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? 'Signing In...' : 'Sign In to Portal'}
              </button>
            </form>

            {/* Navigation Switch Links */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-blue-900/60 space-y-2 text-xs text-center text-slate-600 dark:text-slate-400 font-rajdhani">
              {(activeView as any) !== 'register' && (
                <p>
                  Don't have a school account?{' '}
                  <button
                    type="button"
                    onClick={() => handleNavigateTo('register', '#/register')}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    Register your school
                  </button>
                </p>
              )}

              {activeView === 'school-login' ? (
                <p>
                  Are you a student?{' '}
                  <button
                    type="button"
                    onClick={() => handleNavigateTo('student-login', '#/login?type=student')}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    Student Login →
                  </button>
                </p>
              ) : (
                <p>
                  Are you a school?{' '}
                  <button
                    type="button"
                    onClick={() => handleNavigateTo('school-login', '#/login?type=school')}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    School Login →
                  </button>
                </p>
              )}

              {activeView !== 'admin-login' && (
                <p className="pt-1">
                  Platform Administrator?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenISROAdmin) {
                        handleClose();
                        onOpenISROAdmin();
                      } else {
                        handleNavigateTo('admin-login', '#/admin/login');
                      }
                    }}
                    className="text-pink-600 dark:text-pink-400 font-bold hover:underline"
                  >
                    Admin Control Center
                  </button>
                </p>
              )}

              <div className="pt-3">
                <a
                  href="https://pd.indoscience.in/#/login?type=school"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                >
                  <span>Open directly on pd.indoscience.in</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCHOOL REGISTRATION FORM MODAL
          ======================================================== */}
      {activeView === 'register' && (
        <div 
          className="fixed inset-0 z-[10001] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="relative w-full max-w-[480px] bg-white dark:bg-[#0c1533] border border-slate-200 dark:border-blue-900 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-900 dark:text-white transition-all my-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-blue-900/60">
              <button
                type="button"
                onClick={() => handleNavigateTo('menu')}
                className="flex items-center gap-1 text-xs font-rajdhani font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Portals
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                aria-label="Close Registration Form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-1 mb-5">
              <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-2xl bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800">
                🏫
              </div>
              <h1 className="font-orbitron font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">
                Register School
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-rajdhani font-semibold">
                Create an IndoScience account to connect your school ground station
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-rajdhani font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  School / Institution Name *
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. DR G.G.SHAH ENGLISH MEDIUM HIGH SCHOOL"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-blue-900 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-rajdhani font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Official School Email Address *
                </label>
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@school.edu.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-blue-900 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-rajdhani font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Principal / Coordinator
                  </label>
                  <input
                    type="text"
                    value={principalName}
                    onChange={(e) => setPrincipalName(e.target.value)}
                    placeholder="e.g. Dr. Archana Dharu"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-blue-900 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-rajdhani font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Location / City
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Kasba Peth, Pune"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-blue-900 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-rajdhani font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Create Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong account password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-blue-900 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-rajdhani font-black text-sm tracking-wide shadow-lg shadow-blue-500/25 transition-all cursor-pointer mt-2"
              >
                {isLoading ? 'Submitting Registration...' : 'Complete School Registration'}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-blue-900/60 text-center text-xs text-slate-600 dark:text-slate-400 font-rajdhani">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleNavigateTo('school-login', '#/login?type=school')}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Sign in here →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
