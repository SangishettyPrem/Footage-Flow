#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const readline = require("readline")

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve)
    })
}

async function setupGemini() {
    console.log("🚀 Google Gemini API Setup")
    console.log("=".repeat(40))
    console.log()

    console.log("📋 Steps to get your Google Gemini API key:")
    console.log("1. Visit: https://makersuite.google.com/app/apikey")
    console.log("2. Sign in with your Google account")
    console.log("3. Click 'Create API Key'")
    console.log("4. Copy the generated API key")
    console.log()

    const apiKey = await question("🔑 Enter your Google Gemini API key: ")

    if (!apiKey || apiKey.trim().length === 0) {
        console.log("❌ No API key provided. Setup cancelled.")
        rl.close()
        return
    }

    // Create or update .env file
    const envPath = path.join(__dirname, "..", ".env")
    let envContent = ""

    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf8")
    }

    // Update or add Gemini API key
    if (envContent.includes("GOOGLE_GEMINI_API_KEY=")) {
        envContent = envContent.replace(/GOOGLE_GEMINI_API_KEY=.*/, `GOOGLE_GEMINI_API_KEY=${apiKey.trim()}`)
    } else {
        envContent += `\n# Google Gemini API\nGOOGLE_GEMINI_API_KEY=${apiKey.trim()}\n`
    }

    // Add other required environment variables if they don't exist
    const requiredVars = [
        "PORT=5000",
        "NODE_ENV=development",
        "JWT_SECRET=your_super_secret_jwt_key_here_change_in_production",
        "DATABASE_URL=./database/storyai.db",
        "MAX_FILE_SIZE=104857600",
        "UPLOAD_DIR=./uploads",
        "FRONTEND_URL=http://localhost:3000",
    ]

    requiredVars.forEach((varLine) => {
        const [key] = varLine.split("=")
        if (!envContent.includes(`${key}=`)) {
            envContent += `${varLine}\n`
        }
    })

    fs.writeFileSync(envPath, envContent)

    console.log()
    console.log("✅ Google Gemini API key saved to .env file")
    console.log()
    console.log("🎯 Next steps:")
    console.log("1. Install dependencies: npm install")
    console.log("2. Check configuration: npm run check-config")
    console.log("3. Start the server: npm run dev")
    console.log()
    console.log("💡 Google Gemini Features:")
    console.log("   • Free tier with generous limits")
    console.log("   • High-quality transcription")
    console.log("   • Multi-language support")
    console.log("   • Fast processing")

    rl.close()
}

if (require.main === module) {
    setupGemini().catch(console.error)
}

module.exports = { setupGemini }
