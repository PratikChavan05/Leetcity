import { Router } from 'express';
import { fetchLeetCodeUser } from '../services/leetcodeService.js';
import { mapToBuilding, COLONY_CONFIG } from '../services/buildingMapper.js';
import User from '../models/User.js';

const router = Router();

/**
 * POST /api/leetcode/fetch-user
 * Fetches LeetCode data, maps to building, upserts into DB.
 */
router.post('/fetch-user', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username || typeof username !== 'string') {
            return res.status(400).json({ error: 'Username is required' });
        }

        const trimmed = username.trim().toLowerCase();

        // Fetch from LeetCode
        const leetcodeData = await fetchLeetCodeUser(trimmed);

        // Map stats to building
        const buildingConfig = mapToBuilding(leetcodeData);

        // Determine grid position — colony-based placement
        let existingUser = await User.findOne({ username: trimmed });
        let gridPosition;

        if (existingUser) {
            gridPosition = existingUser.gridPosition;
        } else {
            // Count how many users already in this colony
            const colony = buildingConfig.colony;
            const colonyCount = await User.countDocuments({
                'buildingConfig.colony': colony,
            });
            gridPosition = computeColonyPosition(colony, colonyCount);
        }

        // Upsert user
        const user = await User.findOneAndUpdate(
            { username: trimmed },
            {
                ...leetcodeData,
                buildingConfig,
                gridPosition,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({ success: true, user, isExisting: !!existingUser });
    } catch (err) {
        console.error('Error fetching LeetCode user:', err.message);
        const status = err.message.includes('not found') ? 404 : 500;
        res.status(status).json({ error: err.message });
    }
});

/**
 * POST /api/leetcode/seed
 * Batch-fetches multiple LeetCode users to populate the city.
 */
router.post('/seed', async (req, res) => {
    try {
        const { usernames } = req.body;
        if (!Array.isArray(usernames) || usernames.length === 0) {
            return res.status(400).json({ error: 'Provide an array of usernames' });
        }

        const results = [];
        for (const raw of usernames) {
            const username = raw.trim().toLowerCase();
            try {
                const leetcodeData = await fetchLeetCodeUser(username);
                const buildingConfig = mapToBuilding(leetcodeData);

                let existingUser = await User.findOne({ username });
                let gridPosition;
                if (existingUser) {
                    gridPosition = existingUser.gridPosition;
                } else {
                    const colonyCount = await User.countDocuments({
                        'buildingConfig.colony': buildingConfig.colony,
                    });
                    gridPosition = computeColonyPosition(buildingConfig.colony, colonyCount);
                }

                const user = await User.findOneAndUpdate(
                    { username },
                    { ...leetcodeData, buildingConfig, gridPosition },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                results.push({ username, status: 'ok', colony: buildingConfig.colony });
            } catch (e) {
                results.push({ username, status: 'error', error: e.message });
            }
        }

        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/city/buildings
 * Returns all users/buildings for rendering the city.
 */
router.get('/buildings', async (_req, res) => {
    try {
        const users = await User.find().sort({ 'solvedStats.total': -1 });
        res.json({ success: true, buildings: users });
    } catch (err) {
        console.error('Error fetching buildings:', err.message);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/city/leaderboard
 * Returns top 10 users by total problems solved.
 */
router.get('/leaderboard', async (_req, res) => {
    try {
        const top = await User.find()
            .sort({ 'solvedStats.total': -1 })
            .limit(10)
            .select('username profile solvedStats contestRating buildingConfig');
        res.json({ success: true, leaderboard: top });
    } catch (err) {
        console.error('Error fetching leaderboard:', err.message);
        res.status(500).json({ error: err.message });
    }
});

/**
 * Computes grid position within a colony cluster.
 * Buildings are placed in a spiral around the colony center.
 */
function computeColonyPosition(colony, indexInColony) {
    const config = COLONY_CONFIG[colony] || COLONY_CONFIG['easy-builders'];
    const centerX = config.center.x;
    const centerZ = config.center.z;
    const spacing = 7;

    // Spiral placement within the colony
    if (indexInColony === 0) return { x: centerX, z: centerZ };

    let x = 0, z = 0;
    let dx = 1, dz = 0;
    let steps = 1, stepCount = 0, turnCount = 0;

    for (let i = 0; i < indexInColony; i++) {
        x += dx;
        z += dz;
        stepCount++;
        if (stepCount === steps) {
            stepCount = 0;
            [dx, dz] = [-dz, dx];
            turnCount++;
            if (turnCount === 2) {
                turnCount = 0;
                steps++;
            }
        }
    }

    return {
        x: centerX + x * spacing,
        z: centerZ + z * spacing,
    };
}

export default router;
