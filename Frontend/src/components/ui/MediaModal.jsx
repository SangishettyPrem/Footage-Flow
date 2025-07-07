import { Clock, FileVideo, Image, Mic, Tag, User, X } from "lucide-react"
import { IMAGE_BASE_URL } from "../../services/api";
import { Badge } from "./badge";

const MediaModal = ({ file, isOpen, onClose }) => {
    if (!isOpen || !file) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all cursor-pointer"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Media Content */}
                <div className="bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-full">
                    {file.type === "video" ? (
                        <div className="relative flex-shrink-0">
                            <video
                                controls
                                autoPlay
                                className="w-full max-h-[50vh] object-contain bg-black"
                                src={`${IMAGE_BASE_URL}${file.thumbnail}`}
                                poster={file.type === "image" ? `${IMAGE_BASE_URL}${file.thumbnail}` : `${IMAGE_BASE_URL}${file.thumbnail}`}
                            >
                                <source src={file.url} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center bg-gray-100 flex-shrink-0">
                            <img
                                src={`${IMAGE_BASE_URL}${file.url}`}
                                alt={file.name}
                                className="max-w-full max-h-[50vh] object-contain"
                            />
                        </div>
                    )}

                    {/* File Info - Scrollable */}
                    <div className="p-4 border-t overflow-y-auto flex-1 min-h-0">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{file.name}</h3>
                            <Badge variant={file.type === "video" ? "default" : "secondary"}>
                                {file.type === "video" ? (
                                    <FileVideo className="w-3 h-3 mr-1" />
                                ) : (
                                    <Image className="w-3 h-3 mr-1" />
                                )}
                                {file.type}
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span>{file.size}</span>
                            {file.duration && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {file.duration}
                                    </span>
                                </>
                            )}
                        </div>

                        {file.transcription && (
                            <div className="bg-gray-50 p-3 rounded text-sm mb-2">
                                <div className="flex items-center mb-2">
                                    <Mic className="w-3 h-3 mr-1" />
                                    <span className="font-medium">Transcription:</span>
                                </div>
                                <div className="max-h-40 overflow-y-auto">
                                    <p className="text-gray-700 text-left leading-relaxed whitespace-pre-wrap">{file.transcription}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-1 mb-2">
                            {file.tags?.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                    <Tag className="w-2 h-2 mr-1" />
                                    {tag}
                                </Badge>
                            ))}
                        </div>

                        {file.people && file.people.length > 0 && (
                            <div className="flex items-center space-x-2 text-sm">
                                <User className="w-3 h-3" />
                                <span>People: {file.people.join(", ")}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default MediaModal;