import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        profile: {
            realName: { type: String, default: '' },
            avatar: { type: String, default: '' },
            ranking: { type: Number, default: 0 },
            reputation: { type: Number, default: 0 },
        },
        solvedStats: {
            total: { type: Number, default: 0 },
            easy: { type: Number, default: 0 },
            medium: { type: Number, default: 0 },
            hard: { type: Number, default: 0 },
        },
        contestRating: { type: Number, default: 0 },
        contestsAttended: { type: Number, default: 0 },
        badges: { type: [String], default: [] },
        streak: { type: Number, default: 0 },
        activeDays: { type: Number, default: 0 },
        buildingConfig: {
            height: { type: Number, default: 2 },
            width: { type: Number, default: 1 },
            depth: { type: Number, default: 1 },
            floors: {
                easy: { type: Number, default: 1 },
                medium: { type: Number, default: 0 },
                hard: { type: Number, default: 0 },
            },
            color: { type: String, default: '#4fc3f7' },
            faceColor: { type: String, default: '#0f2a1a' },
            glowIntensity: { type: Number, default: 0 },
            decorations: { type: Number, default: 0 },
            windowsPerFloor: { type: Number, default: 3 },
            sideWindowsPerFloor: { type: Number, default: 2 },
            litPercentage: { type: Number, default: 0.3 },
            colony: { type: String, default: 'easy-builders' },
        },
        gridPosition: {
            x: { type: Number, default: 0 },
            z: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
