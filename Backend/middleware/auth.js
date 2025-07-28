const jwt = require("jsonwebtoken")
const { envConfig } = require("../config/envConfig")
const { User } = require("../models")

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided.", success: false })
        }

        const decoded = jwt.verify(token, envConfig.jwtSecretKey || "fallback_secret")

        const user = await User.findOne({ where: { id: decoded?.id } })
        if (!user) {
            return res.status(401).json({ message: "Invalid token. User not found.", success: false })
        }
        req.user = user?.dataValues;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token.", success: false })
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired.", success: false })
        }

        console.error("Auth middleware error:", error)
        res.status(500).json({ message: error?.message || "Internal server error", success: false })
    }
}

module.exports = authMiddleware
