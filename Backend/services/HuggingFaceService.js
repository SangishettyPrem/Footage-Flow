const axios = require('axios');
const fs = require('fs');
const { envConfig } = require('../config/envConfig');
const FormData = require('form-data');

class HuggingFaceServices {
    constructor() {
        this.huggingFaceApiKey = envConfig.API_Keys.hugginFaceApiKey;

        if (!this.huggingFaceApiKey || !this.huggingFaceApiKey.startsWith('hf_')) {
            throw new Error("❌ Invalid or missing Hugging Face API Key. Please check your envConfig.");
        }
    }

    async getImageCaption(filePath) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!fs.existsSync(filePath)) {
                    return reject(`❌ File does not exist at path: ${filePath}`);
                }
                const form = new FormData();
                form.append('image', fs.createReadStream(filePath));
                const response = await axios.post(`${envConfig.pythonApplicationURL}caption`, form, {
                    headers: form.getHeaders()
                });
                if (response?.status >= 200 || response?.status <= 299) {
                    resolve(response?.data?.caption || "A Beautifully Image.");
                }
                resolve(response?.statusText);
            } catch (error) {
                const status = error?.response?.status;
                const message = error?.response?.data || error.message;

                console.error(`❌ Image captioning failed (Status: ${status || 'N/A'}):`, error?.response);
                reject(new Error(`Image captioning failed: ${JSON.stringify(message)}`));
            }
        });
    }
}

module.exports = new HuggingFaceServices();
