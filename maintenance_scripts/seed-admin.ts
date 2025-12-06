const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Models need to be defined safely for CommonJS if they are ESM in source
// But we can just define the schema inline for the seed script to avoid import complexity
// or try to register it if not exists.

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

// Minimal User Schema for seeding
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'viewer'],
        default: 'viewer',
    },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seedAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'joseharrywillam@gmail.com';
        const password = 'jose';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Upsert: Update if exists, Insert if not
        const result = await User.findOneAndUpdate(
            { email },
            {
                email,
                password: hashedPassword,
                role: 'admin'
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log(`Admin user seeded successfully.`);
        console.log(`Email: ${result.email}`);
        console.log(`Role: ${result.role}`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
