const jwt = require('jsonwebtoken');
const { envConfig } = require('../config/envConfig');

const generateJWT = async (user) => {
    try {
        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture
        }
        const token = jwt.sign(payload, envConfig.jwtSecretKey, { expiresIn: '7d' });
        return token;
    } catch (error) {
        throw new Error('Failed to generate JWT: ' + error.message);
    }
}


module.exports = { generateJWT };
