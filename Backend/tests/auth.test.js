const request = require("supertest")
const app = require("../server")

describe("Authentication Endpoints", () => {
    describe("POST /api/auth/register", () => {
        it("should register a new user", async () => {
            const userData = {
                email: "test@example.com",
                password: "password123",
                name: "Test User",
            }

            const response = await request(app).post("/api/auth/register").send(userData).expect(201)

            expect(response.body).toHaveProperty("token")
            expect(response.body.user.email).toBe(userData.email)
        })

        it("should not register user with existing email", async () => {
            const userData = {
                email: "test@example.com",
                password: "password123",
                name: "Test User",
            }

            // Register first user
            await request(app).post("/api/auth/register").send(userData)

            // Try to register with same email
            const response = await request(app).post("/api/auth/register").send(userData).expect(400)

            expect(response.body.error).toBe("User already exists")
        })
    })

    describe("POST /api/auth/login", () => {
        beforeEach(async () => {
            // Register a test user
            await request(app).post("/api/auth/register").send({
                email: "login@example.com",
                password: "password123",
                name: "Login Test",
            })
        })

        it("should login with valid credentials", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "login@example.com",
                    password: "password123",
                })
                .expect(200)

            expect(response.body).toHaveProperty("token")
            expect(response.body.user.email).toBe("login@example.com")
        })

        it("should not login with invalid credentials", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "login@example.com",
                    password: "wrongpassword",
                })
                .expect(401)

            expect(response.body.error).toBe("Invalid credentials")
        })
    })
})
