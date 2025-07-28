import api from "./api"

export const generateStory = (story, prompt) =>
    api.post("/auth/stories/generate", { story, prompt })

export const getStories = () =>
    api.get("/auth/stories")

export const deleteStory = (storyId) =>
    api.delete(`/stories/${storyId}`)
