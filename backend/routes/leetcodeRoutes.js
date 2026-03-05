import { Router } from 'express';
import { fetchLeetCodeUser } from '../services/leetcodeService.js';
import { mapToBuilding } from '../services/buildingMapper.js';
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

        // Determine grid position — assign next available if new user
        let existingUser = await User.findOne({ username: trimmed });
        let gridPosition;

        if (existingUser) {
            gridPosition = existingUser.gridPosition;
        } else {
            // Spiral-like grid placement: count existing users and compute position
            const count = await User.countDocuments();
            gridPosition = computeGridPosition(count);
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

        res.json({ success: true, user });
    } catch (err) {
        console.error('Error fetching LeetCode user:', err.message);
        const status = err.message.includes('not found') ? 404 : 500;
        res.status(status).json({ error: err.message });
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
 * Computes a spiral grid position for the nth building.
 * Buildings are placed outward from center in a square-spiral pattern.
 */
function computeGridPosition(n) {
    if (n === 0) return { x: 0, z: 0 };

    // Spacing between buildings
    const spacing = 6;
    let x = 0,
        z = 0;
    let dx = 1,
        dz = 0;
    let steps = 1,
        stepCount = 0,
        turnCount = 0;

    for (let i = 0; i < n; i++) {
        x += dx;
        z += dz;
        stepCount++;
        if (stepCount === steps) {
            stepCount = 0;
            // Turn 90° clockwise
            [dx, dz] = [-dz, dx];
            turnCount++;
            if (turnCount === 2) {
                turnCount = 0;
                steps++;
            }
        }
    }

    return { x: x * spacing, z: z * spacing };
}

export default router;
