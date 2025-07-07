const request = require('request');
const fs = require('fs');
const path = require("path")
const OpenAI = require("openai")
const ffmpegPath = 'C:/ffmpeg-7.1.1-essentials_build/bin/ffmpeg.exe'
const ffprobePath = 'C:/ffmpeg-7.1.1-essentials_build/bin/ffprobe.exe'
const { GoogleGenerativeAI } = require("@google/generative-ai")
const ffmpeg = require("fluent-ffmpeg");
const { default: axios } = require("axios")
ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)

class TranscriptionService {
    constructor() {
        // Initialize AI services
        this.openaiApiKey = process.env.OPENAI_API_KEY
        this.googleApiKey = process.env.GOOGLE_CLOUD_API_KEY
        this.assemblyAiApiKey = process.env.ASSEMBLY_AI_API_KEY
        this.geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY

        // Initialize Google Gemini
        if (this.geminiApiKey) {
            this.genAI = new GoogleGenerativeAI(this.geminiApiKey)
            this.geminiModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        }
    }

    async transcribeVideo(videoPath) {
        try {
            console.log("🎬 Starting video transcription...")

            // Extract audio from video
            const audioPath = await this.extractAudio(videoPath)

            let transcription = null

            // Try different transcription services in order of preference
            if (this.assemblyAiApiKey) {
                console.log("🤖 Using AssemblyAI for transcription...")
                transcription = await this.transcribeWithAssemblyAI(audioPath)
            }
            else if (this.geminiApiKey) {
                console.log("🤖 Using Google Gemini for transcription...")
                transcription = await this.transcribeWithGemini(audioPath)
            } else if (this.openaiApiKey) {
                console.log("🤖 Using OpenAI Whisper for transcription...")
                transcription = await this.transcribeWithOpenAI(audioPath)
            } else if (this.googleApiKey) {
                console.log("🤖 Using Google Cloud Speech for transcription...")
                transcription = await this.transcribeWithGoogleCloud(audioPath)
            } else {
                console.log("🎭 Using mock transcription (no API keys configured)...")
                transcription = this.generateMockTranscription()
            }

            // Clean up temporary audio file
            if (fs.existsSync(audioPath)) {
                fs.unlinkSync(audioPath)
            }

            console.log("✅ Transcription completed!")
            return transcription
        } catch (error) {
            console.error("❌ Transcription failed:", error)
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
                .on("end", () => {
                    console.log("🎵 Audio extracted successfully")
                    resolve(audioPath)
                })
                .on("error", (error) => {
                    console.error("❌ Audio extraction failed:", error)
                    reject(error)
                })
                .run()
        })
    }

    async transcribeWithGemini(audioPath) {
        try {
            // Convert audio to base64
            const audioBuffer = fs.readFileSync(audioPath)
            const audioBase64 = audioBuffer.toString("base64")

            const prompt = `
        Please transcribe the following audio content. 
        Provide a natural, readable transcription with proper punctuation.
        Focus on clarity and accuracy.
        
        Audio data: ${audioBase64}
      `

            const result = await this.geminiModel.generateContent(prompt)
            const response = await result.response
            const text = response.text()

            return text || this.generateMockTranscription()
        } catch (error) {
            console.error("Google Gemini transcription failed:", error)
            throw error
        }
    }

    async transcribeWithOpenAI(audioPath) {
        try {
            const openai = new OpenAI();
            const transcription = await openai.audio.transcriptions.create({
                file: fs.createReadStream(audioPath),
                model: "gpt-4o-mini-transcribe",
            });
            console.log("transcription: ", transcription);

            console.log("Transcription Text: ", transcription.text);
            return transcription.text;
        } catch (error) {
            console.error("OpenAI transcription failed:", error)
            throw error
        }
    }

    async analyzeImageContent(imagePath) {
        console.log("Analyzing image content From API Ninjas...");

        return new Promise((resolve, reject) => {
            const formData = {
                image: fs.createReadStream(imagePath)
            };

            request.post({
                url: 'https://api.api-ninjas.com/v1/imagetotext',
                headers: {
                    'X-Api-Key': 'HlaHMDtagXdz+tEQf82P4A==eaqfwoTdO72VtfQ1'
                },
                formData: formData
            }, (error, response, body) => {
                if (error) {
                    console.error('Request failed:', error);
                    return reject(error);
                } else if (response.statusCode !== 200) {
                    console.error('Error:', response.statusCode, body.toString('utf8'));
                    return reject(new Error('Failed with status ' + response.statusCode));
                } else {
                    const jsonResponse = JSON.parse(body);
                    const extractedText = jsonResponse.map(item => item.text).join(" ");
                    return resolve(extractedText);
                }
            });
        });
    }

    async transcribeWithAssemblyAI(audioPath) {
        try {
            const BaseUrl = "https://api.assemblyai.com/v2";
            const headers = {
                authorization: this.assemblyAiApiKey,
                "content-type": "application/json"
            }
            const uploadResponse = await axios.post(
                `${BaseUrl}/upload`,
                fs.createReadStream(audioPath),
                {
                    headers: {
                        authorization: headers.authorization,
                        'Transfer-Encoding': 'chunked',
                    }
                }
            );

            const uploadUrl = uploadResponse.data.upload_url;
            const data = {
                audio_url: uploadUrl, // For local files use: audio_url: uploadUrl
                speech_model: "slam-1",
            };
            const url = `${BaseUrl}/transcript`;
            let transcriptId;
            try {
                const transcriptResponse = await axios.post(url, data, { headers });
                transcriptId = transcriptResponse?.data.id;
            } catch (error) {
                console.error("Error from POST '/transcript' request:", error);
            }
            const pollingEndpoint = `${BaseUrl}/transcript/${transcriptId}`;
            let transcriptionResult;
            while (true) {
                const pollingResponse = await axios.get(pollingEndpoint, { headers });
                transcriptionResult = pollingResponse.data;
                if (transcriptionResult.status === "completed") {
                    console.log(`\nFull Transcript:\n\n${transcriptionResult.text}\n`);
                    break;
                } else if (transcriptionResult.status === "error") {
                    throw new Error(`Transcription failed: ${transcriptionResult.error}`);
                } else {
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                }
            }

            return await transcriptionResult.text;
        } catch (error) {
            console.error(error.stack);
            throw error
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

    async getVideoDuration(videoPath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
                if (err) {
                    console.error("Error getting video duration:", err)
                    resolve("2:30") // Default duration
                    return
                }

                const duration = metadata.format.duration
                const minutes = Math.floor(duration / 60)
                const seconds = Math.floor(duration % 60)
                resolve(`${minutes}:${seconds.toString().padStart(2, "0")}`)
            })
        })
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
            "The food here is amazing! We should definitely come back to this restaurant again sometime soon.",
            "I can't believe how fast this year has gone by. It feels like we were just celebrating New Year's yesterday.",
        ]

        return transcriptions[Math.floor(Math.random() * transcriptions.length)]
    }

    simulateLocationDetection() {
        const locations = [
            "Home",
            "Central Park, New York",
            "Santa Monica Beach, CA",
            "Times Square, NYC",
            "Golden Gate Bridge, SF",
            "Miami Beach, FL",
            "Downtown Chicago",
            "Las Vegas Strip",
            "Hollywood, CA",
            "Brooklyn Bridge, NY",
            "Yosemite National Park",
            "Grand Canyon, AZ",
            "Yellowstone National Park",
            "Niagara Falls",
            "Mount Rushmore, SD",
        ]

        return locations[Math.floor(Math.random() * locations.length)]
    }

    simulatePeopleDetection() {
        const peopleGroups = [
            ["John", "Sarah"],
            ["Mom", "Dad", "Kids"],
            ["Friends"],
            ["Family"],
            ["Alex", "Jordan"],
            ["Mike", "Lisa", "Tom"],
            ["Grandma", "Grandpa"],
            ["Colleagues"],
            ["Emma", "Liam"],
            ["Sophie", "James", "Olivia"],
        ]

        return peopleGroups[Math.floor(Math.random() * peopleGroups.length)]
    }

    async analyzeVideoContent(videoPath) {
        // Mock computer vision analysis
        const objects = [
            ["person", "outdoor", "sky", "nature"],
            ["people", "indoor", "furniture", "celebration"],
            ["family", "beach", "ocean", "sunset"],
            ["friends", "restaurant", "food", "dining"],
            ["children", "playground", "toys", "fun"],
            ["pets", "park", "grass", "playing"],
            ["travel", "landmark", "architecture", "tourism"],
            ["sports", "field", "equipment", "activity"],
        ]

        const emotions = [
            ["happy", "excited", "joyful"],
            ["peaceful", "relaxed", "content"],
            ["surprised", "amazed", "delighted"],
            ["loving", "caring", "warm"],
            ["energetic", "enthusiastic", "lively"],
        ]

        const scenes = ["outdoor", "indoor", "beach", "park", "home", "restaurant", "office", "travel"]

        return {
            objects: objects[Math.floor(Math.random() * objects.length)],
            emotions: emotions[Math.floor(Math.random() * emotions.length)],
            scene: scenes[Math.floor(Math.random() * scenes.length)],
            people_count: Math.floor(Math.random() * 5) + 1,
            confidence: 0.85 + Math.random() * 0.15,
        }
    }
}

module.exports = new TranscriptionService()
