import React, { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { loginSchool, loginStudent, getCurrentUser } from "../services/api";

interface LoginProps {
    initialType?: "school" | "student";
    onBackToDashboard?: () => void;
    onNavigateToRegister?: () => void;
    onNavigateToForgot?: () => void;
    onNavigateToAdmin?: () => void;
    onSwitchType?: (type: "school" | "student") => void;
    onLoginSuccess?: (userType: "school" | "student", user: any) => void;
}

export default function Login({
    initialType,
    onBackToDashboard,
    onNavigateToRegister,
    onNavigateToForgot,
    onNavigateToAdmin,
    onSwitchType,
    onLoginSuccess,
}: LoginProps) {
    let navigate: any = null;
    let location: any = { pathname: "/login", search: "" };
    let searchParams: any = new URLSearchParams();

    try {
        navigate = useNavigate();
        location = useLocation();
        const [params] = useSearchParams();
        searchParams = params;
    } catch {
        // Fallback when outside router context
    }

    const [activeType, setActiveType] = useState<"school" | "student">(() => {
        if (initialType) return initialType;
        if (location?.pathname === "/login/student" || searchParams?.get("type") === "student") {
            return "student";
        }
        return "school";
    });

    const isStudent = activeType === "student";

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSwitch = (newType: "school" | "student") => {
        setActiveType(newType);
        setError("");
        if (onSwitchType) {
            onSwitchType(newType);
        } else if (navigate) {
            navigate(newType === "student" ? "/login?type=student" : "/login?type=school");
        }
    };

    const handleBack = () => {
        if (onBackToDashboard) {
            onBackToDashboard();
        } else if (navigate) {
            navigate("/");
        } else {
            window.location.href = "/";
        }
    };

    const handleGoToRegister = () => {
        if (onNavigateToRegister) {
            onNavigateToRegister();
        } else if (navigate) {
            navigate("/register");
        }
    };

    const handleGoToForgot = () => {
        if (onNavigateToForgot) {
            onNavigateToForgot();
        } else if (navigate) {
            navigate("/forgot-password");
        }
    };

    const handleGoToAdmin = () => {
        if (onNavigateToAdmin) {
            onNavigateToAdmin();
        } else if (navigate) {
            navigate("/admin-login");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        const cleanIdentifier = identifier.trim();

        if (!cleanIdentifier || !password) {
            setError(
                isStudent
                    ? "Please enter your username and password."
                    : "Please enter your email and password."
            );
            return;
        }

        try {
            setIsLoading(true);

            let response;
            if (isStudent) {
                response = await loginStudent({
                    username: cleanIdentifier.toLowerCase(),
                    password,
                });
            } else {
                response = await loginSchool({
                    email: cleanIdentifier.toLowerCase(),
                    password,
                });
            }

            const currentUser = await getCurrentUser().catch(() => null);

            if (onLoginSuccess) {
                onLoginSuccess(activeType, currentUser || response);
            } else if (navigate) {
                navigate(isStudent ? "/student-dashboard" : "/dashboard");
            }
        } catch (err: any) {
            setError(
                err?.message ||
                "Invalid email or password."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-screen-wrapper">
            <style>{`
                .login-screen-wrapper {
                    min-height: 100vh;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #fafbfc;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    padding: 24px 16px;
                    position: relative;
                    box-sizing: border-box;
                }

                .login-card-container {
                    width: 100%;
                    max-width: 440px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 44px 38px;
                    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02);
                    box-sizing: border-box;
                }

                .login-card-title {
                    font-size: 26px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 6px 0;
                    letter-spacing: -0.02em;
                }

                .login-card-subtitle {
                    font-size: 14px;
                    color: #64748b;
                    margin: 0 0 26px 0;
                    line-height: 1.4;
                }

                .login-field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-bottom: 18px;
                }

                .login-field-label {
                    font-size: 13.5px;
                    font-weight: 600;
                    color: #334155;
                }

                .login-field-input {
                    width: 100%;
                    height: 44px;
                    padding: 0 14px;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    font-size: 14.5px;
                    color: #0f172a;
                    background: #ffffff;
                    outline: none;
                    transition: border-color 0.15s ease, box-shadow 0.15s ease;
                    box-sizing: border-box;
                }

                .login-field-input:focus {
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
                }

                .login-field-input::placeholder {
                    color: #94a3b8;
                }

                .login-forgot-row {
                    display: flex;
                    justify-content: flex-start;
                    margin-top: -6px;
                    margin-bottom: 20px;
                }

                .login-link-btn {
                    background: none;
                    border: none;
                    padding: 0;
                    color: #0f172a;
                    font-size: 13.5px;
                    font-weight: 500;
                    cursor: pointer;
                    text-decoration: none;
                }

                .login-link-btn:hover {
                    color: #2563eb;
                    text-decoration: underline;
                }

                .login-primary-btn {
                    width: 100%;
                    height: 46px;
                    background: #2563eb;
                    color: #ffffff;
                    border: none;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.15s ease, transform 0.05s;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                }

                .login-primary-btn:hover:not(:disabled) {
                    background: #1d4ed8;
                }

                .login-primary-btn:active:not(:disabled) {
                    transform: scale(0.99);
                }

                .login-primary-btn:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                }

                .login-card-footer {
                    margin-top: 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    color: #64748b;
                    text-align: center;
                }

                .login-card-footer a,
                .login-card-footer button {
                    color: #2563eb;
                    font-weight: 600;
                    background: none;
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    text-decoration: none;
                    font-size: 13px;
                }

                .login-card-footer a:hover,
                .login-card-footer button:hover {
                    text-decoration: underline;
                }

                .login-return-btn {
                    margin-top: 6px;
                    color: #64748b !important;
                    font-weight: 500 !important;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }

                .login-return-btn:hover {
                    color: #0f172a !important;
                }

                .login-error-badge {
                    margin-bottom: 16px;
                    padding: 10px 14px;
                    background-color: #fef2f2;
                    border: 1px solid #fee2e2;
                    border-radius: 8px;
                    color: #b91c1c;
                    font-size: 13px;
                    line-height: 1.4;
                }

                .login-floating-portal-btn {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #2563eb;
                    color: #ffffff;
                    padding: 10px 18px;
                    border-radius: 9999px;
                    font-size: 14px;
                    font-weight: 600;
                    box-shadow: 0 10px 25px -3px rgba(37, 99, 235, 0.4);
                    border: none;
                    cursor: pointer;
                    transition: transform 0.15s ease, background 0.15s ease;
                    z-index: 50;
                }

                .login-floating-portal-btn:hover {
                    background: #1d4ed8;
                    transform: translateY(-2px);
                }

                @media (max-width: 480px) {
                    .login-card-container {
                        padding: 32px 22px;
                        border-radius: 12px;
                    }
                }
            `}</style>

            <div className="login-card-container">
                <h1 className="login-card-title">
                    {isStudent ? "Student Login" : "School Login"}
                </h1>
                <p className="login-card-subtitle">
                    {isStudent
                        ? "Sign in to access your student telemetry dashboard"
                        : "Sign in to manage your school account"}
                </p>

                {error && (
                    <div className="login-error-badge" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="login-field-group">
                        <label htmlFor="user-id" className="login-field-label">
                            {isStudent ? "Username" : "School Email"}
                        </label>
                        <input
                            id="user-id"
                            type={isStudent ? "text" : "email"}
                            placeholder={isStudent ? "Enter your username" : "Enter your school email"}
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="login-field-input"
                            autoComplete={isStudent ? "username" : "email"}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="login-field-group">
                        <label htmlFor="user-pass" className="login-field-label">
                            Password
                        </label>
                        <input
                            id="user-pass"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-field-input"
                            autoComplete="current-password"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    {!isStudent && (
                        <div className="login-forgot-row">
                            <button
                                type="button"
                                onClick={handleGoToForgot}
                                className="login-link-btn"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-primary-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing in..." : "Login"}
                    </button>
                </form>

                <div className="login-card-footer">
                    {!isStudent && (
                        <div>
                            Don't have a school account?{" "}
                            <button type="button" onClick={handleGoToRegister}>
                                Register your school
                            </button>
                        </div>
                    )}

                    <div>
                        {isStudent ? (
                            <>
                                Are you a school?{" "}
                                <button type="button" onClick={() => handleSwitch("school")}>
                                    School Login
                                </button>
                            </>
                        ) : (
                            <>
                                Are you a student?{" "}
                                <button type="button" onClick={() => handleSwitch("student")}>
                                    Student Login
                                </button>
                            </>
                        )}
                    </div>

                    <div>
                        Platform Administrator?{" "}
                        <button type="button" onClick={handleGoToAdmin}>
                            Admin Portal Login
                        </button>
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={handleBack}
                            className="login-return-btn"
                        >
                            ← Return to IndoScience Website
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Portal Login Button in Bottom Right (matching screenshot) */}
            <button
                type="button"
                onClick={handleBack}
                className="login-floating-portal-btn"
                title="Return to Main Radar & Telemetry Dashboard"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                <span>Portal Login</span>
            </button>
        </div>
    );
}
