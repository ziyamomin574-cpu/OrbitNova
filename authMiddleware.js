const {
    findSchoolById,
    findStudentById,
    findAdminById,
} = require("./userRepository");

const {
    getSession,
} = require("./session");


const SESSION_COOKIE_NAME = "session_token";

/**
 * Require a valid logged-in session.
 */
async function requireAuth(req, res, next) {
    try {
        let sessionToken = req.cookies ? req.cookies[SESSION_COOKIE_NAME] : null;

        if (!sessionToken && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            sessionToken = req.headers.authorization.slice(7).trim();
        }

        if (!sessionToken && req.headers["x-session-token"]) {
            sessionToken = req.headers["x-session-token"];
        }

        let session = null;
        if (sessionToken) {
            session = await getSession(sessionToken);
        }

        if (!session) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in.",
            });
        }

        let user = null;

        if (session.user_type === "admin") {
            user = await findAdminById(session.user_id);
        } else if (session.user_type === "school") {
            user = await findSchoolById(session.user_id);
        } else if (session.user_type === "student") {
            user = await findStudentById(session.user_id);
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid session type.",
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account not found.",
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: "Account is inactive.",
            });
        }

        req.user = {
            id: user.id,
            type: session.user_type,
        };

        return next();
    } catch (error) {
        console.error("Authentication middleware error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Authentication check failed.",
        });
    }
}

/**
 * Require a logged-in school.
 */
function requireSchool(req, res, next) {
    if (!req.user || req.user.type !== "school") {
        return res.status(403).json({
            success: false,
            message: "School access required.",
        });
    }
    return next();
}

/**
 * Require a logged-in student.
 */
function requireStudent(req, res, next) {
    if (!req.user || req.user.type !== "student") {
        return res.status(403).json({
            success: false,
            message: "Student access required.",
        });
    }
    return next();
}

/**
 * Require a logged-in admin.
 */
function requireAdmin(req, res, next) {
    if (!req.user || req.user.type !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required.",
        });
    }
    return next();
}

module.exports = {
    requireAuth,
    requireAdmin,
    requireSchool,
    requireStudent,
};
