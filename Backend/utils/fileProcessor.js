const ffmpeg = require("fluent-ffmpeg")
const path = require("path")
const fs = require("fs")

class FileProcessor {
    static async generateThumbnail(videoPath, outputPath) {
        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .screenshots({
                    timestamps: ["00:00:02"],
                    filename: "thumbnail.jpg",
                    folder: path.dirname(outputPath),
                    size: "200x120",
                })
                .on("end", () => {
                    resolve(outputPath)
                })
                .on("error", (err) => {
                    reject(err)
                })
        })
    }

    static async getVideoDuration(videoPath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
                if (err) {
                    reject(err)
                } else {
                    const duration = metadata.format.duration
                    const minutes = Math.floor(duration / 60)
                    const seconds = Math.floor(duration % 60)
                    resolve(`${minutes}:${seconds.toString().padStart(2, "0")}`)
                }
            })
        })
    }

    static async extractAudio(videoPath, outputPath) {
        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .output(outputPath)
                .audioCodec("libmp3lame")
                .noVideo()
                .on("end", () => {
                    resolve(outputPath)
                })
                .on("error", (err) => {
                    reject(err)
                })
                .run()
        })
    }
}

module.exports = FileProcessor
