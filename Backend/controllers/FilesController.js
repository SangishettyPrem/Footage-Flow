
const { File, sequelize } = require('../models');
const transcriptionService = require('../services/transcriptionService');
const huggingFaceService = require('../services/HuggingFaceService');
const { v4: uuidv4 } = require('uuid');

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    return `${size} ${units[i]}`;
}


const getFiles = async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();
        const files = await File.findAll({ where: { user_id: req.user?.id }, order: [['created_at', 'DESC']], transaction });
        await transaction.commit();
        return res.status(200).json({ files, success: true });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Error while Fetching Files: ", error);
        return res.status(500).json({ error: error?.message || 'Error while Fetching Files.', success: false });
    }
};

const FileUpload = async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" })
        }

        for (const file of req?.files) {
            let transcription = null
            let duration = null
            let tags = null
            let title = null;

            // Process video files
            if (file.mimetype.startsWith("video/")) {
                try {
                    // Get video duration
                    duration = await transcriptionService.getVideoDuration(file.path)
                    // Generate transcription
                    transcription = await transcriptionService.transcribeVideo(file.path)
                    // Analyze video content
                    const LabelsTitle = await transcriptionService.getLabelsAndSubtitle(transcription);
                    tags = LabelsTitle?.labels?.split('\n');
                    title = LabelsTitle?.subtitle;
                } catch (error) {
                    await transaction.rollback();
                    console.error("Video processing failed:", error)
                    return res.status(500).json({ message: error?.message || "Error while Transcription the Video: ", success: false });
                }
            } else if (file.mimetype.startsWith("image/")) {
                try {
                    duration = "N/A"
                    transcription = await huggingFaceService.getImageCaption(file.path);
                    const LabelsTitle = await transcriptionService.getLabelsAndSubtitle(transcription);
                    tags = LabelsTitle?.labels?.split('\n');
                    title = LabelsTitle?.subtitle;
                } catch (error) {
                    await transaction.rollback();
                    console.error("Image processing failed:", error)
                    return res.status(500).json({ message: error?.message || "Error while Transcription the Video: ", success: false });
                }
            }

            const fileData = {
                id: uuidv4(),
                user_id: req.user?.id || null,
                title: title || null,
                file_size: formatFileSize(file.size) || 0,
                file_type: file.mimetype?.startsWith("video/") ? "video" : "image",
                duration: duration || null,
                transcription: transcription || null,
                tags: tags || [],
                thumbnail_path: `/uploads/${req.user?.id || "default"}/${file.filename}`,
                processing_status: "completed",
            }

            const UploadedFile = await File.create(fileData, { transaction });
            if (UploadedFile) {
                await transaction.commit();
                return res.json({
                    message: "File uploaded successfully",
                    files: UploadedFile?.dataValues,
                })
            }
            await transaction.commit();
            return res.json({
                message: "File Uploaded Successfully",
                files: []
            })
        }
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Error while Uploading Files: ", error);
        return res.status(500).json({ error: error?.message || 'Error while Fetching Files.', success: false });
    }
}

module.exports = {
    getFiles,
    FileUpload
}
