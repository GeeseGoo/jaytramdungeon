const { PrismaClient } = require('@prisma/client');
const { json } = require('express');
const prisma = new PrismaClient()


exports.getFileById = async (req, res) => {
    try {
        const fileId = parseInt(req.params.id);
        if (!req.params.id) {
            return res.status(400).send("File ID is required");
        }
    const file = await prisma.file.findUnique({
        where: {
            id: fileId
        }
    });
    if (!file) {
        return res.status(404).send("File not found");
    }

    console.log(file);

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', file.size);
    res.setHeader('Content-Disposition', `attachment; filename=${file.filename}`);
    res.send(file.content);
}
catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).send("Error fetching file");
}
};

exports.createFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("File is required");
        }

        const file = await prisma.file.create({
            data: {
                filename: req.file.originalname,
                size: req.file.size,
                mimeType: req.file.mimetype,
                content: req.file.buffer,
                userId: req.user.id,
                folderId: req.params.id !== 'null' ? parseInt(req.params.id) : null
            }
        });

        return res.redirect(req.get('Referrer') || "/");
    }
    catch (error) {
        console.error('Error creating file:', error);
        res.status(500).send("Error creating file");
}
};

exports.deleteFile = async (req, res) => {
    try {
        const fileId = parseInt(req.params.id);
        if (!fileId) {
            return res.status(400).send("File ID is required");
        }
        await prisma.file.delete({
            where: {
                id: fileId
            }
        });
        res.redirect(req.get('Referrer') || "/");
    }

    catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).send("Error deleting file");
    }
}