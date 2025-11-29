const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://willam:joseharrywillam123@cluster0.qr7oqoo.mongodb.net/noteapp?appName=Cluster0';

async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Successfully connected to MongoDB!');
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

testConnection();
