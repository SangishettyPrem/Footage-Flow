const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { oauth2Client } = require("../utils/googleConfig")
const axios = require("axios")
const { envConfig } = require("../config/envConfig")
const { sequelize } = require("../database/db")
const { generateJWT } = require("../utils/GenerateJWT")
const { User } = require("../models")

const login = async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required", success: false })
        }

        // Get user from database
        const user = await User.findOne({ where: { email } }, { transaction });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials", success: false })
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid credentials", success: false })
        }

        // Generate JWT token
        const token = jwt.sign(user?.dataValues, envConfig.jwtSecretKey, {
            expiresIn: "7d",
        })
        await transaction.commit();
        return res.json({
            success: true,
            token,
            user: { id: user.id, email: user.email, name: user.name },
        })
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Login error:", error)
        res.status(500).json({ message: error?.message || "Internal server error", success: false })
    }
}

const googleLogin = async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();

        const { code } = req.query;
        const googleRes = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleRes.tokens);

        const userRes = await axios.get(`${envConfig.googleOAuthConfig.googleApiUrl}${googleRes.tokens.access_token}`);
        const { email, name, picture, sub: googleId } = userRes?.data;

        let user = await User.findOne({ where: { email }, transaction });

        if (!user) {
            user = await User.create({
                email,
                name,
                picture,
                googleId,
                isEmailVerified: true
            }, { transaction });
        }

        // Commit the transaction before redirect
        await transaction.commit();

        const token = await generateJWT(user?.dataValues || user);

        if (!user?.dataValues?.password) {
            console.log("Redirecting... to the Set password");
            return res.json({
                redirect: `${envConfig.frontendURL}/set-password?token=${token}`
            });
        }
        return res.json({ redirect: `/dashboard`, token });

    } catch (error) {
        if (transaction) await transaction.rollback();

        console.log("Error Occurred While Login: ", error);
        return res.status(500).json({
            message: error?.message || "Error while Google Auth Login",
            success: false
        });
    }
};

const setPassword = async (req, res) => {
    try {
        const { password } = req.body;
        console.log("Req.user: ", req.user);
        const userId = req.user?.id;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters", success: false });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("userId: ", userId);
        await User.update(
            { password: hashedPassword },
            { where: { id: userId } }
        );

        return res.status(200).json({ message: "Password set successfully", success: true });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.log("Error Occurred While Setting Password: ", error);
        return res.status(500).json({
            message: error?.message || "Error while Google Auth Login",
            success: false
        });
    }
}

const getProfile = async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();
        const user = await User.findOne({ where: { id: req?.user?.id }, transaction });
        if (!user) {
            return res.status(404).json({ error: "User not found", success: false })
        }

        const returnResponse = {
            id: user.id,
            email: user.email,
            name: user.name,
        }
        await transaction.commit();
        return res.json({ user: returnResponse, success: true });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Profile error:", error)
        return res.status(500).json({ error: error?.message || "Internal server error" })
    }
}

module.exports = {
    login,
    googleLogin,
    setPassword,
    getProfile
}