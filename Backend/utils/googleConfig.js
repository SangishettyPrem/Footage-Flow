const { google } = require('googleapis');
const { envConfig } = require('../config/envConfig');


const GOOGLE_CLIENT_ID = envConfig.googleOAuthConfig.clientId;
const GOOGLE_CLIENT_SECRET = envConfig.googleOAuthConfig.clientSecret;

exports.oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'postmessage'
)