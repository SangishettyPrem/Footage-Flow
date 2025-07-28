import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import HomePage from "./pages/HomePage"
import Dashboard from "./pages/Dashboard"
import "./App.css"
import PageNotFound from "./components/PageNotFound"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { googleOAuthConfig } from "./config/config"
import SetPasswordPage from "./pages/SetPasswordPage"
import LoginForm from "./pages/LoginForm"

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Use replace to avoid adding to history stack
  return isAuthenticated ? children : <Navigate to="/auth" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Use replace to avoid adding to history stack
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

const GoogleAuthProvider = ({ children }) => {
  return (
    <GoogleOAuthProvider clientId={googleOAuthConfig.clientId}>
      {children}
    </GoogleOAuthProvider>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <GoogleAuthProvider>
              <LoginForm />
            </GoogleAuthProvider>
          </PublicRoute>
        }
      />
      <Route path="/set-password" element={<SetPasswordPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* Use replace for catch-all route as well */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
      </div>
    </AuthProvider>
  )
}

export default App