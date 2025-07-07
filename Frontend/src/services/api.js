const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000/api"
export const IMAGE_BASE_URL = import.meta.env.VITE_REACT_APP_IMAGE_URL || "http://localhost:5000"

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL
        this.token = localStorage.getItem("authToken")
    }

    // Set authentication token
    setToken(token) {
        this.token = token
        if (token) {
            localStorage.setItem("authToken", token)
        } else {
            localStorage.removeItem("authToken")
        }
    }

    // Get authentication headers
    getAuthHeaders() {
        const headers = {
            "Content-Type": "application/json",
        }

        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`
        }

        return headers
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`

        const config = {
            headers: this.getAuthHeaders(),
            ...options,
        }

        // Don't set Content-Type for FormData
        if (options.body instanceof FormData) {
            delete config.headers["Content-Type"]
        }

        try {
            const response = await fetch(url, config)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Network error" }))
                throw new Error(errorData.error || `HTTP ${response.status}`)
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error(`❌ API Error: ${options.method || "GET"} ${url}`, error.message)

            // Check if server is unreachable
            if (error.message.includes("fetch") || error.message.includes("NetworkError")) {
                throw new Error("Server is not reachable. Please check if the backend is running.")
            }

            throw error
        }
    }

    // Health check
    async healthCheck() {
        try {
            const response = await this.request("/health")
            return { online: true, ...response }
        } catch (error) {
            return { online: false, error: error.message }
        }
    }

    // Authentication methods
    async register(userData) {
        return this.request("/auth/register", {
            method: "POST",
            body: JSON.stringify(userData),
        })
    }

    async login(credentials) {
        const response = await this.request("/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials),
        })

        if (response.token) {
            this.setToken(response.token)
        }

        return response
    }

    async logout() {
        this.setToken(null)
        return { message: "Logged out successfully" }
    }

    async getProfile() {
        return this.request("/user/profile")
    }

    // File management methods
    async uploadFiles(files) {
        const formData = new FormData()

        // Add files to FormData
        files.forEach((file) => {
            formData.append("files", file)
        })

        console.log(`📤 Uploading ${files.length} files...`)

        return this.request("/files/upload", {
            method: "POST",
            body: formData,
        })
    }

    async getFiles(filters = {}) {
        const queryParams = new URLSearchParams()

        if (filters.search) {
            queryParams.append("search", filters.search)
        }

        if (filters.type) {
            queryParams.append("type", filters.type)
        }

        const endpoint = `/files${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
        return this.request(endpoint)
    }

    async deleteFile(fileId) {
        return this.request(`/files/${fileId}`, {
            method: "DELETE",
        })
    }

    // Story management methods
    async generateStory(storyData) {
        return this.request("/stories/generate", {
            method: "POST",
            body: JSON.stringify(storyData),
        })
    }

    async getStories() {
        return this.request("/stories")
    }

    async deleteStory(storyId) {
        return this.request(`/stories/${storyId}`, {
            method: "DELETE",
        })
    }

    // Analytics methods
    async getAnalytics() {
        return this.request("/analytics")
    }

    // Utility methods
    getFileUrl(filePath) {
        if (filePath.startsWith("http")) {
            return filePath
        }
        return `${this.baseURL.replace("/api", "")}${filePath}`
    }

    // Mock data for offline mode
    getMockFiles() {
        return {
            files: [
                {
                    id: "mock-1",
                    name: "sample_video.mp4",
                    type: "video",
                    size: "45.2 MB",
                    duration: "3:24",
                    transcription:
                        "This is a sample transcription generated in offline mode. The AI would normally analyze the audio content of your video.",
                    tags: ["sample", "demo", "offline"],
                    location: "Demo Location",
                    people: ["Demo Person"],
                    timestamp: new Date().toLocaleString(),
                    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=120&fit=crop",
                    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=120&fit=crop",
                },
            ],
        }
    }

    getMockStories() {
        return {
            stories: [
                {
                    id: "mock-story-1",
                    title: "Demo AI Story",
                    description: "This is a sample story generated in offline mode.",
                    duration: "2:15",
                    clips: 5,
                    prompt: "Create a demo story",
                    thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=200&h=120&fit=crop",
                    created: new Date().toLocaleString(),
                    status: "completed",
                },
            ],
        }
    }
}

// Create and export a singleton instance
const apiService = new ApiService()
export default apiService
