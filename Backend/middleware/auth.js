const jwt = require("jsonwebtoken")
const db = require("../database/db")

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided." })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret")

        // Verify user still exists
        const user = await db.getUserById(decoded.userId)
        if (!user) {
            return res.status(401).json({ error: "Invalid token. User not found." })
        }

        req.user = {
            id: decoded.userId,
            email: decoded.email,
        }

        next()
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token." })
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired." })
        }

        console.error("Auth middleware error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

module.exports = authMiddleware
