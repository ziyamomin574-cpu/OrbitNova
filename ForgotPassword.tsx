import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/api";

interface ForgotPasswordProps {
    onBackToDashboard?: () => void;
    onNavigateToLogin?: () => void;
}

export default function ForgotPassword({ onBackToDashboard, onNavigateToLogin }: ForgotPasswordProps = {}) {
    let navigate: any = null;
    try {
        navigate = useNavigate();
    } catch {
        // Fallback outside router
    }

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
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
        setMessage("");
        setError("");

        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail) {
            setError("Please enter your school email.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(cleanEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            setIsLoading(true);

            const response = await forgotPassword({
                email: cleanEmail,
            });

            setMessage(
                response.message ||
                "If the account exists, password recovery instructions have been provided."
            );
            setEmail("");
        } catch (err: any) {
            setError(err?.message || "Unable to process password recovery.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-screen-wrapper">
            <style>{`
                .forgot-screen-wrapper {
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

                .forgot-card-container {
                    width: 100%;
                    max-width: 440px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 40px 36px;
                    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02);
                    box-sizing: border-box;
                }

                .forgot-card-title {
                    font-size: 26px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 6px 0;
                    letter-spacing: -0.02em;
                }

                .forgot-card-subtitle {
                    font-size: 14px;
                    color: #64748b;
                    margin: 0 0 24px 0;
                    line-height: 1.4;
                }

                .forgot-field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-bottom: 20px;
                }

                .forgot-field-label {
                    font-size: 13.5px;
                    font-weight: 600;
                    color: #334155;
                }

                .forgot-field-input {
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

                .forgot-field-input:focus {
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
                }

                .forgot-field-input::placeholder {
                    color: #94a3b8;
                }

                .forgot-primary-btn {
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

                .forgot-primary-btn:hover:not(:disabled) {
                    background: #1d4ed8;
                }

                .forgot-primary-btn:active:not(:disabled) {
                    transform: scale(0.99);
                }

                .forgot-primary-btn:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                }

                .forgot-card-footer {
                    margin-top: 22px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    font-size: 13.5px;
                    color: #64748b;
                    text-align: center;
                }

                .forgot-card-footer button,
                .forgot-card-footer a {
                    color: #2563eb;
                    font-weight: 600;
                    background: none;
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    text-decoration: none;
                    font-size: 13.5px;
                }

                .forgot-card-footer button:hover,
                .forgot-card-footer a:hover {
                    text-decoration: underline;
                }

                .forgot-return-btn {
                    color: #64748b !important;
                    font-weight: 500 !important;
                    margin-top: 4px;
                }

                .forgot-return-btn:hover {
                    color: #0f172a !important;
                }

                .forgot-error-badge {
                    margin-bottom: 16px;
                    padding: 10px 14px;
                    background-color: #fef2f2;
                    border: 1px solid #fee2e2;
                    border-radius: 8px;
                    color: #b91c1c;
                    font-size: 13px;
                    line-height: 1.4;
                }

                .forgot-success-badge {
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
                    .forgot-card-container {
                        padding: 30px 20px;
                        border-radius: 12px;
                    }
                }
            `}</style>

            <div className="forgot-card-container">
                <h1 className="forgot-card-title">Forgot Password</h1>
                <p className="forgot-card-subtitle">
                    Enter your registered school email to start password recovery.
                </p>

                {error && (
                    <div className="forgot-error-badge" role="alert">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="forgot-success-badge" role="status">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="forgot-field-group">
                        <label htmlFor="email" className="forgot-field-label">
                            School Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your school email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="forgot-field-input"
                            autoComplete="email"
                            maxLength={150}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="forgot-primary-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : "Recover Password"}
                    </button>
                </form>

                <div className="forgot-card-footer">
                    <div>
                        Remember your password?{" "}
                        <button type="button" onClick={handleGoToLogin}>
                            Back to Login
                        </button>
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={handleBack}
                            className="forgot-return-btn"
                        >
                            ← Return to IndoScience Website
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
