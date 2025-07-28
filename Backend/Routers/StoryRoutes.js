const { generateStory, getStories } = require('../controllers/StoryController');
const authMiddleware = require('../middleware/auth');

const router = require('express').Router();

router.get('/', authMiddleware, getStories);
router.post('/generate', authMiddleware, generateStory);

module.exports = router;