
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
module.exports = async (req, res, next) => {
  try {
    const resourceType = req.baseUrl.includes("files") ? "file" : "folder";
    const resourceId = parseInt(req.params.id);
    const userId = req.user?.id;

    const parents = await getAllParents(resourceType, resourceId);
    console.log('parents', parents, parents[0]);
    if (parents[0].userId === userId || parents.some(parent => parent.isShared)) {
        console.log('Access granted');
        next();
    }
    else {
    return res.status(403).send("Unauthorized Access");
    }
  }
    catch (error) {
        console.error('Error checking access:', error);
        res.status(500).send(error.message);
    }

}

async function getAllParents(resourceType, resourceId) {


    if (!resourceId) {
        return [];
      }

    let resource;
    console.log(resourceId, resourceType);
         resource = await prisma.folder.findUnique({
            where: {
                id: resourceId
            }
        })


    if (!resource) {
        throw new Error("Resource not found");
    }





    console.log(resource);
  const parents = await getAllParents("folder", resource.folderId);

  return [resource, ...parents];
}