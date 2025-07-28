const { Sequelize } = require("sequelize");
const { envConfig } = require("../config/envConfig");

const sequelize = new Sequelize(envConfig.db.dbName, envConfig.db.dbUser, envConfig.db.dbPassword, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
    timezone: '+05:30',
});


const testConnection = async () => {
    await sequelize.authenticate().then(() => {
        console.log('Database Connected Successfully...')
    }).catch((err) => {
        console.error("Error while Connecting Database: ", err);
    })
}

// const initializeDatabase = async () => {
//     try {
//         await sequelize.execute(`CREATE TABLE IF NOT EXISTS users (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             email VARCHAR(255) UNIQUE NOT NULL,
//             password TEXT NOT NULL,
//             name VARCHAR(100) NOT NULL,
//             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//         )`);

//         await sequelize.execute(`CREATE TABLE IF NOT EXISTS files (
//             id VARCHAR(100) PRIMARY KEY,
//             user_id INT NOT NULL,
//             title TEXT NOT NULL,
//             file_size BIGINT NOT NULL,
//             file_type TEXT NOT NULL,
//             duration TEXT,
//             transcription TEXT,
//             tags TEXT,
//             thumbnail_path TEXT,
//             processing_status VARCHAR(50) DEFAULT 'pending',
//             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//             FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
//         )`);

//         await sequelize.execute(`CREATE TABLE IF NOT EXISTS stories (
//             id VARCHAR(100) PRIMARY KEY,
//             user_id INT NOT NULL,
//             title TEXT NOT NULL,
//             description TEXT,
//             prompt TEXT NOT NULL,
//             duration TEXT,
//             thumbnail_path TEXT,
//             video_path TEXT,
//             status VARCHAR(50) DEFAULT 'pending',
//             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//             FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
//         )`);

//         await sequelize.execute(`CREATE TABLE IF NOT EXISTS user_sessions (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             user_id INT NOT NULL,
//             token_hash TEXT NOT NULL,
//             expires_at DATETIME NOT NULL,
//             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//             FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
//         )`);

//         await sequelize.execute(`CREATE TABLE IF NOT EXISTS analytics (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             user_id INT NOT NULL,
//             event_type TEXT NOT NULL,
//             event_data TEXT,
//             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//             FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
//         )`);

//         console.log("✅ Database initialized successfully");
//     } catch (error) {
//         console.error("❌ Database initialization failed:", error);
//         throw error;
//     }
// };

const initializeDatabase = async () => {

}

const createUser = async ({ email, password, name }) => {
    const [result] = await sequelize.execute("INSERT INTO users (email, password, name) VALUES (?, ?, ?)", [email, password, name]);
    return result.insertId;
};

const getUserByEmail = async (email) => {
    const [rows] = await sequelize.execute("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
};

const getUserById = async (id) => {
    const [rows] = await sequelize.execute("SELECT id, email, name, created_at FROM users WHERE id = ?", [id]);
    return rows[0];
};

const createFile = async (fileData) => {
    const keys = [
        "id", "user_id", "title", "file_size",
        "file_type", "duration", "transcription", "tags",
        "thumbnail_path", "processing_status"
    ];

    const values = keys.map(key => fileData[key]);

    await sequelize.execute(`
        INSERT INTO files (${keys.join(", ")})
        VALUES (${keys.map(() => "?").join(", ")})
    `, values);

    return fileData.id;
};

const getUserFiles = async (userId, filters = {}) => {
    let query = "SELECT * FROM files WHERE user_id = ?";
    const params = [userId];

    if (filters.search) {
        query += " AND (title LIKE ? OR transcription LIKE ? OR tags LIKE ?)";
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.type) {
        query += " AND file_type = ?";
        params.push(filters.type);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await sequelize.execute(query, params);
    return rows;
};

const getFileById = async (fileId) => {
    const [rows] = await sequelize.execute("SELECT * FROM files WHERE id = ?", [fileId]);
    return rows[0];
};

const deleteFile = async (fileId) => {
    const [result] = await sequelize.execute("DELETE FROM files WHERE id = ?", [fileId]);
    return result.affectedRows;
};

const createStory = async (storyData) => {
    const keys = [
        "id", "user_id", "title", "description", "prompt", "duration",
        "status", "type"
    ];
    const values = keys.map(key => storyData[key]);

    await sequelize.execute(`
        INSERT INTO stories (${keys.join(", ")})
        VALUES (${keys.map(() => "?").join(", ")})
    `, values);

    return storyData;
};

const getUserStories = async (userId) => {
    const [rows] = await sequelize.execute("SELECT * FROM stories WHERE user_id = ? ORDER BY created_at DESC", [userId]);
    return rows;
};

const getStoryById = async (storyId) => {
    const [rows] = await sequelize.execute("SELECT * FROM stories WHERE id = ?", [storyId]);
    return rows[0];
};

const deleteStory = async (storyId) => {
    const [result] = await sequelize.execute("DELETE FROM stories WHERE id = ?", [storyId]);
    return result.affectedRows;
};

const getUserAnalytics = async (userId) => {
    const analytics = {};

    const [[fileCount]] = await sequelize.execute("SELECT COUNT(*) as count FROM files WHERE user_id = ?", [userId]);
    analytics.totalFiles = fileCount.count;

    const [[storyCount]] = await sequelize.execute("SELECT COUNT(*) as count FROM stories WHERE user_id = ?", [userId]);
    analytics.totalStories = storyCount.count;

    const [[storageUsed]] = await sequelize.execute("SELECT SUM(file_size) as total FROM files WHERE user_id = ?", [userId]);
    analytics.storageUsed = storageUsed.total || 0;

    return analytics;
};

const createSession = async (userId, tokenHash, expiresAt) => {
    const [result] = await sequelize.execute(
        "INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
        [userId, tokenHash, expiresAt]
    );
    return result.insertId;
};

const deleteSession = async (tokenHash) => {
    const [result] = await sequelize.execute("DELETE FROM user_sessions WHERE token_hash = ?", [tokenHash]);
    return result.affectedRows;
};

module.exports = {
    sequelize,
    testConnection,
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
