import dbConnect from '../src/lib/db';
import User from '../src/models/User';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function seedAdmin() {
    try {
        await dbConnect();

        const userCount = await User.countDocuments();
        if (userCount > 0) {
            console.log('Users already exist. Skipping seed.');
            // Optionally find the admin to confirm existence, but we can't show password
            const admin = await User.findOne({ role: 'admin' });
            if (admin) {
                console.log(`Admin user found: ${admin.email}`);
            } else {
                console.log('No admin user found among existing users.');
            }
            process.exit(0);
        }

        const email = 'admin@example.com';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            email,
            password: hashedPassword,
            role: 'admin'
        });

        console.log(`Admin user created successfully.`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
