# Footage Flow

Footage Flow is a full-stack web application that leverages cutting-edge AI to transform static images into dynamic video clips. It features an intuitive user interface, secure authentication via Google OAuth, and a powerful backend that orchestrates multiple AI services for a seamless creative experience.

## ✨ Core Features

-   **AI-Powered Image-to-Video Generation**: Utilizes the Google Gemini API to generate short videos from a single user-uploaded image.
-   **Automated Image Tagging**: Employs a Hugging Face model to perform Optical Character Recognition (OCR) and analysis, automatically generating relevant labels for images.
-   **Automated Video Transcription**: Integrates with the Assembly AI API to automatically generate transcripts from the audio of the created videos.
-   **Secure User Authentication**: Integrated with Google OAuth 2.0 for a secure and easy login/signup process.
-   **Decoupled Architecture**: The project is organized into three distinct services: a frontend application, a backend API, and a Python-based service for image processing.

## 🛠️ Tech Stack

-   **Frontend**: Modern web application handling user interaction and API communication.
-   **Backend**: Manages user data, authentication, and acts as a bridge to the AI services.
-   **AI & Machine Learning**:
    -   **Google Gemini API**: For the core image-to-video generation.
    -   **Hugging Face Transformers**: For the image labeling/OCR service.
    -   **Assembly AI API**: For video transcription.
-   **Authentication**: Google OAuth 2.0

## 📂 Project Structure

The repository is structured as a monorepo with the following key directories:

```
.
├── Backend/         # Contains the backend server logic and API endpoints
├── Frontend/        # Contains the frontend user interface code
├── Image OCR(PY)/   # Python service for Hugging Face model integration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

-   Node.js and npm/yarn
-   Python and pip
-   Git
-   Access keys for Google Cloud (OAuth & Gemini) and Hugging Face.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/SangishettyPrem/Footage-Flow.git
    cd Footage-Flow
    ```

2.  **Configure Environment Variables:**

    Create a `.env` file in the `Backend` directory. This file will store your secret keys and configuration variables. **Do not commit this file to version control.**

    **`Backend/.env.example`**
    ```env
    # Google OAuth 2.0 Credentials
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret

    # Google Gemini API Key
    GEMINI_API_KEY=your_gemini_api_key

    # Hugging Face (if needed for private models/rate limits)
    HUGGING_FACE_TOKEN=your_hugging_face_token

    # Database Connection String
    DATABASE_URL=your_database_connection_string

    # JWT Secret for session management
    JWT_SECRET=a_strong_random_secret_key
    ```

3.  **Install Dependencies:**

    -   **Backend:**
        ```bash
        cd Backend
        npm install
        ```
    -   **Frontend:**
        ```bash
        cd ../Frontend
        npm install
        ```
    -   **Image OCR Service:**
        ```bash
        cd ../"Image OCR(PY)"
        pip install -r requirements.txt
        ```

4.  **Run the Application:**

    -   Start the Backend Server:
        ```bash
        # From the Backend directory
        npm run dev
        ```
    -   Start the Frontend Development Server:
        ```bash
        # From the Frontend directory
        npm run dev
        ```
    -   Start the Python OCR Service:
        ```bash
        # From the "Image OCR(PY)" directory
        python app.py
        ```

## 📝 Usage

1.  Navigate to the application in your browser.
2.  Click "Login" and authenticate using your Google account.
3.  On the main dashboard, upload an image you want to animate.
4.  The application will automatically display suggested labels for your image.
5.  Confirm or edit the labels and click "Generate Video".
6.  The backend will process the request with the Gemini API.
7.  Once complete, the generated video will be available for viewing and download.
8.  The application will also display an automatically generated transcript of the video's audio.

## 🔒 Security Note

The commit history shows that sensitive files like `.env` and credentials have been removed. It is critical to **never** commit secret keys or credentials to the repository. Ensure that your `.gitignore` file is properly configured to exclude these files and any local configuration folders.

The `Backend/credentials` folder should be added to your `.gitignore` file to prevent accidental commits.
