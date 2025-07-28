import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Upload, Search, Sparkles, Eye, Play, FileVideo, Zap } from "lucide-react"

const HomePage = () => {
    const [isHovered, setIsHovered] = useState(false)
    const navigate = useNavigate()

    const features = [
        {
            icon: Upload,
            title: "Smart Upload",
            description: "Upload videos and photos from any device with intelligent preprocessing",
        },
        {
            icon: FileVideo,
            title: "AI Transcription",
            description: "Automatic transcription of all video and audio content with high accuracy",
        },
        {
            icon: Search,
            title: "Intelligent Search",
            description: "Find specific moments using keywords, actions and more",
        },
        {
            icon: Sparkles,
            title: "Story Generation",
            description: "AI creates cohesive narratives from your footage based on prompts",
        },
        {
            icon: Eye,
            title: "Computer Vision",
            description: "Automatic tagging and categorization of visual content",
        },
        {
            icon: Zap,
            title: "Instant Processing",
            description: "Lightning-fast analysis and story creation powered by advanced AI",
        },
    ]

    const stats = [
        { value: "10x", label: "Faster Editing" },
        { value: "95%", label: "Accuracy Rate" },
        { value: "50+", label: "AI Models" },
        { value: "∞", label: "Story Possibilities" },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            {/* Header */}
            <header className="border-b-gray-400 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            StoryAI
                        </span>
                    </div>
                    <Button
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white cursor-pointer"
                        onClick={() => navigate("/dashboard")}
                    >
                        Launch Demo
                    </Button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center">

                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                    Transform Your Footage Into Compelling Stories
                </h1>
                <div className="relative mx-[10%]">
                    <div className="absolute-bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse" />
                </div>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                    Upload your personal videos and photos, and watch as our AI creates beautiful, cohesive narratives from your
                    memories. Search, discover, and tell your story like never before.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onClick={() => navigate("/dashboard")}
                    >
                        <Play className={`mr-2 h-5 w-5 transition-transform duration-300 text-white ${isHovered ? "scale-110" : ""}`} />
                        <span className="text-white">Try Live Demo</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="text-lg px-8 py-6 rounded-xl border-2 hover:bg-gray-50 bg-transparent cursor-pointer"
                    >
                        <FileVideo className="mr-2 h-5 w-5" />
                        Watch Preview
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-3xl font-bold text-purple-600 mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-600">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Powered by Advanced AI</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Our cutting-edge technology stack brings together the best of AI, computer vision, and natural language
                        processing to revolutionize video storytelling.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
                        >
                            <CardHeader>
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <feature.icon className="w-6 h-6 text-purple-600" />
                                </div>
                                <CardTitle className="text-xl text-left">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-gray-600 leading-relaxed text-left">{feature.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-gradient-to-r from-purple-50 to-blue-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">How It Works</h2>
                        <p className="text-xl text-gray-600">Simple, powerful, and intelligent</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                                1
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Upload & Analyze</h3>
                            <p className="text-gray-600">
                                Upload your videos and photos. Our AI automatically transcribes, tags, and analyzes all content.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                                2
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Search & Discover</h3>
                            <p className="text-gray-600">
                                Find specific moments using natural language. Search by actions, or emotions.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                                3
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Generate Stories</h3>
                            <p className="text-gray-600">
                                Tell our AI what story you want, and watch as it creates a compelling narrative from your footage.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Videos?</h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join the future of video storytelling. Experience the power of AI-driven narrative creation.
                    </p>
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-12 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => navigate("/dashboard")}
                    >
                        <Sparkles className="mr-2 h-5 w-5 text-white" />
                        <span className="text-white">Start Creating Stories</span>
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="!border-t-gray-800 bg-white/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-8 text-center text-gray-600">
                    <p className="text-sm mt-2">Revolutionizing video storytelling with AI</p>
                </div>
            </footer>
        </div>
    )
}

export default HomePage;