# 🎥 Footage Flow — AI-Powered Video Storytelling Platform

Footage Flow is a full-stack web application that transforms user-uploaded videos into emotional, first-person stories using AI. It combines video upload, transcription, metadata tagging, and story generation using the **Google Gemini API**, providing an intuitive experience for creators, educators, and storytellers.

---

## 📸 Features

- ✅ **Video Upload** – Upload videos with thumbnails and duration metadata
- 🧠 **AI Transcription** – Automatically generate transcripts for videos
- ✨ **AI Story Generator** – Convert transcripts into compelling first-person narratives using Gemini
- 🏷️ **Smart Tagging** – Auto-generated tags using computer vision for video search
- 🔍 **Search Functionality** – Find videos by tags or keywords
- 📚 **Story Library** – View all AI-generated stories in a clean timeline format
- ⚡ **Responsive UI** – Clean and minimal design using Tailwind CSS

---

## 🛠️ Tech Stack

| Area        | Technology                             |
|-------------|-----------------------------------------|
| Frontend    | React 18, Vite, TypeScript              |
| Styling     | Tailwind CSS, shadcn/ui                 |
| Backend     | Node.js, Express.js                     |
| Database    | MySQL (via `mysql2`)     |
| AI Services | Google Gemini API, AssemblyAI (optional)|
| Auth        | JWT-based Authentication                |
| File Upload | Multer (Node), Cloud/Local File Storage |

---

## 📂 Folder Structure

```
FootageFlow/
│
├── client/                    # React frontend
│   ├── components/            # Reusable UI components
│   ├── pages/                 # Page-level views (Upload, Search, Story)                
│   ├── services/              # API calls
│   └── App.jsx                # Main app
│
├── server/                    # Node.js backend
│   ├── routes/                # API endpoints
│   ├── controllers/           # Logic handlers
│   ├── services/              # Transcription/AI services
│   ├── database/              # DB connection and queries
│   └── index.js               # Entry point
│
└── README.md
```

---

## 🧪 Setup Instructions

### ✅ Prerequisites
- Node.js ≥ 18.x
- MySQL Server running
- Google Gemini API Key

### ⚙️ Backend Setup

```bash
cd server
npm install
cp .env.example .env  # Add DB + API keys

# Run MySQL migrations if needed
npm start
```

### 💻 Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## 🔐 Environment Variables (`.env`)

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=footageflow
GOOGLE_GEMINI_API_KEY=your_api_key
JWT_SECRET=your_jwt_secret
```

---

## 🧠 AI Integration

Footage Flow uses [Google Gemini API](https://ai.google.dev/) to generate stories from transcripts.

**Prompt Used:**

```
You are a storytelling assistant. You turn transcripts into emotional, first-person narratives.
Here is the transcript:
"[transcript_text]"
```

---


## 📈 Future Improvements

- 🎙️ Voice-to-text support with AssemblyAI
- 🎞️ Storyboard generator with scene highlights
- 🧠 Multi-language support
- ✍️ Story editing by users post-generation

---

## 🤝 Contributing

Pull requests and feature ideas are welcome!  
If you find bugs or want to enhance something, feel free to open an issue.

---

## 📄 License

MIT License.  
© 2025 Prem Kumar.

---

## 🙌 Acknowledgements

- [Google Gemini API](https://ai.google.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
