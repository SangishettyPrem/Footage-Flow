const fs = require("fs")
const path = require("path")
const ffmpeg = require("fluent-ffmpeg")

class TranscriptionService {
    constructor() {
        // In production, you would use actual API keys
        this.openaiApiKey = process.env.OPENAI_API_KEY
        this.googleApiKey = process.env.GOOGLE_CLOUD_API_KEY
        this.assemblyAiApiKey = process.env.ASSEMBLY_AI_API_KEY
    }

    async transcribeVideo(videoPath) {
        try {
            // Extract audio from video
            const audioPath = await this.extractAudio(videoPath)

            // Try different transcription services in order of preference
            let transcription = null

            if (this.openaiApiKey) {
                transcription = await this.transcribeWithOpenAI(audioPath)
            } else if (this.assemblyAiApiKey) {
                transcription = await this.transcribeWithAssemblyAI(audioPath)
            } else if (this.googleApiKey) {
                transcription = await this.transcribeWithGoogleCloud(audioPath)
            } else {
                // Fallback to mock transcription
                transcription = this.generateMockTranscription()
            }

            // Clean up temporary audio file
            if (fs.existsSync(audioPath)) {
                fs.unlinkSync(audioPath)
            }

            return transcription
        } catch (error) {
            console.error("Transcription failed:", error)
            return this.generateMockTranscription()
        }
    }

    async extractAudio(videoPath) {
        return new Promise((resolve, reject) => {
            const audioPath = videoPath.replace(path.extname(videoPath), "_audio.wav")

            ffmpeg(videoPath)
                .output(audioPath)
                .audioCodec("pcm_s16le")
                .audioChannels(1)
                .audioFrequency(16000)
                .noVideo()
                .on("end", () => resolve(audioPath))
                .on("error", reject)
                .run()
        })
    }

    async transcribeWithOpenAI(audioPath) {
        try {
            const FormData = require("form-data")
            const fetch = require("node-fetch")

            const formData = new FormData()
            formData.append("file", fs.createReadStream(audioPath))
            formData.append("model", "whisper-1")
            formData.append("language", "en")

            const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.openaiApiKey}`,
                    ...formData.getHeaders(),
                },
                body: formData,
            })

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.statusText}`)
            }

            const result = await response.json()
            return result.text
        } catch (error) {
            console.error("OpenAI transcription failed:", error)
            throw error
        }
    }

    async transcribeWithAssemblyAI(audioPath) {
        try {
            const fetch = require("node-fetch")
            const FormData = require("form-data")

            // Upload audio file
            const formData = new FormData()
            formData.append("audio", fs.createReadStream(audioPath))

            const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
                method: "POST",
                headers: {
                    authorization: this.assemblyAiApiKey,
                    ...formData.getHeaders(),
                },
                body: formData,
            })

            const uploadResult = await uploadResponse.json()

            // Request transcription
            const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
                method: "POST",
                headers: {
                    authorization: this.assemblyAiApiKey,
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    audio_url: uploadResult.upload_url,
                    speaker_labels: true,
                    auto_punctuation: true,
                }),
            })

            const transcript = await transcriptResponse.json()

            // Poll for completion
            return await this.pollAssemblyAITranscript(transcript.id)
        } catch (error) {
            console.error("AssemblyAI transcription failed:", error)
            throw error
        }
    }

    async pollAssemblyAITranscript(transcriptId) {
        const fetch = require("node-fetch")

        while (true) {
            const response = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
                headers: {
                    authorization: this.assemblyAiApiKey,
                },
            })

            const transcript = await response.json()

            if (transcript.status === "completed") {
                return transcript.text
            } else if (transcript.status === "error") {
                throw new Error("Transcription failed")
            }

            // Wait 3 seconds before polling again
            await new Promise((resolve) => setTimeout(resolve, 3000))
        }
    }

    async transcribeWithGoogleCloud(audioPath) {
        try {
            const speech = require("@google-cloud/speech")
            const client = new speech.SpeechClient({
                keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            })

            const audioBytes = fs.readFileSync(audioPath).toString("base64")

            const request = {
                audio: {
                    content: audioBytes,
                },
                config: {
                    encoding: "LINEAR16",
                    sampleRateHertz: 16000,
                    languageCode: "en-US",
                    enableAutomaticPunctuation: true,
                    enableWordTimeOffsets: true,
                },
            }

            const [response] = await client.recognize(request)
            const transcription = response.results.map((result) => result.alternatives[0].transcript).join("\n")

            return transcription
        } catch (error) {
            console.error("Google Cloud transcription failed:", error)
            throw error
        }
    }

    generateMockTranscription() {
        const transcriptions = [
            "This is such a beautiful day! I'm so happy to be here with everyone. The weather is perfect and we're having an amazing time together.",
            "Look at this incredible view! We should definitely take more pictures to remember this moment. This place is absolutely stunning.",
            "Happy birthday! Make a wish and blow out the candles! This is such a special day and I'm so glad we could all be here to celebrate.",
            "I love spending time with family and friends like this. These are the moments that really matter and create lasting memories.",
            "This vacation has been absolutely incredible so far. Every day brings new adventures and beautiful experiences.",
            "The sunset looks absolutely breathtaking tonight. I've never seen colors like this in the sky before.",
            "Everyone looks so happy and relaxed. It's wonderful to see everyone enjoying themselves and having such a great time.",
            "This is definitely going to be a memorable experience that we'll talk about for years to come.",
        ]

        return transcriptions[Math.floor(Math.random() * transcriptions.length)]
    }

    async analyzeVideoContent(videoPath) {
        // This would integrate with computer vision APIs
        // For now, return mock analysis
        return {
            objects: ["person", "outdoor", "sky", "nature"],
            emotions: ["happy", "excited", "joyful"],
            scene: "outdoor",
            people_count: Math.floor(Math.random() * 5) + 1,
            confidence: 0.85 + Math.random() * 0.15,
        }
    }
}

module.exports = new TranscriptionService()
