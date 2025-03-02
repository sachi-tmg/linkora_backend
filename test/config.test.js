const mongoose = require("mongoose");

const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected test");
    } catch (e) {
        console.log("MongoDB not connected test");
    }
}

module.exports = connectDB;