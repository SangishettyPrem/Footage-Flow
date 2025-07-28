const { fal } = require("@fal-ai/client");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

class FALAIService {
    async generateVideo(story, prompt) {
        return new Promise(async (resolve, reject) => {
            try {
                fal.config({});

                if (!story?.thumbnail_path || !prompt) {
                    return reject("Provide the Thumbnail and Prompt");
                }
                const localPath = path.join(__dirname, '..', story.thumbnail_path);
                const fileBuffer = fs.readFileSync(localPath);
                const fileBlob = new Blob([fileBuffer]);
                const uploadedUrl = await fal.storage.upload(fileBlob);

                const result = await fal.subscribe('fal-ai/vidu/q1/reference-to-video', {
                    input: {
                        prompt,
                        reference_image_urls: [uploadedUrl],
                        aspect_ratio: '16:9',
                        movement_amplitude: 'auto',
                    },
                    logs: true,
                    onQueueUpdate: update => {
                        if (update.status === 'IN_PROGRESS') {
                            update.logs.forEach(log => console.log('[fal.ai]', log.message));
                        }
                    },
                });
                console.log("result?.data: ", result?.data);
                const videoUrl = result?.data?.video?.url;
                if (!videoUrl) return reject("Video URL not returned from fal.ai");
                return resolve(videoUrl);

            } catch (error) {
                console.log("❌ Error while Fetching Video from Fal AI: ", error);
                return reject(error?.message || "Error while Fetching Video from Fal AI");
            }
        });
    }

    async saveVideoToLocal(videoUrl, story) {
        try {
            const outputDir = path.join(__dirname, '..', 'uploads', 'stories', `${story?.user_id}`);
            console.log("outputDir: ", outputDir);
            fs.mkdirSync(outputDir, { recursive: true });

            const filePath = path.join(outputDir, story?.title);
            const writer = fs.createWriteStream(filePath);

            const response = await axios({
                url: videoUrl,
                method: 'GET',
                responseType: 'stream',
            });

            response.data.pipe(writer);
            const normalizedPath = filePath.replace(/\\/g, '/');
            const uploadsIndex = normalizedPath.indexOf('/uploads');
            const relativePath = normalizedPath.substring(uploadsIndex + '/uploads'.length);
            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    resolve(relativePath);
                });

                writer.on('error', error => {
                    reject(error);
                });
            });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new FALAIService();