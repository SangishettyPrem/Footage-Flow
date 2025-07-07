import { useState } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Sparkles, Zap, Eye, Mic, Film, FileVideo, ChevronDown, ChevronUp, Image, Upload, Check } from "lucide-react"
import MediaModal from "./ui/MediaModal"
import { IMAGE_BASE_URL } from "../services/api"

export function StoryGenerator({ isGenerating, files, onStoryGenerated }) {
  const [prompt, setPrompt] = useState("")
  const [generationProgress, setGenerationProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedTranscriptions, setExpandedTranscriptions] = useState({});
  const [selectedFileForModal, setSelectedFileForModal] = useState(null);

  const handleThumbnailClick = (file, event) => {
    event.stopPropagation();
    setSelectedFileForModal(file);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFileForModal(null);
  };

  const toggleTranscription = (fileId, event) => {
    event.stopPropagation();
    setExpandedTranscriptions(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }));
  };

  const toggleFileSelection = (file) => {
    if (selectedFile && selectedFile.id === file.id) {
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
    }
  };

  const truncateText = (text, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const truncateFileName = (name, maxLength = 20) => {
    if (name.length <= maxLength) return name;
    const extension = name.split('.').pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    const truncated = nameWithoutExt.substring(0, maxLength - extension.length - 4) + "...";
    return truncated + "." + extension;
  };

  const generationSteps = [
    { step: "analyzing", label: "Analyzing visuals", icon: Eye, color: "purple" },
    { step: "processing", label: "Processing audio", icon: Mic, color: "blue" },
    { step: "creating", label: "Creating story", icon: Film, color: "green" },
  ]

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedFile) return

    setGenerationProgress(0)

    try {
      onStoryGenerated?.(selectedFile)
      // Reset form
      setPrompt("")
      setSelectedFile(null)

    } catch (error) {
      console.error("Error generating story:", error);
      // Handle error appropriately
    } finally {
      setGenerationProgress(0)
      setCurrentStep("")
    }
  }

  return (
    <div className="space-y-6">
      {/* Story Prompt Input */}
      <div className="space-y-4 text-left">
        <label className="text-sm font-medium">Story Prompt</label>
        <Textarea
          placeholder="Describe the story you want to create... (e.g., 'Create a heartwarming story about family moments', 'Make a travel adventure video from my vacation footage', 'Show me all the times I was laughing with friends')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="resize-none mt-2 border-gray-200"
        />
      </div>

      {/* Selection Info */}
      {selectedFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {selectedFile.name} selected for story generation
            </span>
          </div>
        </div>
      )}

      {/* File Grid */}
      <div className="w-full min-h-auto bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {files.length > 0 ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Your Files
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  {files.length} file{files.length !== 1 ? 's' : ''} uploaded • Click to select files for story generation
                </p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {files.map((file) => {
                  const isSelected = selectedFile && selectedFile.id === file.id;
                  return (
                    <Card
                      key={file.id}
                      className={`group bg-white border-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer ${isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                      onClick={() => toggleFileSelection(file)}
                    >
                      <div className="p-4 sm:p-6">
                        {/* Selection Indicator */}
                        <div className="absolute top-2 left-2 z-10">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                            ? 'bg-blue-500 border-blue-500'
                            : 'bg-white border-gray-300 group-hover:border-blue-400'
                            }`}>
                            {isSelected && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>

                        {/* Thumbnail and Basic Info */}
                        <div className="space-y-4">
                          {/* Thumbnail */}
                          <div className="relative">
                            <img
                              src={file.type === "image" ? `${IMAGE_BASE_URL}${file.thumbnail}` || "/videoPlayer.png" : "/videoPlayer.png"}
                              alt={file.name}
                              className={`w-full h-32 sm:h-40 object-contain rounded-lg hover:opacity-90 transition-opacity ${isSelected ? 'ring-2 ring-blue-500' : ''
                                }`}
                              onClick={(e) => handleThumbnailClick(file, e)}
                            />
                            {/* Type Badge Overlay */}
                            <div className="absolute top-1 right-1">
                              <Badge variant={file.type === "video" ? "default" : "secondary"} className="text-xs">
                                {file.type === "video" ? (
                                  <FileVideo className="w-3 h-3 mr-1" />
                                ) : (
                                  <Image className="w-3 h-3 mr-1" />
                                )}
                                {file.type}
                              </Badge>
                            </div>
                          </div>

                          {/* File Name */}
                          <div>
                            <h3 className={`font-semibold text-sm sm:text-base leading-tight ${isSelected ? 'text-blue-900' : 'text-gray-900'
                              }`} title={file.name}>
                              <span className="sm:hidden">{truncateFileName(file.name, 15)}</span>
                              <span className="hidden sm:inline">{truncateFileName(file.name, 25)}</span>
                            </h3>
                          </div>

                          {/* Transcription */}
                          {file.transcription && (
                            <div className={`rounded-lg p-3 sm:p-4 ${isSelected ? 'bg-blue-100' : 'bg-gray-50'
                              }`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <Mic className="w-3 h-3 mr-2 text-gray-500 flex-shrink-0" />
                                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                                    Transcription
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => toggleTranscription(file.id, e)}
                                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 -m-1"
                                  aria-label={expandedTranscriptions[file.id] ? "Collapse" : "Expand"}
                                >
                                  {expandedTranscriptions[file.id] ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                {expandedTranscriptions[file.id]
                                  ? file.transcription
                                  : truncateText(file.transcription, typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 80)
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <div className="space-y-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    No files uploaded yet
                  </h2>
                  <p className="text-gray-500 text-sm sm:text-base max-w-md">
                    Upload your videos and images to get started with organizing and analyzing your content!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={!prompt.trim() || !selectedFile || isGenerating}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-6 text-lg cursor-pointer disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Zap className="w-5 h-5 mr-2 animate-spin text-white" />
            <span className="text-white">Generating Story...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2 text-white" />
            <span className="text-white">
              Generate Story {selectedFile ? `(${selectedFile.name})` : ''}
            </span>
          </>
        )}
      </Button>

      {/* Generation Progress */}
      {isGenerating && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>

            <div>
              <h3 className="font-semibold text-lg">AI is crafting your story...</h3>
              <p className="text-gray-600">Analyzing footage, creating narrative, and assembling clips</p>
            </div>

            <div className="space-y-2">
              <Progress value={generationProgress} className="w-full" />
              <p className="text-sm text-gray-600">{Math.round(generationProgress)}% complete</p>
            </div>

            <div className="flex justify-center space-x-8 text-sm">
              {generationSteps.map((step) => (
                <div
                  key={step.step}
                  className={`flex items-center space-x-2 ${currentStep === step.step ? "text-purple-600 font-medium" : "text-gray-400"
                    }`}
                >
                  <step.icon className={`w-4 h-4 ${currentStep === step.step ? "animate-pulse" : ""}`} />
                  <span>{step.label}</span>
                </div>
              ))}
            </div>

            {/* Selected Files Preview */}
            <div className="bg-white/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Processing Selected File:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedFile && (
                  <Badge variant="outline" className="text-xs">
                    {selectedFile.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      <MediaModal
        file={selectedFileForModal}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  )
}