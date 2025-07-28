const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();
const { HarmCategory, HarmBlockThreshold } = require('@google/genai');
const fs = require('fs').promises;
const path = require('path');
const genAI = require("@google/genai");
const axios = require('axios');

const { envConfig } = require('../config/envConfig');
const GoogleGenAI = genAI.GoogleGenAI;

class GoogleVisionService {
    constructor() {
        this.VIDEO_DURATION_SECONDS = 5;
        this.ASPECT_RATIO = "16:9";

        this.veoGenerationConfig = {
            durationSeconds: this.VIDEO_DURATION_SECONDS,
            aspectRatio: this.ASPECT_RATIO
        };
        this.veoSafetySettings = [
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_PERSON_GENERATION, threshold: HarmBlockThreshold.BLOCK_NONE }
        ];
    }

    async analyzeImage(imagePath) {
        return await analyzeImage(imagePath);
    }

    async generateVideo(story, prompt) {
        try {
            const ai = new GoogleGenAI({
                apiKey: envConfig.API_Keys.googleGenAPIKey,
            });

            const imagePath = path.join(__dirname, '../', story?.thumbnail_path);
            let base64Image;

            if (story?.thumbnail_path.startsWith('http://') || story?.thumbnail_path.startsWith('https://')) {
                const response = await axios.get(story.thumbnail_path, { responseType: 'arraybuffer' });
                base64Image = Buffer.from(response.data).toString('base64');
            } else {
                const imageData = await fs.readFile(imagePath);
                base64Image = imageData.toString('base64');
            }
            let operation = await ai.models.generateVideos({
                model: "veo-2.0-generate-001",
                prompt,
                image: {
                    imageBytes: base64Image,
                    mimeType: "image/jpeg",
                },
                generationConfig: this.veoGenerationConfig,
                safetySettings: this.veoSafetySettings
            });

            while (!operation.done) {
                await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10 seconds
                try {
                    operation = await ai.operations.getVideosOperation({ operation: operation, });
                } catch (opError) {
                    console.error("Error checking video operation status:", opError);
                    throw new Error("Failed to get video generation operation status.");
                }
            }

            // Check if the operation completed successfully and has a response
            if (operation.error) {
                console.error("Video generation operation completed with an error:", operation.error);
                throw new Error(`Google Gemini API error during video generation: ${operation.error.message || 'Unknown error'}`);
            }

            const videoObj = operation.response?.generatedVideos?.[0].video;
            const videoUrl = videoObj?.uri;
            const videoDownloadUrl = `${videoUrl}&key=${envConfig.API_Keys.geminiApiKey}`;

            if (!videoDownloadUrl) throw new Error("⚠️ No video download URL found.");

            const videoResponse = await axios.get(videoDownloadUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(videoResponse.data);

            const uploadsDir = path.join(__dirname, '../uploads/stories', String(story.user_id));
            await fs.mkdir(uploadsDir, { recursive: true });

            const fileName = `${story.id}-veo.mp4`;
            const filePath = path.join(uploadsDir, fileName);
            await fs.writeFile(filePath, buffer);
            const relativePath = `/uploads/stories/${story.user_id}/${fileName}`;
            return { success: true, videoPath: relativePath };
        } catch (error) {
            console.error("❌ Error during video generation Google Gemini API:", error);
            return { success: false, videoPath: null, errorMessage: error.message }; // Return error message for better client feedback
        }
    }
}

const analyzeImage = async (imagePath) => {
    try {
        const [labelResult] = await client.labelDetection(imagePath);
        const [textResult] = await client.textDetection(imagePath);

        const labels = labelResult.labelAnnotations.map(label => ({
            description: label.description,
            score: label.score
        }));

        const ocrText = textResult.textAnnotations.length
            ? textResult.textAnnotations[0].description
            : '';

        return {
            success: true,
            labels,
            ocrText
        };
    } catch (error) {
        console.error("Google Vision API Error:", error);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = new GoogleVisionService();