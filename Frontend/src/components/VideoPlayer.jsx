"use client"

import { useState, useRef } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Slider } from "./ui/slider"
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react"

export function VideoPlayer({ src, title, onTimeUpdate, className }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const videoRef = useRef(null)

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime
            setCurrentTime(current)
            onTimeUpdate?.(current)
        }
    }

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration)
        }
    }

    const handleSeek = (value) => {
        if (videoRef.current) {
            const newTime = (value[0] / 100) * duration
            videoRef.current.currentTime = newTime
            setCurrentTime(newTime)
        }
    }

    const handleVolumeChange = (value) => {
        const newVolume = value[0] / 100
        setVolume(newVolume)
        if (videoRef.current) {
            videoRef.current.volume = newVolume
        }
    }

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    const skip = (seconds) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds
        }
    }

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    return (
        <Card className={`overflow-hidden bg-black ${className}`}>
            <div className="relative group">
                <video
                    ref={videoRef}
                    src={src}
                    className="w-full h-auto"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />

                {/* Video Controls Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                        {/* Progress Bar */}
                        <div className="space-y-1">
                            <Slider
                                value={[duration ? (currentTime / duration) * 100 : 0]}
                                onValueChange={handleSeek}
                                max={100}
                                step={0.1}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-white">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => skip(-10)} className="text-white hover:bg-white/20">
                                    <SkipBack className="w-4 h-4" />
                                </Button>

                                <Button variant="ghost" size="sm" onClick={togglePlay} className="text-white hover:bg-white/20">
                                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                </Button>

                                <Button variant="ghost" size="sm" onClick={() => skip(10)} className="text-white hover:bg-white/20">
                                    <SkipForward className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="flex items-center space-x-2">
                                {/* Volume Control */}
                                <div className="flex items-center space-x-2">
                                    <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-white/20">
                                        {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                    </Button>
                                    <div className="w-20">
                                        <Slider
                                            value={[isMuted ? 0 : volume * 100]}
                                            onValueChange={handleVolumeChange}
                                            max={100}
                                            step={1}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => videoRef.current?.requestFullscreen()}
                                    className="text-white hover:bg-white/20"
                                >
                                    <Maximize className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Play Button Overlay */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={togglePlay}
                            className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 text-white"
                        >
                            <Play className="w-8 h-8 ml-1" />
                        </Button>
                    </div>
                )}
            </div>

            {title && (
                <div className="p-4 bg-white">
                    <h3 className="font-medium text-gray-900">{title}</h3>
                </div>
            )}
        </Card>
    )
}
