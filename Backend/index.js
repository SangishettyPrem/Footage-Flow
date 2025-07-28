const express = require("express")
const cors = require("cors")
const multer = require("multer")
const path = require("path")
const { v4: uuidv4 } = require("uuid");
const genAI = require("@google/genai");
const morgan = require("morgan");


const GoogleGenAI = genAI.GoogleGenAI;
require("dotenv").config()

const db = require("./database/db")
const authMiddleware = require("./middleware/auth")
const AuthRouters = require("./Routers/AuthRoutes")
const FileRouters = require('./Routers/FileRouters');
const StoryRouters = require('./Routers/StoryRoutes');
const { envConfig } = require("./config/envConfig")
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(cors({ origin: envConfig?.frontendURL, credentials: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "StoryAI Backend is running" })
})

app.use("/api/auth", AuthRouters);
app.use('/api/auth/files', FileRouters);
app.use('/api/auth/stories', StoryRouters);

// Delete story
app.delete("/api/stories/:storyId", authMiddleware, async (req, res) => {
    try {
        const { storyId } = req.params

        const story = await db.getStoryById(storyId)
        if (!story || story.user_id !== req.user.id) {
            return res.status(404).json({ error: "Story not found" })
        }

        await db.deleteStory(storyId)
        res.json({ message: "Story deleted successfully" })
    } catch (error) {
        console.error("Delete story error:", error)
        res.status(500).json({ error: "Failed to delete story" })
    }
})

// Analytics endpoint
app.get("/api/analytics", authMiddleware, async (req, res) => {
    try {
        const analytics = await db.getUserAnalytics(req.user.id)
        res.json(analytics)
    } catch (error) {
        console.error("Analytics error:", error)
        res.status(500).json({ error: "Failed to retrieve analytics" })
    }
})

// Error handling middleware
app.use((error, req, res, next) => {
    console.error("Error:", error)

    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "File too large" })
        }
    }

    res.status(500).json({ error: "Internal server error" })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" })
})

// Initialize database and start server
db.initializeDatabase()
    .then(() => {
        app.listen(PORT, async () => {
            console.log(`🚀 StoryAI Backend Server running on port ${PORT}`)
            console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
            await db.testConnection();
        })
    })
    .catch((error) => {
        console.error("Failed to initialize database:", error)
        process.exit(1)
    })

module.exports = app
