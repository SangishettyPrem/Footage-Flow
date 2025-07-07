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

async function setupApiKeys() {
    console.log("🚀 StoryAI API Keys Setup")
    console.log("=".repeat(50))
    console.log()

    const envPath = path.join(__dirname, "..", ".env")
    const envExamplePath = path.join(__dirname, "..", ".env.example")

    // Check if .env already exists
    if (fs.existsSync(envPath)) {
        const overwrite = await question("⚠️  .env file already exists. Overwrite? (y/N): ")
        if (overwrite.toLowerCase() !== "y") {
            console.log("Setup cancelled.")
            rl.close()
            return
        }
    }

    // Copy from .env.example
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath)
        console.log("✅ Created .env file from template")
    } else {
        console.log("❌ .env.example not found")
        rl.close()
        return
    }

    console.log()
    console.log("🤖 AI Transcription Service Setup")
    console.log("Choose one or more services to configure:")
    console.log()

    // OpenAI Setup
    console.log("1️⃣  OpenAI Whisper (Recommended)")
    console.log("   - Most accurate transcription")
    console.log("   - $0.006 per minute")
    console.log("   - Get API key: https://platform.openai.com/api-keys")
    console.log()

    const useOpenAI = await question("Configure OpenAI? (Y/n): ")
    if (useOpenAI.toLowerCase() !== "n") {
        const openaiKey = await question("Enter your OpenAI API key (sk-...): ")
        if (openaiKey.startsWith("sk-")) {
            updateEnvFile(envPath, "OPENAI_API_KEY", openaiKey)
            console.log("✅ OpenAI API key configured")
        } else {
            console.log("⚠️  Invalid OpenAI API key format")
        }
    }

    console.log()

    // AssemblyAI Setup
    console.log("2️⃣  AssemblyAI")
    console.log("   - Good accuracy with speaker detection")
    console.log("   - Free tier available")
    console.log("   - Get API key: https://www.assemblyai.com/")
    console.log()

    const useAssemblyAI = await question("Configure AssemblyAI? (y/N): ")
    if (useAssemblyAI.toLowerCase() === "y") {
        const assemblyKey = await question("Enter your AssemblyAI API key: ")
        if (assemblyKey.length > 10) {
            updateEnvFile(envPath, "ASSEMBLY_AI_API_KEY", assemblyKey)
            console.log("✅ AssemblyAI API key configured")
        } else {
            console.log("⚠️  Invalid AssemblyAI API key")
        }
    }

    console.log()

    // Google Cloud Setup
    console.log("3️⃣  Google Cloud Speech-to-Text")
    console.log("   - Enterprise-grade accuracy")
    console.log("   - $300 free credits for new users")
    console.log("   - Requires service account JSON file")
    console.log()

    const useGoogle = await question("Configure Google Cloud? (y/N): ")
    if (useGoogle.toLowerCase() === "y") {
        const credentialsPath = await question("Enter path to Google credentials JSON file: ")
        if (fs.existsSync(credentialsPath)) {
            updateEnvFile(envPath, "GOOGLE_APPLICATION_CREDENTIALS", credentialsPath)
            console.log("✅ Google Cloud credentials configured")
        } else {
            console.log("⚠️  Credentials file not found")
        }
    }

    console.log()
    console.log("🎉 Setup complete!")
    console.log()
    console.log("Next steps:")
    console.log("1. Install dependencies: npm install")
    console.log("2. Start the server: npm run dev")
    console.log("3. Upload a video to test transcription")
    console.log()

    rl.close()
}

function updateEnvFile(envPath, key, value) {
    let envContent = fs.readFileSync(envPath, "utf8")
    const regex = new RegExp(`^${key}=.*$`, "m")

    if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`)
    } else {
        envContent += `\n${key}=${value}`
    }

    fs.writeFileSync(envPath, envContent)
}

// Run setup if called directly
if (require.main === module) {
    setupApiKeys().catch(console.error)
}

module.exports = { setupApiKeys }
