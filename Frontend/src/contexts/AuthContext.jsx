import { createContext, useContext, useState, useEffect } from "react"
import { getProfile } from "../services/authService"
import { useLocation, useNavigate } from "react-router-dom"
import { getFiles } from "../services/fileService"
import { getStories } from "../services/storyService"

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [Token, setToken] = useState('');
    const [Files, setFiles] = useState(null);
    const [Stories, setStories] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        checkAuthStatus();
        setToken(localStorage.getItem('authToken'));
    }, [location])

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem("authToken")
            if (token) {
                const userData = await getProfile()
                setUser(userData)
            }
        } catch (error) {
            console.error("Auth check failed:", error)
            if (error?.response?.data?.message == "Invalid token. User not found.") navigate('/');
            else if (error?.response?.data?.message == "Access denied. No token provided.") navigate("/")
        } finally {
            setLoading(false)
        }
    }

    const fetchFiles = async () => {
        const response = await getFiles(Token);
        if (response?.data?.success) {
            setFiles(response?.data?.files);
        }
    }

    const fetchStories = async () => {
        const response = await getStories(Token);
        if (response?.data?.success) {
            setStories(response?.data?.stories);
            return response?.data?.stories; 
        }
    }


    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        Token,

        Files,
        setFiles,
        Stories,
        setStories,

        fetchFiles,
        fetchStories
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
