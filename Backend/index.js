const express = require("express")
const cors = require("cors")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const bcrypt = require("bcryptjs")
const OpenAI = require("openai");
const jwt = require("jsonwebtoken")
const { v4: uuidv4 } = require("uuid");
const genAI = require("@google/genai");
const GoogleGenAI = genAI.GoogleGenAI;
require("dotenv").config()

const db = require("./database/db")
const authMiddleware = require("./middleware/auth")
const transcriptionService = require("./services/transcriptionService")
const { default: axios } = require("axios")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userDir = path.join(uploadsDir, req.user.id.toString())
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true })
        }
        cb(null, userDir)
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${file.originalname}`
        cb(null, uniqueName)
    },
})

const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = allowedTypes.test(file.mimetype)

        if (mimetype && extname) {
            return cb(null, true)
        } else {
            cb(new Error("Only images and videos are allowed"))
        }
    },
})

// Routes

app.get("/", (req, res) => {
    res.send('Hello, welcome to the StoryAI Backend! Use the API endpoints to interact with the service.')
})
// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "StoryAI Backend is running" })
})

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
    try {
        const { email, password, name } = req.body

        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({ error: "All fields are required" })
        }

        // Check if user already exists
        const existingUser = await db.getUserByEmail(email)
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" })
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
        })
    } catch (error) {
        console.error("Registration error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post("/api/auth/login", async (req, res) => {
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
})

// Protected Routes (require authentication)

// Get user profile
app.get("/api/user/profile", authMiddleware, async (req, res) => {
    try {
        const user = await db.getUserById(req.user.id)
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            created_at: user.created_at,
        })
    } catch (error) {
        console.error("Profile error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// File upload endpoint
app.post("/api/files/upload", authMiddleware, upload.array("files", 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" })
        }

        const uploadedFiles = []

        for (const file of req.files) {
            let transcription = null
            let duration = null
            let analysis = null

            // Process video files
            if (file.mimetype.startsWith("video/")) {
                try {
                    // Get video duration
                    duration = await transcriptionService.getVideoDuration(file.path)

                    // Generate transcription
                    transcription = await transcriptionService.transcribeVideo(file.path)

                    // Analyze video content
                    analysis = await transcriptionService.analyzeVideoContent(file.path)
                } catch (error) {
                    console.error("Video processing failed:", error)
                    duration = "2:30"
                    transcription = transcriptionService.generateMockTranscription()
                }
            } else if (file.mimetype.startsWith("image/")) {
                try {
                    duration = "N/A"
                    transcription = await transcriptionService.analyzeImageContent(file.path);
                } catch (error) {
                    console.error("Image processing failed:", error)
                    transcription = "This is a mock transcription for the image."
                }
            }

            // Generate tags based on analysis or use mock tags
            const mockTags = analysis ? analysis.objects : ["family", "vacation", "happy", "outdoor"]
            const location = transcriptionService.simulateLocationDetection()
            const people = transcriptionService.simulatePeopleDetection()

            const fileData = {
                id: uuidv4(),
                user_id: req.user?.id || null,
                filename: file.filename || null,
                original_name: file.originalname || null,
                file_path: file.path || null,
                file_size: file.size || 0,
                mime_type: file.mimetype || null,
                file_type: file.mimetype?.startsWith("video/") ? "video" : "image",
                duration: duration || null,
                transcription: transcription || null,
                tags: JSON.stringify(mockTags || []),
                location: location || null,
                people: JSON.stringify(people || []),
                thumbnail_path: `/uploads/${req.user?.id || "default"}/${file.filename}`,
                processing_status: "completed",
            }


            const fileId = await db.createFile(fileData)

            uploadedFiles.push({
                id: fileId,
                name: file.originalname,
                type: fileData.file_type,
                size: formatFileSize(file.size),
                duration: fileData.duration,
                transcription: fileData.transcription,
                tags: mockTags,
                location: fileData.location,
                people: JSON.parse(fileData.people),
                timestamp: new Date().toLocaleString(),
                thumbnail: fileData.thumbnail_path,
                url: `/uploads/${req.user.id}/${file.filename}`,
            })
        }

        res.json({
            message: "Files uploaded successfully",
            files: uploadedFiles,
        })
    } catch (error) {
        console.error("Upload error:", error)
        res.status(500).json({ error: "File upload failed" })
    }
})

// Get user files
app.get("/api/files", authMiddleware, async (req, res) => {
    try {
        const { search, type } = req.query
        const files = await db.getUserFiles(req.user.id, { search, type })

        const formattedFiles = files.map((file) => ({
            id: file.id,
            name: file.original_name,
            type: file.file_type,
            size: formatFileSize(file.file_size),
            duration: file.duration,
            transcription: file.transcription,
            tags: file.tags ? JSON.parse(file.tags) : [],
            location: file.location,
            people: file.people ? JSON.parse(file.people) : [],
            timestamp: new Date(file.created_at).toLocaleString(),
            thumbnail: file.thumbnail_path,
            url: file.thumbnail_path,
        }))

        res.json({ files: formattedFiles })
    } catch (error) {
        console.error("Get files error:", error)
        res.status(500).json({ error: "Failed to retrieve files" })
    }
})

// Delete file
app.delete("/api/files/:fileId", authMiddleware, async (req, res) => {
    try {
        const { fileId } = req.params

        // Get file info
        const file = await db.getFileById(fileId)
        if (!file || file.user_id !== req.user.id) {
            return res.status(404).json({ error: "File not found" })
        }

        // Delete file from filesystem
        if (fs.existsSync(file.file_path)) {
            fs.unlinkSync(file.file_path)
        }

        // Delete from database
        await db.deleteFile(fileId)

        res.json({ message: "File deleted successfully" })
    } catch (error) {
        console.error("Delete file error:", error)
        res.status(500).json({ error: "Failed to delete file" })
    }
})

// Story generation endpoint
app.post("/api/stories/generate", authMiddleware, async (req, res) => {
    try {
        const ai = new GoogleGenAI({
            apiKey: "AIzaSyCHQoosMeIt-yYA-HZRYG5QSv8V2qQiBo0",
        });
        const selectedFiles = req.body;

        const transcription = selectedFiles?.transcription || "This is a mock transcription for the story.";
        let prompt = req.body.prompt || "Make a story from this transcript.";
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }
        // Combine prompt and transcript
        const fullUserMessage = `
            ${prompt}

            Here is the transcript:
            "${transcription}"
            `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    parts: [
                        {
                            text: `You are a storytelling assistant. You turn transcripts into emotional, first-person narratives.\n\n${fullUserMessage}`
                        }
                    ]
                }
            ]
        });
        const storyText = response.candidates?.[0]?.content?.parts?.map(p => p.text).join(" ");

        let createdStories;
        let storyObj = {};
        if (selectedFiles) {
            storyObj = {
                id: uuidv4(),
                user_id: req.user?.id || null,
                title:  "AI Story",
                description: storyText || "This is a generated story based on your prompt and transcript.",
                prompt: prompt || null, // ✅ Add this line
                type: selectedFiles?.type,
                duration: selectedFiles?.duration || "2:30",
                clips_count: Math.floor(Math.random() * 10) + 3,
                file_ids: JSON.stringify(selectedFiles?.id || '') || null,
                thumbnail_path: selectedFiles?.thumbnail || "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=200&h=120&fit=crop",
                status: "completed",
            };
            createdStories = await db.createStory(storyObj);
        }


        return res.json({
            message: "Story generated successfully",
            story: createdStories,
        });
    } catch (error) {
        console.error("Story generation error:", error);
        res.status(500).json({ error: "Story generation failed" });
    }
});


// Get user stories
app.get("/api/stories", authMiddleware, async (req, res) => {
    try {
        const stories = await db.getUserStories(req.user.id)

        const formattedStories = stories.map((story) => ({
            id: story.id,
            title: story.title,
            description: story.description,
            duration: story.duration,
            clips: story.clips_count,
            type: story.type,
            prompt: story.prompt,
            thumbnail: story.thumbnail_path,
            created: new Date(story.created_at).toLocaleString(),
            status: story.status,
        }))

        res.json({ stories: formattedStories })
    } catch (error) {
        console.error("Get stories error:", error)
        res.status(500).json({ error: "Failed to retrieve stories" })
    }
})

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

// Utility function
function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

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
        app.listen(PORT, () => {
            console.log(`🚀 StoryAI Backend Server running on port ${PORT}`)
            console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
        })
    })
    .catch((error) => {
        console.error("Failed to initialize database:", error)
        process.exit(1)
    })

module.exports = app
