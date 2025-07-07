"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Progress } from "./ui/progress"
import { Badge } from "./ui/badge"
import { Upload, FileVideo, ImageIcon, X, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import apiService from "../services/api"

export function FileUpload({ onFilesUploaded, maxFiles = 10, acceptedTypes = "video/*,image/*" }) {
    const [isDragOver, setIsDragOver] = useState(false)
    const [uploadQueue, setUploadQueue] = useState([])
    const [isUploading, setIsUploading] = useState(false)
    const [isOfflineMode, setIsOfflineMode] = useState(false)
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

    const getVideoThumbnail = (file) => {
        // For video files, use a generic video thumbnail from Unsplash
        const videoThumbnails = [
            "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=120&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200&h=120&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=200&h=120&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=120&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=120&fit=crop&auto=format",
        ]

        // Use file name hash to consistently pick the same thumbnail for the same file
        const hash = file.name.split("").reduce((a, b) => {
            a = (a << 5) - a + b.charCodeAt(0)
            return a & a
        }, 0)

        return videoThumbnails[Math.abs(hash) % videoThumbnails.length]
    }

    const handleFiles = async (files) => {
        const validFiles = files
            .filter((file) => {
                const isVideo = file.type.startsWith("video/")
                const isImage = file.type.startsWith("image/")
                return isVideo || isImage
            })
            .slice(0, maxFiles)

        if (validFiles.length === 0) return

        // Add files to upload queue
        const queueItems = validFiles.map((file) => ({
            id: Date.now() + Math.random(),
            file,
            progress: 0,
            status: "pending",
            preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : getVideoThumbnail(file),
            error: null,
        }))

        setUploadQueue(queueItems)
        await startUpload(validFiles, queueItems)
    }

    const startUpload = async (files, queueItems) => {
        setIsUploading(true)

        try {
            // Update status to uploading
            setUploadQueue((prev) => prev.map((q) => ({ ...q, status: "uploading" })))

            // Simulate progress for UI
            for (let progress = 0; progress <= 90; progress += 10) {
                setUploadQueue((prev) => prev.map((q) => ({ ...q, progress })))
                await new Promise((resolve) => setTimeout(resolve, 100))
            }

            // Try to upload files to backend
            const response = await apiService.uploadFiles(files)

            // Mark as completed
            setUploadQueue((prev) => prev.map((q) => ({ ...q, status: "completed", progress: 100 })))

            // Notify parent component
            onFilesUploaded?.(response.files)

            // Clear queue after a delay
            setTimeout(() => {
                setUploadQueue([])
            }, 2000)
        } catch (error) {
            console.error("Upload failed:", error)

            // Check if it's a network error (backend not running)
            if (
                error.message.includes("fetch") ||
                error.message.includes("NetworkError") ||
                error.message.includes("Failed to fetch") ||
                error.message.includes("Server is not reachable")
            ) {
                setIsOfflineMode(true)
                // Generate mock data for offline mode
                const mockFiles = generateMockFiles(files)

                setUploadQueue((prev) =>
                    prev.map((q) => ({
                        ...q,
                        status: "completed",
                        progress: 100,
                        error: null,
                    })),
                )

                onFilesUploaded?.(mockFiles)

                setTimeout(() => {
                    setUploadQueue([])
                }, 2000)
            } else {
                // Mark as error for other types of errors
                setUploadQueue((prev) =>
                    prev.map((q) => ({
                        ...q,
                        status: "error",
                        error: error.message,
                    })),
                )
            }
        } finally {
            setIsUploading(false)
        }
    }

    const generateMockFiles = (files) => {
        const mockTags = ["family", "vacation", "happy", "outdoor", "celebration", "friends"]
        const mockLocations = ["Home", "Beach", "Park", "City", "Restaurant", "Office"]
        const mockPeople = [["John", "Sarah"], ["Mom", "Dad"], ["Friends"], ["Family"]]
        const mockTranscriptions = [
            "This is such a beautiful day! We're having an amazing time together.",
            "Look at this incredible view! This place is absolutely stunning.",
            "Happy birthday! This is such a special day.",
            "I love spending time with family and friends like this.",
        ]

        return files.map((file, index) => ({
            id: `mock-${Date.now()}-${index}`,
            name: file.name,
            type: file.type.startsWith("video/") ? "video" : "image",
            size: formatFileSize(file.size),
            duration: file.type.startsWith("video/") ? "2:30" : null,
            transcription: file.type.startsWith("video/")
                ? mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)]
                : null,
            tags: mockTags.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 2),
            location: mockLocations[Math.floor(Math.random() * mockLocations.length)],
            people: mockPeople[Math.floor(Math.random() * mockPeople.length)],
            timestamp: new Date().toLocaleString(),
            thumbnail: file.type.startsWith("image/") ? URL.createObjectURL(file) : getVideoThumbnail(file),
            url: file.type.startsWith("image/") ? URL.createObjectURL(file) : getVideoThumbnail(file),
        }))
    }

    const retryUpload = async (itemId) => {
        const item = uploadQueue.find((q) => q.id === itemId)
        if (!item) return

        setUploadQueue((prev) =>
            prev.map((q) => (q.id === itemId ? { ...q, status: "pending", error: null, progress: 0 } : q)),
        )

        await startUpload([item.file], [item])
    }

    const removeFromQueue = (id) => {
        setUploadQueue((prev) => prev.filter((item) => item.id !== id))
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    return (
        <div className="space-y-4">
            {/* Offline Mode Banner */}
            {isOfflineMode && (
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <div>
                            <p className="font-medium text-yellow-800">Demo Mode</p>
                            <p className="text-sm text-yellow-700">
                                Backend server not available. Using mock data for demonstration.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${isDragOver ? "border-purple-400 bg-purple-50" : "border-gray-300 hover:border-purple-400"
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-lg font-medium">Drop files here or click to upload</p>
                        <p className="text-gray-500">Supports MP4, MOV, JPG, PNG files (max {maxFiles} files)</p>
                    </div>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedTypes}
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Upload Queue */}
            {uploadQueue.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-medium">Upload Progress</h3>
                    {uploadQueue.map((item) => (
                        <Card key={item.id} className="p-4">
                            <div className="flex items-center space-x-4">
                                {/* File Preview */}
                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                                    {item.preview ? (
                                        <img
                                            src={item.preview || "/placeholder.svg"}
                                            alt={item.file.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // Fallback to icon if image fails to load
                                                e.target.style.display = "none"
                                                e.target.nextSibling.style.display = "block"
                                            }}
                                        />
                                    ) : null}
                                    <div className="text-gray-400" style={{ display: item.preview ? "none" : "block" }}>
                                        {item.file.type.startsWith("video/") ? (
                                            <FileVideo className="w-6 h-6" />
                                        ) : (
                                            <ImageIcon className="w-6 h-6" />
                                        )}
                                    </div>
                                </div>

                                {/* File Info */}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm truncate pr-2">{item.file.name}</span>
                                        <div className="flex items-center space-x-2">
                                            {item.status === "completed" && <CheckCircle className="w-4 h-4 text-green-500" />}
                                            {item.status === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
                                            <Badge
                                                variant={
                                                    item.status === "completed"
                                                        ? "default"
                                                        : item.status === "uploading"
                                                            ? "secondary"
                                                            : item.status === "error"
                                                                ? "destructive"
                                                                : "outline"
                                                }
                                            >
                                                {item.status}
                                            </Badge>
                                            {item.status === "error" && (
                                                <Button variant="ghost" size="sm" onClick={() => retryUpload(item.id)} className="h-6 w-6 p-0">
                                                    <RefreshCw className="w-3 h-3" />
                                                </Button>
                                            )}
                                            {item.status !== "completed" && item.status !== "uploading" && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFromQueue(item.id)}
                                                    className="h-6 w-6 p-0"
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {item.status === "uploading" && (
                                        <div className="space-y-1">
                                            <Progress value={item.progress} className="h-2" />
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>{formatFileSize(item.file.size)}</span>
                                                <span>{item.progress}%</span>
                                            </div>
                                        </div>
                                    )}

                                    {item.status === "completed" && (
                                        <div className="text-xs text-green-600">✓ Upload complete - AI processing finished</div>
                                    )}

                                    {item.status === "error" && (
                                        <div className="text-xs text-red-600">✗ {item.error || "Upload failed - Please try again"}</div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Upload Summary */}
            {isUploading && (
                <Card className="p-4 bg-blue-50">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Upload className="w-4 h-4 text-blue-600 animate-pulse" />
                        </div>
                        <div>
                            <p className="font-medium text-blue-900">Processing uploads...</p>
                            <p className="text-sm text-blue-700">AI is analyzing your content for transcription and tagging</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}
