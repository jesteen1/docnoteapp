import dbConnect from '../src/lib/db';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB...');
        await dbConnect();
        console.log('Successfully connected to MongoDB!');
        process.exit(0);
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

testConnection();
