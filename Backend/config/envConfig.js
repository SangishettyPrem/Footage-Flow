const dotenv = require('dotenv');
dotenv.config();

const envConfig = {
    db: {
        dbHost: process.env.DB_HOST,
        dbPort: process.env.DB_PORT,
        dbUser: process.env.DB_USER,
        dbPassword: process.env.DB_PASSWORD,
        dbName: process.env.DB_NAME
    },
    port: process.env.PORT,
    jwtSecretKey: process.env.JWT_SECRET_KEY,
    frontendURL: process.env.FRONTEND_url,
    backendURL: process.env.BACKEND_URL,
    pythonApplicationURL: process.env.PYTHON_APPLICATION_URL,
    email: {
        email: process.env.MAIL_USER,
        password: process.env.MAIL_PASS
    },
    googleOAuthConfig: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        projectId: process.env.GOOGLE_PROJECT_ID,
        authUri: process.env.GOOGLE_AUTH_URI,
        tokenUri: process.env.GOOGLE_TOKEN_URI,
        certsUrl: process.env.GOOGLE_CERTS_URL,
        origin: process.env.GOOGLE_ORIGIN,
        googleApiUrl: process.env.GOOGLE_ACCESS_TOKEN_URL,
    },
    API_Keys: {
        openaiApiKey: process.env.OPENAI_API_KEY,
        googleApiKey: process.env.GOOGLE_CLOUD_API_KEY,
        assemblyAiApiKey: process.env.ASSEMBLY_AI_API_KEY,
        geminiApiKey: process.env.GOOGLE_GEMINI_API_KEY,
        googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        ninjasImageConvertKey: process.env.NINJAS_IMAGE_CONVERT_KEY,
        hugginFaceApiKey: process.env.HUGGINGFACE_API_KEY,
        googleGenAPIKey: process.env.GOOGLE_GEN_API_KEY,
        falAIKey: process.env.FAL_KEY
    },
    url: {
        assemblyAIBaseUrl: process.env.ASSEMBLY_AI_BASE_URL,
        ninjasImageConvertUrl: process.env.NINJAS_IMAGE_CONVERT_URL
    }
}

module.exports = {
    envConfig
}