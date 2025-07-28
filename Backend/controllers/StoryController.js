const { sequelize } = require("../database/db");
const googleService = require("../services/GoogleVisionService");
const genAI = require("@google/genai");
const { Story } = require("../models");
const { envConfig } = require("../config/envConfig");
const { v4: uuidv4 } = require('uuid');

const GoogleGenAI = genAI.GoogleGenAI;

const generateStory = async (req, res) => {
    let transaction;
    let generateVideoUrl = null;
    try {
        transaction = await sequelize.transaction();
        const { story, prompt } = req.body;
        if (story?.file_type == 'image') {
            const result = await googleService.generateVideo(story, prompt);
            if (result?.success) {
                generateVideoUrl = result.videoPath;
            } else {
                return res.status(400).json({ error: "Failed to generate video from image." });
            }
        }
        const ai = new GoogleGenAI({
            apiKey: envConfig.API_Keys.googleGenAPIKey,
        });
        const transcription = story?.transcription || "This is a mock transcription for the story.";
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }
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
        let storyObj = {};
        if (story) {
            storyObj = {
                id: uuidv4(),
                user_id: req.user?.id || null,
                title: story?.title || null,
                description:
                    storyText ||
                    "This is a generated story based on your prompt and transcript.",
                prompt: prompt || null,
                uploadFile: story?.thumbnail_path || null,
                video_path: generateVideoUrl || null,
                status: "completed",
            };
            createdStories = await Story.create(storyObj, { transaction });
            await transaction.commit();
        } else {
            storyObj = {
                id: uuidv4(),
                user_id: req.user?.id || null,
                title: "Generated Story",
                description: storyText || "This is a generated story based on your prompt and transcript.",
                prompt: prompt || null,
                uploadFile: null,
                video_path: generateVideoUrl || null,
                status: "completed",
            };
            createdStories = await Story.create(storyObj, { transaction });
            await transaction.commit();
        }
        return res.json({
            message: "Story generated successfully",
            story: createdStories,
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Error while Generating the Story: ", error);
        return res.status(500).json({ message: error?.message || "Error while Generating the Story", success: false })
    }
}

const getStories = async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();
        const stories = await Story.findAll({ transaction });
        await transaction.commit();
        return res.json({
            message: "Stories fetched successfully",
            stories,
            success: true,
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
        return res
            .status(500)
            .json({
                message: error?.message || "Error while Fetching the Stories",
                success: false,
            });
    }
}


module.exports = {
    generateStory, getStories
}