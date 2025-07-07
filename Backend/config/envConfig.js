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
}

module.exports = {
    envConfig
}