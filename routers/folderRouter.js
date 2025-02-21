const express = require("express");
const router = express.Router();
const folderController = require("../controllers/folderController");
const ensureAuth = require("../middleware/ensureAuth");
const checkAccess = require("../middleware/checkAccess");




// get all folders
// get folder by id
router.get("/:id",checkAccess, folderController.getFolderById);

router.get("/:id/share", ensureAuth, checkAccess, folderController.shareFolder);

// create folder
router.post("/:id", ensureAuth, checkAccess, folderController.createFolder);

// update folder by id
router.post("/:id/update", ensureAuth, checkAccess, folderController.updateFolder);

// delete folder by id
router.post("/:id/delete", ensureAuth, checkAccess, folderController.deleteFolder);

module.exports = router;
