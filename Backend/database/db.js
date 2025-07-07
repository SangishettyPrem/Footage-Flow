const mysql = require("mysql2/promise");
const { envConfig } = require("../config/envConfig");

const db = mysql.createPool({
    host: envConfig.db.dbHost,
    user: envConfig.db.dbUser,
    password: envConfig.db.dbPassword,
    database: envConfig.db.dbName,
    port: envConfig.db.dbPort,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

const initializeDatabase = async () => {
    try {
        await db.execute(`CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name VARCHAR(100) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`);

        await db.execute(`CREATE TABLE IF NOT EXISTS files (
            id VARCHAR(100) PRIMARY KEY,
            user_id INT NOT NULL,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size BIGINT NOT NULL,
            mime_type TEXT NOT NULL,
            file_type TEXT NOT NULL,
            duration TEXT,
            transcription TEXT,
            tags TEXT,
            location TEXT,
            people TEXT,
            thumbnail_path TEXT,
            processing_status VARCHAR(50) DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);

        await db.execute(`CREATE TABLE IF NOT EXISTS stories (
            id VARCHAR(100) PRIMARY KEY,
            user_id INT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            prompt TEXT NOT NULL,
            duration TEXT,
            clips_count INT DEFAULT 0,
            file_ids TEXT,
            thumbnail_path TEXT,
            video_path TEXT,
            status VARCHAR(50) DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);

        await db.execute(`CREATE TABLE IF NOT EXISTS user_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token_hash TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);

        await db.execute(`CREATE TABLE IF NOT EXISTS analytics (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            event_type TEXT NOT NULL,
            event_data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);

        console.log("✅ Database initialized successfully");
    } catch (error) {
        console.error("❌ Database initialization failed:", error);
        throw error;
    }
};

const createUser = async ({ email, password, name }) => {
    const [result] = await db.execute("INSERT INTO users (email, password, name) VALUES (?, ?, ?)", [email, password, name]);
    return result.insertId;
};

const getUserByEmail = async (email) => {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
};

const getUserById = async (id) => {
    const [rows] = await db.execute("SELECT id, email, name, created_at FROM users WHERE id = ?", [id]);
    return rows[0];
};

const createFile = async (fileData) => {
    const keys = [
        "id", "user_id", "filename", "original_name", "file_path", "file_size",
        "mime_type", "file_type", "duration", "transcription", "tags", "location",
        "people", "thumbnail_path", "processing_status"
    ];

    const values = keys.map(key => fileData[key]);

    await db.execute(`
        INSERT INTO files (${keys.join(", ")})
        VALUES (${keys.map(() => "?").join(", ")})
    `, values);

    return fileData.id;
};

const getUserFiles = async (userId, filters = {}) => {
    let query = "SELECT * FROM files WHERE user_id = ?";
    const params = [userId];

    if (filters.search) {
        query += " AND (original_name LIKE ? OR transcription LIKE ? OR tags LIKE ?)";
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.type) {
        query += " AND file_type = ?";
        params.push(filters.type);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await db.execute(query, params);
    return rows;
};

const getFileById = async (fileId) => {
    const [rows] = await db.execute("SELECT * FROM files WHERE id = ?", [fileId]);
    return rows[0];
};

const deleteFile = async (fileId) => {
    const [result] = await db.execute("DELETE FROM files WHERE id = ?", [fileId]);
    return result.affectedRows;
};

const createStory = async (storyData) => {
    const keys = [
        "id", "user_id", "title", "description", "prompt", "duration",
        "clips_count", "file_ids", "thumbnail_path", "status", "type"
    ];
    const values = keys.map(key => storyData[key]);

    await db.execute(`
        INSERT INTO stories (${keys.join(", ")})
        VALUES (${keys.map(() => "?").join(", ")})
    `, values);

    return storyData;
};

const getUserStories = async (userId) => {
    const [rows] = await db.execute("SELECT * FROM stories WHERE user_id = ? ORDER BY created_at DESC", [userId]);
    return rows;
};

const getStoryById = async (storyId) => {
    const [rows] = await db.execute("SELECT * FROM stories WHERE id = ?", [storyId]);
    return rows[0];
};

const deleteStory = async (storyId) => {
    const [result] = await db.execute("DELETE FROM stories WHERE id = ?", [storyId]);
    return result.affectedRows;
};

const getUserAnalytics = async (userId) => {
    const analytics = {};

    const [[fileCount]] = await db.execute("SELECT COUNT(*) as count FROM files WHERE user_id = ?", [userId]);
    analytics.totalFiles = fileCount.count;

    const [[storyCount]] = await db.execute("SELECT COUNT(*) as count FROM stories WHERE user_id = ?", [userId]);
    analytics.totalStories = storyCount.count;

    const [[storageUsed]] = await db.execute("SELECT SUM(file_size) as total FROM files WHERE user_id = ?", [userId]);
    analytics.storageUsed = storageUsed.total || 0;

    return analytics;
};

const createSession = async (userId, tokenHash, expiresAt) => {
    const [result] = await db.execute(
        "INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
        [userId, tokenHash, expiresAt]
    );
    return result.insertId;
};

const deleteSession = async (tokenHash) => {
    const [result] = await db.execute("DELETE FROM user_sessions WHERE token_hash = ?", [tokenHash]);
    return result.affectedRows;
};

module.exports = {
    initializeDatabase,
    createUser,
    getUserByEmail,
    getUserById,
    createFile,
    getUserFiles,
    getFileById,
    deleteFile,
    createStory,
    getUserStories,
    getStoryById,
    deleteStory,
    getUserAnalytics,
    createSession,
    deleteSession,
};
