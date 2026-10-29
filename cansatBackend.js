const cookieParser = require("cookie-parser");
const express = require("express");

const {
    registerSchool,
    loginSchool,
    loginStudent,
    createStudentAccount,
    getSchoolStudents,
    deactivateSchoolStudent,
    deleteSchoolStudent,
    activateSchoolStudent,
    changeSchoolPassword,
    changeStudentPassword,
    requestSchoolPasswordReset,
    resetUserPassword,
} = require("./auth");

const {
    loginAdmin,
} = require("./adminAuth");

const {
    findStudentById,
    findAllSchools,
    deactivateSchool,
    activateSchool,
    deleteSchool,
    findAllStudents,
    deactivateStudentByAdmin,
    activateStudentByAdmin,
    deleteStudentByAdmin,
} = require("./userRepository");

const {
    createSession,
    deleteSession,
} = require("./session");

const {
    requireAuth,
    requireAdmin,
    requireSchool,
    requireStudent,
} = require("./authMiddleware");

const telemetryRoutes = require("./telemetryRoutes");
const telemetryReadRoutes = require("./telemetryReadRoutes");

const SESSION_COOKIE_NAME = "session_token";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
const SESSION_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_MS,
    path: "/",
};

function setupCansatBackend(app) {
    // Cookie parser middleware for session handling
    app.use(cookieParser());

    // Telemetry endpoints
    app.use("/api/v1/telemetry", telemetryRoutes);
    app.use("/api/v1/telemetry", telemetryReadRoutes);

    // School Registration (supports both ISRO Antriksha format and CanSat format)
    app.post("/api/auth/register", async (req, res) => {
        try {
            const schoolName = req.body.schoolName || req.body.name;
            const email = req.body.email;
            const phone = req.body.phone || req.body.phone_number || "9999999999";
            const password = req.body.password;

            if (!schoolName || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "School name, email, and password are required.",
                });
            }

            const school = await registerSchool({
                schoolName,
                email,
                phone,
                password,
            });

            return res.status(201).json({
                success: true,
                message: "School registered successfully.",
                school: {
                    id: school.id,
                    schoolName: school.school_name,
                    email: school.email,
                },
            });
        } catch (error) {
            console.error("School registration error:", error.message);
            return res.status(400).json({
                success: false,
                message: error.message || "Registration failed.",
            });
        }
    });

    // Unified School / Admin Login
    app.post(["/api/auth/login", "/api/auth/school-login"], async (req, res) => {
        try {
            const { email, username, password } = req.body || {};
            const cleanPassword = String(password || "").trim();
            const cleanEmail = String(email || username || "").trim().toLowerCase();

            const result = await loginSchool({
                email: cleanEmail,
                password: cleanPassword,
            });

            if (result.mfaRequired) {
                return res.status(200).json(result);
            }

            const school = result.school || result;
            const session = await createSession({ userId: school.id, userType: "school" });

            res.cookie(SESSION_COOKIE_NAME, session.token, SESSION_COOKIE_OPTIONS);

            return res.status(200).json({
                success: true,
                message: "Login successful.",
                token: session.token,
                user: {
                    id: school.id,
                    schoolName: school.schoolName || school.school_name,
                    email: school.email,
                    type: "school",
                },
            });
        } catch (error) {
            console.error("Login error:", error.message);
            return res.status(401).json({
                success: false,
                message: error.message || "Invalid credentials.",
            });
        }
    });

    // Student Login
    app.post("/api/auth/student-login", async (req, res) => {
        try {
            const { username, password } = req.body || {};
            const cleanPassword = String(password || "").trim();
            const cleanUsername = String(username || "").trim().toLowerCase();

            const result = await loginStudent({
                username: cleanUsername,
                password: cleanPassword,
            });

            const student = result.student || result;
            const session = await createSession({ userId: student.id, userType: "student" });

            res.cookie(SESSION_COOKIE_NAME, session.token, SESSION_COOKIE_OPTIONS);

            return res.status(200).json({
                success: true,
                message: "Student login successful.",
                token: session.token,
                student: {
                    id: student.id,
                    studentName: student.studentName || student.student_name,
                    username: student.username,
                    satelliteId: student.satelliteId || student.satellite_id,
                    type: "student",
                },
            });
        } catch (error) {
            console.error("Student login error:", error.message);
            return res.status(401).json({
                success: false,
                message: error.message || "Invalid credentials.",
            });
        }
    });

    // Admin Login
    app.post("/api/auth/admin/login", async (req, res) => {
        try {
            const { username, email, password } = req.body || {};
            const cleanPassword = String(password || "").trim();
            const cleanUser = String(username || email || "").trim();

            const result = await loginAdmin({
                username: cleanUser,
                password: cleanPassword,
            });

            const adminId = (result.admin && result.admin.id) || result.id;
            const session = await createSession({ userId: adminId, userType: "admin" });

            res.cookie(SESSION_COOKIE_NAME, session.token, SESSION_COOKIE_OPTIONS);

            return res.status(200).json({
                success: true,
                message: "Admin login successful.",
                token: session.token,
                admin: result.admin || {
                    id: result.id,
                    username: result.username,
                    userType: "admin",
                },
            });
        } catch (error) {
            console.error("Admin login error:", error.message);
            return res.status(401).json({
                success: false,
                message: error.message || "Admin login failed.",
            });
        }
    });

    // Logout
    app.post("/api/auth/logout", async (req, res) => {
        try {
            const token = req.cookies[SESSION_COOKIE_NAME] || req.headers.authorization?.replace("Bearer ", "");
            if (token) {
                await deleteSession(token).catch(() => {});
            }
            res.clearCookie(SESSION_COOKIE_NAME, {
                httpOnly: SESSION_COOKIE_OPTIONS.httpOnly,
                secure: SESSION_COOKIE_OPTIONS.secure,
                sameSite: SESSION_COOKIE_OPTIONS.sameSite,
                path: SESSION_COOKIE_OPTIONS.path,
            });
            return res.status(200).json({
                success: true,
                message: "Logged out successfully.",
            });
        } catch (error) {
            return res.status(200).json({
                success: true,
                message: "Logged out.",
            });
        }
    });

    // Auth verification endpoints
    app.get(["/api/auth/me", "/api/auth/student/me", "/api/auth/admin/me"], async (req, res) => {
        const token = req.cookies[SESSION_COOKIE_NAME] || req.headers.authorization?.replace("Bearer ", "");

        if (!token) {
            return res.status(200).json({
                success: true,
                authenticated: false,
                user: null,
            });
        }

        // Pass through to requireAuth logic
        requireAuth(req, res, async () => {
            if (req.user?.type === "student") {
                try {
                    const student = await findStudentById(req.user.id);
                    return res.status(200).json({
                        success: true,
                        authenticated: true,
                        student: {
                            id: student.id,
                            schoolId: student.school_id,
                            studentName: student.student_name,
                            username: student.username,
                            satelliteId: student.satellite_id,
                            isActive: student.is_active,
                        },
                    });
                } catch {
                    return res.status(200).json({ success: true, authenticated: true, user: req.user });
                }
            }

            return res.status(200).json({
                success: true,
                authenticated: true,
                user: req.user,
            });
        });
    });

    // Password reset endpoints
    app.post("/api/auth/forgot-password", async (req, res) => {
        try {
            const { email } = req.body;
            const result = await requestSchoolPasswordReset({ email });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to process password reset request.",
            });
        }
    });

    app.post("/api/auth/reset-password", async (req, res) => {
        try {
            const { token, newPassword } = req.body;
            const result = await resetUserPassword({ token, newPassword });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || "Password reset failed.",
            });
        }
    });

    // Student Management (for logged-in School)
    app.get("/api/students", requireAuth, requireSchool, async (req, res) => {
        try {
            const students = await getSchoolStudents(req.user.id);
            return res.status(200).json({ success: true, students });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    });

    app.post("/api/students", requireAuth, requireSchool, async (req, res) => {
        try {
            const student = await createStudentAccount({
                schoolId: req.user.id,
                studentName: req.body.studentName,
                username: req.body.username,
                password: req.body.password,
            });
            return res.status(201).json({
                success: true,
                message: "Student created successfully.",
                student,
            });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    });

    app.patch("/api/students/:id/activate", requireAuth, requireSchool, async (req, res) => {
        try {
            await activateSchoolStudent(req.params.id, req.user.id);
            return res.status(200).json({ success: true, message: "Student activated." });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    });

    app.patch("/api/students/:id/deactivate", requireAuth, requireSchool, async (req, res) => {
        try {
            await deactivateSchoolStudent(req.params.id, req.user.id);
            return res.status(200).json({ success: true, message: "Student deactivated." });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    });

    app.delete("/api/students/:id", requireAuth, requireSchool, async (req, res) => {
        try {
            await deleteSchoolStudent(req.params.id, req.user.id);
            return res.status(200).json({ success: true, message: "Student deleted." });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    });

    // Admin endpoints
    app.get("/api/admin/schools", requireAuth, requireAdmin, async (req, res) => {
        try {
            const schools = await findAllSchools();
            return res.status(200).json({ success: true, schools });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    });

    app.get("/api/admin/students", requireAuth, requireAdmin, async (req, res) => {
        try {
            const students = await findAllStudents();
            return res.status(200).json({ success: true, students });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    });
}

module.exports = { setupCansatBackend };
