import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { FileUpload } from "../components/FileUpload"
import { StoryGenerator } from "../components/StoryGenerator"
import apiService, { IMAGE_BASE_URL } from "../services/api"
import {
    Upload,
    Search,
    Sparkles,
    Play,
    FileVideo,
    ImageIcon,
    Tag,
    Clock,
    User,
    Download,
    Share,
    Mic,
    Film
} from "lucide-react"
import MediaModal from "../components/ui/MediaModal"

export default function Dashboard() {
    const [files, setFiles] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [generatedStories, setGeneratedStories] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGenerating, setisGenerating] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        loadUserFiles();
    }, []);

    const loadUserFiles = async () => {
        try {
            const response = await apiService.getFiles();
            const responseStories = await apiService?.getStories();

            setGeneratedStories(responseStories?.stories || []);
            setFiles(response.files || []);
        } catch (error) {
            console.error("Failed to load files:", error)
        }
    }

    const handleThumbnailClick = (file) => {
        setSelectedFile(file);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedFile(null);
    };

    const handleFilesUploaded = (uploadedFiles) => {
        setFiles((prev) => [...prev, ...uploadedFiles])
    }

    const handleStoryGenerated = async (story) => {
        try {
            setisGenerating(true);
            const response = await apiService.generateStory(story);
            console.log("Generated Story Response:", response);
            setGeneratedStories((prev) => [response?.story, ...prev]);
            setisGenerating(false);

        } catch (error) {
            console.error("Failed to Generate Story:", error)
        }
    }

    const filteredFiles = files.filter(
        (file) =>
            file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            file.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
            file.transcription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            file.location?.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <button onClick={() => navigate("/")} className="flex items-center space-x-2 cursor-pointer">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            StoryAI Dashboard
                        </span>
                    </button>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <Tabs defaultValue="upload" className="space-y-8">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mx-auto gap-5">
                        <TabsTrigger value="upload" className="flex items-center space-x-2 cursor-pointer">
                            <Upload className="w-4 h-4" />
                            <span>Upload</span>
                        </TabsTrigger>
                        <TabsTrigger value="search" className="flex items-center space-x-2 cursor-pointer">
                            <Search className="w-4 h-4" />
                            <span>Search</span>
                        </TabsTrigger>
                        <TabsTrigger value="generate" className="flex items-center space-x-2 cursor-pointer">
                            <Sparkles className="w-4 h-4" />
                            <span>Generate</span>
                        </TabsTrigger>
                        <TabsTrigger value="stories" className="flex items-center space-x-2 cursor-pointer">
                            <Film className="w-4 h-4" />
                            <span>Stories</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Upload Tab */}
                    <TabsContent value="upload" className="space-y-6 border-none">
                        <Card className="border-none">
                            <CardHeader className="text-left">
                                <CardTitle className="flex items-center space-x-2">
                                    <Upload className="w-5 h-5" />
                                    <span>Upload Your Content</span>
                                </CardTitle>
                                <CardDescription>Upload videos and photos to start building your AI-powered stories</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FileUpload onFilesUploaded={handleFilesUploaded} />

                                {files.length > 0 ? (
                                    <div className="space-y-4 mt-8">
                                        <h3 className="text-lg font-semibold">Your Files ({files.length})</h3>
                                        <div className="grid gap-4">
                                            {files.map((file) => (
                                                <Card key={file.id} className="p-4 border-none hover:scale-[1.01]">
                                                    <div className="flex items-start space-x-4">
                                                        <img
                                                            src={file.type == "image" ? `${IMAGE_BASE_URL}${file.thumbnail}` || "/videoPlayer.png" : "/videoPlayer.png"}
                                                            alt={file.name}
                                                            className="w-20 h-20 object-cover rounded cursor-pointer"
                                                            onClick={() => handleThumbnailClick(file)}
                                                        />
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-medium">{file.name}</h4>
                                                                <Badge variant={file.type === "video" ? "default" : "secondary"}>
                                                                    {file.type === "video" ? (
                                                                        <FileVideo className="w-3 h-3 mr-1" />
                                                                    ) : (
                                                                        <ImageIcon className="w-3 h-3 mr-1" />
                                                                    )}
                                                                    {file.type}
                                                                </Badge>
                                                            </div>

                                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                                                                <div className="bg-gray-50 p-3 rounded text-sm">
                                                                    <div className="flex items-center mb-1">
                                                                        <Mic className="w-3 h-3 mr-1" />
                                                                        <span className="font-medium">Transcription:</span>
                                                                    </div>
                                                                    <p className="text-gray-700 text-left">{file.transcription}</p>
                                                                </div>
                                                            )}

                                                            <div className="flex flex-wrap gap-1">
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
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                ) :
                                    <div>
                                        <h1 className="text-4xl font-bold">Start Uploading 😎</h1>
                                    </div>
                                }
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Search Tab */}
                    <TabsContent value="search" className="space-y-6">
                        <Card className="border-none">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Search className="w-5 h-5" />
                                    <span>Search Your Content</span>
                                </CardTitle>
                                <CardDescription>Find specific moments using keywords, people, locations, or actions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search for people, places, actions, or keywords..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 text-lg py-6"
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge
                                            variant="outline"
                                            className="cursor-pointer hover:bg-purple-50"
                                            onClick={() => setSearchQuery("beach")}
                                        >
                                            beach
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="cursor-pointer hover:bg-purple-50"
                                            onClick={() => setSearchQuery("birthday")}
                                        >
                                            birthday
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="cursor-pointer hover:bg-purple-50"
                                            onClick={() => setSearchQuery("family")}
                                        >
                                            family
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="cursor-pointer hover:bg-purple-50"
                                            onClick={() => setSearchQuery("vacation")}
                                        >
                                            vacation
                                        </Badge>
                                    </div>

                                    {searchQuery && (
                                        <div className="space-y-4 border-none">
                                            <h3 className="text-lg font-semibold">Search Results ({filteredFiles.length})</h3>

                                            {filteredFiles.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                    <p>No results found for "{searchQuery}"</p>
                                                    <p className="text-sm">Try searching for beach, birthday, or family</p>
                                                </div>
                                            ) : (
                                                <div className="grid gap-4">
                                                    {filteredFiles?.map((file) => (
                                                        <Card key={file.id} className="p-4 hover:shadow-md transition-shadow hover:cursor-pointer border-none">
                                                            <div className="flex items-start space-x-4">
                                                                <img
                                                                    src={file.type == "image" ? `${IMAGE_BASE_URL}${file.thumbnail}` || "/videoPlayer.png" : "/videoPlayer.png"}
                                                                    alt={file.name}
                                                                    className="w-20 h-20 object-cover rounded cursor-pointer"
                                                                    onClick={() => handleThumbnailClick(file)}
                                                                />
                                                                <div className="flex-1">
                                                                    <h4 className="font-medium mb-2">{file.name}</h4>
                                                                    {file.transcription && (
                                                                        <p className="text-sm text-gray-600 mb-2">{file.transcription}</p>
                                                                    )}
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {file.tags
                                                                            ?.filter((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                                                                            .map((tag, index) => (
                                                                                <Badge
                                                                                    key={index}
                                                                                    variant="default"
                                                                                    className="text-xs bg-purple-100 text-purple-700"
                                                                                >
                                                                                    {tag}
                                                                                </Badge>
                                                                            ))}
                                                                    </div>
                                                                </div>
                                                                <Button variant="outline" size="sm" onClick={() => handleThumbnailClick(file)} className="ml-4 cursor-pointer">
                                                                    <Play className="w-4 h-4 mr-1" />
                                                                    View
                                                                </Button>
                                                            </div>
                                                        </Card>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Generate Tab */}
                    <TabsContent value="generate" className="space-y-6">
                        <Card className="border-none">
                            <CardHeader className="text-left">
                                <CardTitle className="flex items-center space-x-2">
                                    <Sparkles className="w-5 h-5" />
                                    <span>Generate AI Stories</span>
                                </CardTitle>
                                <CardDescription>Tell our AI what story you want to create from your footage</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <StoryGenerator isGenerating={isGenerating} files={files} onStoryGenerated={handleStoryGenerated} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Stories Tab */}
                    <TabsContent value="stories" className="space-y-6">
                        <Card className="border-none">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Film className="w-5 h-5" />
                                    <span>Your AI-Generated Stories</span>
                                </CardTitle>
                                <CardDescription className="text-left">View and manage your created stories</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {[...generatedStories].length === 0 ? (
                                    <div className="text-center py-12">
                                        <Film className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                        <h3 className="text-lg font-medium mb-2">No stories yet</h3>
                                        <p className="text-gray-600 mb-4">Generate your first AI story to get started</p>
                                        <Button onClick={() => document.querySelector('[value="generate"]')?.click()}>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            <span>Create Story</span>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 ">
                                        {[...generatedStories].map((story, index) => (
                                            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow border-none ">
                                                <div className="flex">
                                                    <img
                                                        src={story?.type == "image" ? `${IMAGE_BASE_URL}${story.thumbnail}` : "/videoPlayer.png"}
                                                        alt={story.title}
                                                        className="w-48 h-32 object-contain cursor-pointer"
                                                    />
                                                    <div className="flex-1 p-6">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <h3 className="text-xl text-left font-semibold mb-1">{story.title}</h3>
                                                                <p className="text-gray-600">{story.description}</p>
                                                            </div>
                                                            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                                                New
                                                            </Badge>
                                                        </div>

                                                        <div className="bg-gray-50 p-3 rounded mb-4 text-left">
                                                            <p className="text-sm">
                                                                <strong>Prompt:</strong> {story.prompt}
                                                            </p>
                                                        </div>

                                                        <div className="flex space-x-3">
                                                            <Button className="bg-gradient-to-r cursor-pointer from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" onClick={() => handleThumbnailClick(story)}>
                                                                <Play className="w-4 h-4 mr-2" />
                                                                Watch Story
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            <MediaModal
                file={selectedFile}
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </div>
    )
}
