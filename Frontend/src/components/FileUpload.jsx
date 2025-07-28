import { useState, useRef, useCallback } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Progress } from "./ui/progress"
import { Upload, AlertCircle } from "lucide-react"
import { uploadFiles } from "../services/fileService"
import { useAuth } from "../contexts/AuthContext"

const FileUpload = ({ maxFiles = 1, acceptedTypes = "video/*,image/*" }) => {
    const { setFiles } = useAuth();
    const [isDragOver, setIsDragOver] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState(null)
    const fileInputRef = useRef(null)

    const handleDragOver = useCallback((e) => {
        e.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e) => {
        e.preventDefault()
        setIsDragOver(false)
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        setIsDragOver(false)
        const files = Array.from(e.dataTransfer.files)
        handleFiles(files)
    }, [])

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files)
        handleFiles(files)
    }

    const handleFiles = async (files) => {
        // Clear previous error and reset progress
        setError(null)
        setProgress(0)

        // Filter valid files
        const validFiles = files
            .filter((file) => {
                const isVideo = file.type.startsWith("video/")
                const isImage = file.type.startsWith("image/")
                return isVideo || isImage
            })
            .slice(0, maxFiles)

        if (validFiles.length === 0) {
            setError("Please select valid video or image files")
            return
        }
        setIsUploading(true)

        try {
            for (let progressValue = 0; progressValue <= 90; progressValue += 10) {
                setProgress(progressValue)
                await new Promise((resolve) => setTimeout(resolve, 100))
            }

            const response = await uploadFiles(validFiles)
            setFiles((prev) => [response?.data?.files, ...prev]);
            setProgress(100)

            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
            setTimeout(() => {
                setProgress(0)
            }, 1000)
        } catch (error) {
            console.error("Upload failed:", error)
            setError(error.response?.data?.message || error.response?.data?.error || error?.message || "Upload failed - Please try again")
            setProgress(0)
        } finally {
            setIsUploading(false)
        }
    }

    const clearError = () => {
        setError(null)
        setProgress(0)
    }

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${isDragOver
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-300 hover:border-purple-400"
                    } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
            >
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                        <Upload className={`w-8 h-8 text-purple-600 ${isUploading ? "animate-pulse" : ""}`} />
                    </div>
                    <div>
                        <p className="text-lg font-medium">
                            {isUploading ? "Uploading..." : "Drop files here or click to upload"}
                        </p>
                        <p className="text-gray-500">
                            Supports MP4, MOV, JPG, PNG files (max {maxFiles} file{maxFiles > 1 ? "s" : ""})
                        </p>
                    </div>
                </div>
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes}
                onChange={handleFileSelect}
                className="hidden"
                multiple={maxFiles > 1}
                disabled={isUploading}
            />

            {/* Loading State */}
            {isUploading && (
                <Card className="p-4 bg-blue-50">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Upload className="w-4 h-4 text-blue-600 animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-blue-900">Processing upload...</p>
                            <p className="text-sm text-blue-700 mb-2">AI is analyzing your content for transcription and tagging</p>

                            {/* Progress Bar */}
                            <div className="space-y-1">
                                <Progress value={progress} className="h-2" />
                                <div className="flex justify-between text-xs text-blue-600">
                                    <span>Uploading...</span>
                                    <span>{progress}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Error State */}
            {error && (
                <Card className="p-4 bg-red-50 border-red-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <div>
                                <p className="font-medium text-red-900">Upload Failed</p>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearError}
                            className="text-red-600 hover:text-red-700"
                        >
                            ×
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    )
}

export default FileUpload;