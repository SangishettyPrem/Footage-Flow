import api from "./api"

export const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials)
    if (response.data.token) {
        localStorage.setItem("authToken", response.data.token)
    }
    return response.data
}

export const logout = () => {
    localStorage.removeItem("authToken")
    return { message: "Logged out successfully" }
}

export const getProfile = () => api.get("/auth/user/profile")

export const googleAuth = (code) => api.get(`/auth/google/?code=${code}`)

export const addPasswordToAccount = async (password, token) => api.post('/auth/set-password', { password }, {
    headers: { Authorization: `Bearer ${token}`, },
});