// config/db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: '.env.test' });
} else {
    dotenv.config(); // Load default .env file
}

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (e) {
        console.log('MongoDB not connected');
    }
};

module.exports = connectDB;