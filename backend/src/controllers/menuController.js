const prisma = require('../db/prisma');

// Helper to parse boolean from string/boolean/number
const parseBoolean = (val) => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val === 1;
    if (typeof val === 'string') {
        return val.toLowerCase() === 'true' || val === '1';
    }
    return Boolean(val);
};

// Format menu with avgRating
const formatMenuWithRating = (menuItem) => {
    const ratings = menuItem.ratings || [];
    let avgRating = 0;
    if (ratings.length > 0) {
        const sum = ratings.reduce((acc, r) => acc + Number(r.score), 0);
        avgRating = Number((sum / ratings.length).toFixed(1));
    }
    return {
        ...menuItem,
        avgRating
    };
};

// Get all menus (or filter by keyword/typeId: /api/menu?keyword=...)
const getMenus = async (req, res) => {
    const { keyword, typeId } = req.query;
    try {
        const whereClause = {};
        if (keyword) {
            whereClause.OR = [
                { name: { contains: keyword } },
                { type: { name: { contains: keyword } } }
            ];
        }
        if (typeId) {
            whereClause.typeId = Number(typeId);
        }

        const menus = await prisma.menu.findMany({
            where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
            include: {
                type: true,
                ratings: true,
                _count: {
                    select: { ratings: true }
                }
            },
            orderBy: {
                menuId: 'asc'
            }
        });
        res.json(menus.map(formatMenuWithRating));
    } catch (err) {
        console.error('Error fetching menus:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

// Search menus (/api/menu/search?keyword=...)
const searchMenus = async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) {
        return res.status(400).json({ error: 'Please provide a search keyword' });
    }
    try {
        const menus = await prisma.menu.findMany({
            where: {
                OR: [
                    { name: { contains: keyword } },
                    { type: { name: { contains: keyword } } }
                ]
            },
            include: {
                type: true,
                ratings: true
            }
        });
        res.json(menus.map(formatMenuWithRating));
    } catch (err) {
        console.error('Error searching menus:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

// Get menu by ID (/api/menu/:id)
const getMenuById = async (req, res) => {
    const { id } = req.params;
    try {
        const menuItem = await prisma.menu.findUnique({
            where: { menuId: Number(id) },
            include: {
                type: true,
                ratings: true
            }
        });
        if (!menuItem) {
            return res.status(404).json({ error: 'Menu not found' });
        }
        res.json(formatMenuWithRating(menuItem));
    } catch (err) {
        console.error('Error fetching menu:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

// Create menu (POST /api/menu)
const createMenu = async (req, res) => {
    const { name, price, isBestSeller, typeId } = req.body;
    if (!name || price === undefined || price === '') {
        return res.status(400).json({ error: 'name and price are required' });
    }
    try {
        const newMenu = await prisma.menu.create({
            data: {
                name: String(name).trim(),
                price: Number(price),
                isBestSeller: isBestSeller !== undefined ? parseBoolean(isBestSeller) : false,
                typeId: typeId ? Number(typeId) : 1
            },
            include: {
                type: true,
                ratings: true
            }
        });
        res.status(201).json(formatMenuWithRating(newMenu));
    } catch (err) {
        console.error('Error creating menu:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

// Update menu (PUT /api/menu/:id)
const updateMenu = async (req, res) => {
    const { id } = req.params;
    const { name, price, isBestSeller, typeId } = req.body;
    if (!name || price === undefined || price === '') {
        return res.status(400).json({ error: 'name and price are required' });
    }
    try {
        const updatedMenu = await prisma.menu.update({
            where: { menuId: Number(id) },
            data: {
                name: String(name).trim(),
                price: Number(price),
                isBestSeller: isBestSeller !== undefined ? parseBoolean(isBestSeller) : false,
                typeId: typeId ? Number(typeId) : 1
            },
            include: {
                type: true,
                ratings: true
            }
        });
        res.json(formatMenuWithRating(updatedMenu));
    } catch (err) {
        console.error('Error updating menu:', err);
        res.status(404).json({ error: 'Menu not found or database error' });
    }
};

// Delete menu (DELETE /api/menu/:id)
const deleteMenu = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.menu.delete({
            where: { menuId: Number(id) }
        });
        res.json({ message: 'Menu deleted successfully', menuId: Number(id) });
    } catch (err) {
        console.error('Error deleting menu:', err);
        res.status(404).json({ error: 'Menu not found' });
    }
};

// Rate menu (POST or PUT /api/menu/:id/rate)
const rateMenu = async (req, res) => {
    const { id } = req.params;
    const { score, rating, userId } = req.body;
    const ratingValue = Number(score !== undefined ? score : rating);

    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    try {
        const menuId = Number(id);
        await prisma.rating.create({
            data: {
                menuId,
                score: ratingValue,
                userId: userId ? Number(userId) : null
            }
        });

        // Calculate aggregate average rating using Prisma aggregate as shown in slides
        const aggregations = await prisma.rating.aggregate({
            where: { menuId },
            _avg: {
                score: true
            },
            _count: {
                score: true
            }
        });

        const avgRating = aggregations._avg.score
            ? Number(aggregations._avg.score.toFixed(1))
            : ratingValue;

        res.status(200).json({
            message: 'Rating submitted successfully',
            menuId,
            avgRating,
            aggregations
        });
    } catch (err) {
        console.error('Error rating menu:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

module.exports = {
    getMenus,
    searchMenus,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
    rateMenu
};
