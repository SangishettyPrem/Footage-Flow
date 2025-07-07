"use client"

import { useState } from "react"
import LoginForm from "../components/Auth/LoginForm"
import RegisterForm from "../components/Auth/RegisterForm"
import { Sparkles } from "lucide-react"

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            StoryAI
                        </span>
                    </div>
                    <p className="text-gray-600">Transform your footage into compelling stories</p>
                </div>

                {/* Auth Forms */}
                {isLogin ? (
                    <LoginForm onToggleMode={() => setIsLogin(false)} />
                ) : (
                    <RegisterForm onToggleMode={() => setIsLogin(true)} />
                )}
            </div>
        </div>
    )
}
