const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()


exports.getFolderById = async (req, res) => {
  try {
    const active_folder = await prisma.folder.findUnique({
      where: {
        id: parseInt(req.params.id)
      },
      include: {
        children: {
          include: {
            owner: true
          }
        },
        files:  {
          include: {
            owner: true
          }
        },
        owner: true,
        folder: true
      }
    });

    if (!active_folder) {
      return res.status(404).send("Folder not found");
    }

    if (req.user) {
      res.render("index", { 
        user: req.user, 
        folders: active_folder.children || [], 
        files: active_folder.files || [],
        active_folder: active_folder 
      });
    }

    res.render("sharedFolder", {
      folders: active_folder.children || [], 
      files: active_folder.files || [],
      active_folder: active_folder 
    });

  } catch (error) {
    console.error('Error fetching folder:', error);
    res.status(500).send("Error fetching folder");
  }
};

exports.shareFolder = async (req, res) => {
  try {
    const folder = await prisma.folder.update({
      where: {
        id: parseInt(req.params.id)
      },
      data: {
        isShared: true
      }
    });
    res.redirect(`/folders/${folder.folderId}`);
  } catch (error) {
    console.error('Error sharing folder:', error);
    res.status(500).send("Error sharing folder");
  }
}
exports.createFolder = async (req, res) => {
  const { folderName } = req.body;
  if (!folderName) {
    return res.status(400).send("Folder name is required");
  }
  try {
    id = req.params.id === 'null' ? null : parseInt(req.params.id);
    // Await the database call so it completes before sending a response.
    console.log('creating folder' + folderName + 'with parent' + id);
    await prisma.folder.create({
      data: {
        folderId: id || null,
        name: folderName,
        userId: req.user.id
      }
    });
    res.redirect(id ? `/folders/${id}` : '/');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating folder");
  }
};

exports.updateFolder = async (req, res) => {
  const { newName } = req.body;
  if (!newName) {
    return res.status(400).send("Folder name is required");
  }
  console.log(`update ${req.params.id}`);
  try {
    await prisma.folder.update({
      where: {
        id: parseInt(req.params.id)
      },
      data: {
        name: newName
      }
    });
    res.json({success: true});
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating folder");
  }
};

exports.deleteFolder = async (req, res) => {
  console.log(`delete ${req.params.id}`);
  try {
    const children = await prisma.folder.findMany({
      where: {
        folderId: parseInt(req.params.id)
      }
    });

    if (children.length) {
      return res.status(400).send("Folder is not empty");
    }
    await prisma.folder.delete({
      where: {
        id: parseInt(req.params.id)
      }
    });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting folder");
  }
};