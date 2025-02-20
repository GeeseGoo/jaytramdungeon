const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const ensureAuth = require("../middleware/ensureAuth");
const multer = require("multer");
const checkAccess = require("../middleware/checkAccess");
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


// get all Files
// get File by id
router.get("/:id", checkAccess, fileController.getFileById);


// create File
router.post("/:id", ensureAuth,upload.single('file'), checkAccess, fileController.createFile);

// delete File by id
router.post("/:id/delete", ensureAuth, checkAccess, fileController.deleteFile);

module.exports = router;
