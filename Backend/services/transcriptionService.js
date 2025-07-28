const request = require('request');
const fs = require('fs');
const path = require("path")
const OpenAI = require("openai")
const ffmpegPath = 'C:/ffmpeg-7.1.1-essentials_build/bin/ffmpeg.exe'
const ffprobePath = 'C:/ffmpeg-7.1.1-essentials_build/bin/ffprobe.exe'
const { GoogleGenerativeAI } = require("@google/generative-ai")
const ffmpeg = require("fluent-ffmpeg");
const { default: axios } = require("axios");
const { envConfig } = require('../config/envConfig');
ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)
const genAI = require("@google/genai");


const GoogleGenAI = genAI.GoogleGenAI;

class TranscriptionService {
    constructor() {
        // Initialize AI services
        this.openaiApiKey = envConfig.API_Keys.openaiApiKey
        this.googleApiKey = envConfig.API_Keys.googleApiKey
        this.assemblyAiApiKey = envConfig.API_Keys.assemblyAiApiKey
        this.geminiApiKey = envConfig.API_Keys.geminiApiKeyF

        // Initialize Google Gemini
        if (this.geminiApiKey) {
            this.genAI = new GoogleGenerativeAI(this.geminiApiKey)
            this.geminiModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        }
    }

    async transcribeVideo(videoPath) {
        try {
            const audioPath = await this.extractAudio(videoPath)
            let transcription = null
            if (this.assemblyAiApiKey) transcription = await this.transcribeWithAssemblyAI(audioPath)
            else if (this.geminiApiKey) transcription = await this.transcribeWithGemini(audioPath)
            else if (this.openaiApiKey) transcription = await this.transcribeWithOpenAI(audioPath)
            else if (this.googleApiKey) transcription = await this.transcribeWithGoogleCloud(audioPath)
            else transcription = this.generateMockTranscription()

            // Clean up temporary audio file
            if (fs.existsSync(audioPath)) {
                fs.unlinkSync(audioPath)
            }
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
                    resolve(audioPath)
                })
                .on("error", (error) => {
                    console.error("❌ Audio extraction failed:", error)
                    return reject(new Error(error?.message || "Failed to get video duration"));
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

        return new Promise((resolve, reject) => {
            const formData = {
                image: fs.createReadStream(imagePath)
            };

            request.post({
                url: envConfig.url.ninjasImageConvertUrl,
                headers: {
                    'X-Api-Key': envConfig.API_Keys.ninjasImageConvertKey
                },
                formData: formData
            }, (error, response, body) => {
                if (error) {
                    console.error('Request failed:', error);
                    return reject(error?.message || "Error while Fetching Text From Image");
                } else if (response.statusCode !== 200) {
                    console.error('Error:', response.statusCode, body.toString('utf8'));
                    return reject(new Error('Image Convert Failed with status ' + response.statusCode));
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
            const BaseUrl = envConfig.url.assemblyAIBaseUrl;
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
                audio_url: uploadUrl,
                speech_model: "slam-1",
            };
            const url = `${BaseUrl}/transcript`;
            let transcriptId;
            try {
                const transcriptResponse = await axios.post(url, data, { headers });
                transcriptId = transcriptResponse?.data.id;
            } catch (error) {
                console.error("Error from POST '/transcript' request:", error);
                throw new Error(error?.message || "Error from POST /Transaction Assembly API");
            }
            const pollingEndpoint = `${BaseUrl}/transcript/${transcriptId}`;
            let transcriptionResult;
            while (true) {
                const pollingResponse = await axios.get(pollingEndpoint, { headers });
                transcriptionResult = pollingResponse.data;
                if (transcriptionResult.status === "completed") {
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
                keyFilename: envConfig.API_Keys.googleApplicationCredentials,
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
            throw new Error(error?.message || "Google Cloud transcription Failed");
        }
    }

    async getVideoDuration(videoPath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
                if (err) {
                    console.error("Error getting video duration:", err);
                    return reject(new Error(err?.message || "Failed to get video duration"));
                }

                const duration = metadata.format.duration
                const minutes = Math.floor(duration / 60)
                const seconds = Math.floor(duration % 60)
                resolve(`${minutes}:${seconds.toString().padStart(2, "0")}`)
            })
        })
    }

    async getLabelsAndSubtitle(transcription) {
        return new Promise(async (resolve, reject) => {
            try {
                const ai = new GoogleGenAI({
                    apiKey: envConfig.API_Keys.googleGenAPIKey,
                });

                const fullPrompt_Labels = `You are a content tagging assistant. Your job is to extract meaningful labels from transcripts. 
Extract a concise list of relevant labels (keywords or tags) from the following transcription. The labels should represent important names, places, fields of study, interests, goals, and any other significant terms. Exclude common stopwords and avoid duplications. Output the labels as a plain list without categorization.

Transcription:
${transcription}`;

                const fullPrompt_Subtitle = `You are a title generation assistant. Given the following transcription, generate a short, meaningful, and engaging subtitle that summarizes the speaker's core message, goals, or focus. Keep it concise, ideally under 12 words.

Transcription:
${transcription}`;

                // Get Labels
                const responseLabels = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: [{ parts: [{ text: fullPrompt_Labels }] }],
                });
                const labels = responseLabels.candidates?.[0]?.content?.parts?.map(p => p.text).join(" ").trim();

                // Get Subtitle
                const responseSubtitle = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: [{ parts: [{ text: fullPrompt_Subtitle }] }],
                });
                const subtitle = responseSubtitle.candidates?.[0]?.content?.parts?.map(p => p.text).join(" ").trim();
                return resolve({ labels, subtitle });

            } catch (error) {
                console.error("Error while Getting Labels/Subtitle from Transcription: ", error);
                return reject(error?.message || "Error while getting labels and subtitle.");
            }
        });
    }

}

module.exports = new TranscriptionService()
