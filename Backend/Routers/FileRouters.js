const { getFiles, FileUpload } = require('../controllers/FilesController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload.middleware');

const router = require('express').Router();

router.get('/', authMiddleware, getFiles);
router.post('/upload', authMiddleware, upload.array("files", 10), FileUpload);

module.exports = router;