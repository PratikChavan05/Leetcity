/**
 * Clamp a value between min and max.
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Colony classification based on difficulty focus + contest activity.
 * Users are grouped into named districts.
 */
export function classifyColony(userData) {
    const { solvedStats, contestRating, contestsAttended } = userData;
    const { total, easy, medium, hard } = solvedStats;
    const totalSolved = easy + medium + hard || 1;

    const hardRatio = hard / totalSolved;
    const mediumRatio = medium / totalSolved;
    const easyRatio = easy / totalSolved;

    // Contest elites — high contest rating or many contests
    if (contestRating >= 1800 || contestsAttended >= 20) {
        return 'contest-elites';
    }

    // Hard grinders — dominant hard solving
    if (hardRatio > 0.25 && hard >= 30) {
        return 'hard-grinders';
    }

    // Speed runners — lots of total solves, focus on medium
    if (total >= 300 && mediumRatio > 0.35) {
        return 'speed-runners';
    }

    // Balanced warriors — roughly even distribution
    if (hardRatio > 0.1 && mediumRatio > 0.25 && easyRatio > 0.25) {
        return 'balanced-warriors';
    }

    // Easy builders — mostly easy problems
    return 'easy-builders';
}

// Colony metadata (center offsets + accent colors)
export const COLONY_CONFIG = {
    'contest-elites': { center: { x: 0, z: 0 }, color: '#ffd700', label: '🏆 Contest Elites' },
    'hard-grinders': { center: { x: 50, z: -50 }, color: '#e17055', label: '🔥 Hard Grinders' },
    'speed-runners': { center: { x: -50, z: -50 }, color: '#74b9ff', label: '⚡ Speed Runners' },
    'balanced-warriors': { center: { x: 50, z: 50 }, color: '#55efc4', label: '⚖️ Balanced Warriors' },
    'easy-builders': { center: { x: -50, z: 50 }, color: '#a29bfe', label: '🌱 Easy Builders' },
};

/**
 * Pick a building color based on the user's dominant difficulty.
 */
function pickColor(easy, medium, hard) {
    const total = easy + medium + hard || 1;
    const hardRatio = hard / total;
    const mediumRatio = medium / total;

    if (hardRatio > 0.3) return '#e53935'; // red — hard dominant
    if (mediumRatio > 0.4) return '#ff9800'; // orange — medium dominant
    return '#4caf50'; // green — easy dominant
}

/**
 * Pick a face (wall) color based on difficulty blend.
 * This is the building's wall base color (darker, for pixel-art texture background).
 */
function pickFaceColor(easy, medium, hard) {
    const total = easy + medium + hard || 1;
    const hardRatio = hard / total;
    const mediumRatio = medium / total;

    if (hardRatio > 0.3) return '#2a1215';
    if (mediumRatio > 0.4) return '#2a2010';
    return '#0f2a1a';
}

/**
 * Converts LeetCode stats into a building configuration.
 *
 * @param {object} userData - normalized user data from leetcodeService
 * @returns {object} buildingConfig
 */
export function mapToBuilding(userData) {
    const { solvedStats, contestRating, badges, streak, activeDays } = userData;
    const { total, easy, medium, hard } = solvedStats;

    // Height: scaled from total solved. ~50 solved = 5 units, 500+ = 30 units
    const height = clamp(Math.round((total / 500) * 28) + 2, 2, 30);

    // Width: based on contest rating. 0 = 1, 1500 = 2, 2500+ = 4
    const width = clamp(
        parseFloat((1 + (contestRating / 2500) * 3).toFixed(1)),
        1,
        4
    );

    // Depth: slight variation from width for visual variety
    const depth = clamp(
        parseFloat((width * (0.7 + (easy % 5) * 0.1)).toFixed(1)),
        1,
        3.5
    );

    // Floor distribution (proportional to difficulty counts relative to height)
    const totalSolved = easy + medium + hard || 1;
    const easyFloors = Math.max(1, Math.round((easy / totalSolved) * height));
    const hardFloors = Math.round((hard / totalSolved) * height);
    const mediumFloors = Math.max(0, height - easyFloors - hardFloors);

    // Glow intensity from streak (0–1 range)
    const glowIntensity = clamp(parseFloat((streak / 365).toFixed(2)), 0, 1);

    // Decorations from badges count
    const decorations = badges ? badges.length : 0;

    // Windows — pixel art grid counts
    const windowsPerFloor = clamp(Math.round(width * 3), 2, 12);
    const sideWindowsPerFloor = clamp(Math.round(depth * 3), 2, 10);

    // Lit percentage from active days (how many windows glow)
    const litPercentage = clamp(parseFloat(((activeDays || 0) / 365).toFixed(2)), 0.05, 0.95);

    return {
        height,
        width,
        depth,
        floors: {
            easy: easyFloors,
            medium: mediumFloors,
            hard: hardFloors,
        },
        color: pickColor(easy, medium, hard),
        faceColor: pickFaceColor(easy, medium, hard),
        glowIntensity,
        decorations,
        windowsPerFloor,
        sideWindowsPerFloor,
        litPercentage,
        colony: classifyColony(userData),
    };
}
