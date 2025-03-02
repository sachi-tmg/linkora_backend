// test/setup.js
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from .env.test
dotenv.config({ path: '.env.test' });

// Debug: Log the MONGO_URI to verify it's loaded correctly
console.log('MONGO_URI:', process.env.MONGO_URI);

before(async () => {
    try {
        // Connect to the test database
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to test database');
    } catch (e) {
        console.error('Failed to connect to test database:', e);
        throw e; // Fail the tests if the database connection fails
    }
});

after(async () => {
    // Disconnect from the test database
    await mongoose.disconnect();
    console.log('Disconnected from test database');
});