// services/fileService.js
import api from "./api"


export const uploadFiles = (files) => {
    const formData = new FormData()
    files.forEach((file) => formData.append("files", file))

    return api.post("/auth/files/upload", formData)
}

export const getFiles = (token) => api.get("/auth/files/", { headers: { Authorization: `Bearer ${token}` } })

export const deleteFile = (fileId) =>
    api.delete(`/files/${fileId}`)
