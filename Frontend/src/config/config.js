export const googleOAuthConfig = {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
    projectId: import.meta.env.VITE_GOOGLE_PROJECT_ID,
    authUri: import.meta.env.VITE_GOOGLE_AUTH_URI,
    tokenUri: import.meta.env.VITE_GOOGLE_TOKEN_URI,
    certsUrl: import.meta.env.VITE_GOOGLE_CERTS_URL,
    origin: import.meta.env.VITE_GOOGLE_ORIGIN,
};


export const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
export const imageUrl = import.meta.env.VITE_REACT_APP_IMAGE_URL || "http://localhost:3000";