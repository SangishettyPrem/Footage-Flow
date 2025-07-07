"use client"

import { createContext, useContext, useState, useEffect } from "react"
import apiService from "../services/api"

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem("authToken")
            if (token) {
                const userData = await apiService.getProfile()
                setUser(userData)
            }
        } catch (error) {
            console.error("Auth check failed:", error)
            localStorage.removeItem("authToken")
        } finally {
            setLoading(false)
        }
    }

    const login = async (credentials) => {
        try {
            setError(null)
            const response = await apiService.login(credentials);
            localStorage.setItem("authToken", response?.token)
            setUser(response?.user)
            return response
        } catch (error) {
            setError(error.message)
            throw error
        }
    }



    const register = async (userData) => {
        try {
            setError(null)
            const response = await apiService.register(userData);
            return response;
        } catch (error) {
            setError(error.message)
            throw error
        }
    }

    const logout = () => {
        apiService.logout()
        setUser(null)
        setError(null)
    }

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
