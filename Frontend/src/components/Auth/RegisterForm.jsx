"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext.jsx"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Alert } from "../ui/alert"
import { Loader2, Mail, Lock, User } from "lucide-react"
import { useNavigate } from "react-router-dom"

const RegisterForm = ({ onToggleMode }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false)
    const [validationError, setValidationError] = useState("")
    const { register, error } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setValidationError("")

        if (formData.password !== formData.confirmPassword) {
            setValidationError("Passwords do not match")
            return
        }

        if (formData.password.length < 6) {
            setValidationError("Password must be at least 6 characters")
            return
        }

        setIsLoading(true)

        try {
            const result = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });
            if (result?.success) {
                onToggleMode();
            }
        } catch (error) {
            console.error("Registration failed:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                <CardDescription>Join StoryAI and start creating amazing stories</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    {(error || validationError) && <Alert variant="destructive">{error || validationError}</Alert>}

                    <div className="space-y-2 text-left">
                        <label htmlFor="name" className="text-sm font-medium">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                className="pl-10"
                                autoComplete="name"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                className="pl-10"
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="pl-10"
                                autoComplete="new-password"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white
                        hover:cursor-pointer"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </Button>

                    <div className="text-center">
                        <button type="button" onClick={onToggleMode} className="text-sm text-purple-600 hover:text-purple-700">
                            Already have an account? <span className="cursor-pointer">Sign in</span>
                        </button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}


export default RegisterForm;