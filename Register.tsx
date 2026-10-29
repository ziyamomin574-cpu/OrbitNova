import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerSchool } from "../services/api";

interface RegisterProps {
    onBackToDashboard?: () => void;
    onNavigateToLogin?: () => void;
}

export default function Register({ onBackToDashboard, onNavigateToLogin }: RegisterProps = {}) {
    let navigate: any = null;
    try {
        navigate = useNavigate();
    } catch {
        // Fallback outside router
    }

    const [schoolName, setSchoolName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleBack = () => {
        if (onBackToDashboard) {
            onBackToDashboard();
        } else if (navigate) {
            navigate("/");
        } else {
            window.location.href = "/";
        }
    };

    const handleGoToLogin = () => {
        if (onNavigateToLogin) {
            onNavigateToLogin();
        } else if (navigate) {
            navigate("/login?type=school");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const cleanSchoolName = schoolName.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanPhone = phone.trim();

        if (!cleanSchoolName || !cleanEmail || !cleanPhone || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (cleanSchoolName.length < 2 || cleanSchoolName.length > 150) {
            setError("School name must be between 2 and 150 characters.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(cleanEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        const phonePattern = /^\+?[0-9]{10,15}$/;
        if (!phonePattern.test(cleanPhone)) {
            setError("Please enter a valid 10-digit phone number.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setIsLoading(true);

            await registerSchool({
                schoolName: cleanSchoolName,
                email: cleanEmail,
                phone: cleanPhone,
                password,
            });

            setSuccess("School account created successfully! Redirecting to login...");
            setPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                handleGoToLogin();
            }, 1200);
        } catch (err: any) {
            setError(err?.message || "Unable to create school account. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-screen-wrapper">
            <style>{`
                .register-screen-wrapper {
                    min-height: 100vh;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #fafbfc;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    padding: 32px 16px;
                    box-sizing: border-box;
                }

                .register-card-container {
                    width: 100%;
                    max-width: 440px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 40px 36px;
                    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02);
                    box-sizing: border-box;
                }

                .register-card-title {
                    font-size: 26px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 6px 0;
                    letter-spacing: -0.02em;
                }

                .register-card-subtitle {
                    font-size: 14px;
                    color: #64748b;
                    margin: 0 0 24px 0;
                    line-height: 1.4;
                }

                .register-field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-bottom: 16px;
                }

                .register-field-label {
                    font-size: 13.5px;
                    font-weight: 600;
                    color: #334155;
                }

                .register-field-input {
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

                .register-field-input:focus {
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
                }

                .register-field-input::placeholder {
                    color: #94a3b8;
                }

                .register-primary-btn {
                    width: 100%;
                    height: 46px;
                    margin-top: 8px;
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

                .register-primary-btn:hover:not(:disabled) {
                    background: #1d4ed8;
                }

                .register-primary-btn:active:not(:disabled) {
                    transform: scale(0.99);
                }

                .register-primary-btn:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                }

                .register-card-footer {
                    margin-top: 22px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    font-size: 13.5px;
                    color: #64748b;
                    text-align: center;
                }

                .register-card-footer button,
                .register-card-footer a {
                    color: #2563eb;
                    font-weight: 600;
                    background: none;
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    text-decoration: none;
                    font-size: 13.5px;
                }

                .register-card-footer button:hover,
                .register-card-footer a:hover {
                    text-decoration: underline;
                }

                .register-return-btn {
                    color: #64748b !important;
                    font-weight: 500 !important;
                    margin-top: 4px;
                }

                .register-return-btn:hover {
                    color: #0f172a !important;
                }

                .register-error-badge {
                    margin-bottom: 16px;
                    padding: 10px 14px;
                    background-color: #fef2f2;
                    border: 1px solid #fee2e2;
                    border-radius: 8px;
                    color: #b91c1c;
                    font-size: 13px;
                    line-height: 1.4;
                }

                .register-success-badge {
                    margin-bottom: 16px;
                    padding: 10px 14px;
                    background-color: #f0fdf4;
                    border: 1px solid #dcfce7;
                    border-radius: 8px;
                    color: #15803d;
                    font-size: 13px;
                    line-height: 1.4;
                }

                @media (max-width: 480px) {
                    .register-card-container {
                        padding: 30px 20px;
                        border-radius: 12px;
                    }
                }
            `}</style>

            <div className="register-card-container">
                <h1 className="register-card-title">Register School</h1>
                <p className="register-card-subtitle">
                    Create an account for your school
                </p>

                {error && (
                    <div className="register-error-badge" role="alert">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="register-success-badge" role="status">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="register-field-group">
                        <label htmlFor="schoolName" className="register-field-label">
                            School Name
                        </label>
                        <input
                            id="schoolName"
                            type="text"
                            placeholder="Enter school name"
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            className="register-field-input"
                            autoComplete="organization"
                            maxLength={150}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="register-field-group">
                        <label htmlFor="email" className="register-field-label">
                            School Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter official school email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="register-field-input"
                            autoComplete="email"
                            maxLength={255}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="register-field-group">
                        <label htmlFor="phone" className="register-field-label">
                            Phone Number
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            placeholder="Enter 10-digit phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            className="register-field-input"
                            autoComplete="tel"
                            inputMode="numeric"
                            maxLength={10}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="register-field-group">
                        <label htmlFor="password" className="register-field-label">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Create a password (min 8 chars)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="register-field-input"
                            autoComplete="new-password"
                            maxLength={128}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="register-field-group">
                        <label htmlFor="confirmPassword" className="register-field-label">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="register-field-input"
                            autoComplete="new-password"
                            maxLength={128}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="register-primary-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <div className="register-card-footer">
                    <div>
                        Already have an account?{" "}
                        <button type="button" onClick={handleGoToLogin}>
                            Login
                        </button>
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={handleBack}
                            className="register-return-btn"
                        >
                            ← Return to IndoScience Website
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
