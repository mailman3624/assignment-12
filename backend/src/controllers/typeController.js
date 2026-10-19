const prisma = require('../db/prisma');

// Get all types (or filter by keyword if provided: /api/type?keyword=...)
const getTypes = async (req, res) => {
    const { keyword } = req.query;
    try {
        let types;
        if (keyword) {
            types = await prisma.type.findMany({
                where: {
                    name: { contains: keyword }
                },
                include: {
                    menu: true
                }
            });
        } else {
            types = await prisma.type.findMany({
                include: {
                    menu: true
                }
            });
        }
        res.json(types);
    } catch (err) {
        console.error('Error fetching types:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

// Search types (/api/type/search?keyword=...)
const searchTypes = async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) {
        return res.status(400).json({ error: 'Please provide a search keyword' });
    }
    try {
        const types = await prisma.type.findMany({
            where: {
                name: { contains: keyword }
            },
            include: {
                menu: true
            }
        });
        res.json(types);
    } catch (err) {
        console.error('Error searching types:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

// Get type by ID (/api/type/:id)
const getTypeById = async (req, res) => {
    const { id } = req.params;
    try {
        const typeItem = await prisma.type.findUnique({
            where: { typeId: Number(id) },
            include: {
                menu: true
            }
        });
        if (!typeItem) {
            return res.status(404).json({ error: 'Type not found' });
        }
        res.json(typeItem);
    } catch (err) {
        console.error('Error fetching type:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

// Create new type (POST /api/type)
const createType = async (req, res) => {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'Type name is required' });
    }
    try {
        const newType = await prisma.type.create({
            data: {
                name: String(name).trim()
            }
        });
        res.status(201).json(newType);
    } catch (err) {
        console.error('Error creating type:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

// Update type (PUT /api/type/:id)
const updateType = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'Type name is required' });
    }
    try {
        const updatedType = await prisma.type.update({
            where: { typeId: Number(id) },
            data: {
                name: String(name).trim()
            }
        });
        res.json(updatedType);
    } catch (err) {
        console.error('Error updating type:', err);
        res.status(404).json({ error: 'Type not found or database error' });
    }
};

// Delete type (DELETE /api/type/:id)
const deleteType = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.type.delete({
            where: { typeId: Number(id) }
        });
        res.json({ message: 'Type deleted successfully', typeId: Number(id) });
    } catch (err) {
        console.error('Error deleting type:', err);
        res.status(404).json({ error: 'Type not found or still referenced by menu items' });
    }
};

module.exports = {
    getTypes,
    searchTypes,
    getTypeById,
    createType,
    updateType,
    deleteType
};
