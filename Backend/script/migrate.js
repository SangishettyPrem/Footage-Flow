const db = require("../database/db")

async function runMigrations() {
    try {
        console.log("🔄 Running database migrations...")

        await db.initializeDatabase()

        console.log("✅ Database migrations completed successfully")
        process.exit(0)
    } catch (error) {
        console.error("❌ Migration failed:", error)
        process.exit(1)
    }
}

runMigrations()