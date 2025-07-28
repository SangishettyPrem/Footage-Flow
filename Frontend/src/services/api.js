import { imageUrl } from "../config/config"


import axios from "axios"
import { apiUrl } from "../config/config"

const API_BASE_URL = apiUrl || "http://localhost:5000/api"

const api = axios.create({
    baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, (error) => {
    console.error("Request error:", error)
    return Promise.reject(error)
})
export const IMAGE_BASE_URL = imageUrl || "http://localhost:5000"
export default api;
