# AI Transcription API Setup Guide

This guide will help you set up API keys for real AI transcription services.

## 🎯 Recommended: OpenAI Whisper API

OpenAI's Whisper API provides the most accurate transcription results.

### Setup Steps:

1. **Create OpenAI Account**
   - Go to https://platform.openai.com/
   - Sign up or log in to your account

2. **Generate API Key**
   - Navigate to https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

3. **Add to Environment**
   \`\`\`bash
   OPENAI_API_KEY=sk-your-actual-api-key-here
   \`\`\`

4. **Pricing**
   - $0.006 per minute of audio
   - Very cost-effective for most use cases

---

## 🔄 Alternative: AssemblyAI

AssemblyAI offers excellent transcription with speaker detection.

### Setup Steps:

1. **Create AssemblyAI Account**
   - Go to https://www.assemblyai.com/
   - Sign up for a free account

2. **Get API Key**
   - Go to your dashboard
   - Copy your API key

3. **Add to Environment**
   \`\`\`bash
   ASSEMBLY_AI_API_KEY=your-assemblyai-api-key-here
   \`\`\`

4. **Features**
   - Speaker detection
   - Automatic punctuation
   - Free tier available

---

## ☁️ Alternative: Google Cloud Speech-to-Text

Google Cloud offers robust speech recognition capabilities.

### Setup Steps:

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com/
   - Create a new project

2. **Enable Speech-to-Text API**
   - Navigate to APIs & Services
   - Enable "Cloud Speech-to-Text API"

3. **Create Service Account**
   - Go to IAM & Admin > Service Accounts
   - Create a new service account
   - Download the JSON credentials file

4. **Add to Environment**
   \`\`\`bash
   GOOGLE_APPLICATION_CREDENTIALS=./config/google-credentials.json
   \`\`\`

---

## 🚀 Quick Start

1. **Copy environment file**
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. **Add your API key** (choose one)
   \`\`\`bash
   # For OpenAI (recommended)
   OPENAI_API_KEY=sk-your-key-here
   
   # OR for AssemblyAI
   ASSEMBLY_AI_API_KEY=your-key-here
   
   # OR for Google Cloud
   GOOGLE_APPLICATION_CREDENTIALS=./config/google-credentials.json
   \`\`\`

3. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

4. **Start the server**
   \`\`\`bash
   npm run dev
   \`\`\`

## 🧪 Testing

Upload a video file to test transcription:

1. Start the frontend: `npm start`
2. Go to the Upload tab
3. Upload a video file
4. Check the transcription in the file details

## 💡 Tips

- **OpenAI Whisper** is most accurate but requires API credits
- **AssemblyAI** has a generous free tier
- **Google Cloud** offers $300 in free credits for new users
- The system falls back to mock transcription if no API keys are configured
\`\`\`

Now let's update the transcription service with better API key handling:
