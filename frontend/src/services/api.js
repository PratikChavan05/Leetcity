import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5005/api',
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

/**
 * Fetch/create a LeetCode user's building.
 */
export async function fetchUser(username) {
    const { data } = await API.post('/leetcode/fetch-user', { username });
    return data;
}

/**
 * Get all buildings in the city.
 */
export async function getBuildings() {
    const { data } = await API.get('/city/buildings');
    return data;
}

/**
 * Get leaderboard (top 10).
 */
export async function getLeaderboard() {
    const { data } = await API.get('/city/leaderboard');
    return data;
}

export default API;
