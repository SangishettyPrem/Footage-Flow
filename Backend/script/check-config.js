#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
require("dotenv").config()

function checkConfiguration() {
    console.log("🔍 StoryAI Configuration Check")
    console.log("=".repeat(50))
    console.log()

    // Check .env file
    const envPath = path.join(__dirname, "..", ".env")
    if (!fs.existsSync(envPath)) {
        console.log("❌ .env file not found")
        console.log("   Run: cp .env.example .env")
        console.log("   Then edit .env with your API keys")
        return false
    }
    console.log("✅ .env file found")

    // Check database directory
    const dbDir = path.join(__dirname, "..", "database")
    if (!fs.existsSync(dbDir)) {
        console.log("❌ Database directory not found")
        return false
    }
    console.log("✅ Database directory exists")

    // Check uploads directory
    const uploadsDir = path.join(__dirname, "..", "uploads")
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
        console.log("✅ Created uploads directory")
    } else {
        console.log("✅ Uploads directory exists")
    }

    console.log()
    console.log("🤖 AI Services Configuration:")

    let hasAnyAI = false

    // Check Google Gemini (Priority 1 - FREE)
    if (process.env.GOOGLE_GEMINI_API_KEY) {
        console.log("✅ Google Gemini API key configured (FREE)")
        hasAnyAI = true
    } else {
        console.log("❌ Google Gemini API key not configured")
        console.log("   Get FREE key: https://makersuite.google.com/app/apikey")
    }

    // Check OpenAI
    if (process.env.OPENAI_API_KEY) {
        if (process.env.OPENAI_API_KEY.startsWith("sk-")) {
            console.log("✅ OpenAI API key configured")
            hasAnyAI = true
        } else {
            console.log("⚠️  OpenAI API key format invalid")
        }
    } else {
        console.log("❌ OpenAI API key not configured")
    }

    // Check AssemblyAI
    if (process.env.ASSEMBLY_AI_API_KEY) {
        console.log("✅ AssemblyAI API key configured")
        hasAnyAI = true
    } else {
        console.log("❌ AssemblyAI API key not configured")
    }

    // Check Google Cloud
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        if (fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
            console.log("✅ Google Cloud credentials configured")
            hasAnyAI = true
        } else {
            console.log("⚠️  Google Cloud credentials file not found")
        }
    } else {
        console.log("❌ Google Cloud credentials not configured")
    }

    console.log()

    // Check FFmpeg
    const { execSync } = require("child_process")
    try {
        execSync("ffmpeg -version", { stdio: "ignore" })
        console.log("✅ FFmpeg is installed")
    } catch (error) {
        console.log("❌ FFmpeg not found")
        console.log("   Install FFmpeg:")
        console.log("   - Windows: Download from https://ffmpeg.org/")
        console.log("   - macOS: brew install ffmpeg")
        console.log("   - Linux: sudo apt install ffmpeg")
    }

    console.log()

    if (!hasAnyAI) {
        console.log("⚠️  No AI transcription services configured")
        console.log("   The app will use mock transcription")
        console.log("   🎯 RECOMMENDED: Get FREE Google Gemini API key")
        console.log("   👉 https://makersuite.google.com/app/apikey")
    } else {
        console.log("🎉 AI transcription services are configured!")
    }

    console.log()
    console.log("🚀 Ready to start the server!")
    console.log("   Run: npm run dev")
    return true
}

if (require.main === module) {
    checkConfiguration()
}

module.exports = { checkConfiguration }
