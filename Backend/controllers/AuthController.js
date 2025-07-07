const jwt = require("jsonwebtoken")
const db = require("../database/db")
const bcrypt = require("bcryptjs")

const login = async (req, res) => {
    try {
        const { email, password } = req.body

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" })
        }

        // Get user from database
        const user = await db.getUserByEmail(email)
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" })
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" })
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "fallback_secret", {
            expiresIn: "7d",
        })

        res.json({
            message: "Login successful",
            token,
            user: { id: user.id, email: user.email, name: user.name },
        })
    } catch (error) {
        console.error("Login error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

const register = async (req, res) => {
    try {
        const { email, password, name } = req.body

        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({ error: "All fields are required" })
        }

        // Check if user already exists
        const existingUser = await db.getUserByEmail(email)
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const userId = await db.createUser({
            email,
            password: hashedPassword,
            name,
        })

        // Generate JWT token
        const token = jwt.sign({ userId, email }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "7d" })

        res.status(201).json({
            message: "User created successfully",
            token,
            user: { id: userId, email, name },
            success: true,
        })
    } catch (error) {
        console.error("Registration error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

module.exports = {
    login,
    register
}