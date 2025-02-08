const mongoose = require("mongoose");

const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    } catch (e) {
        console.log("MongoDB not connected");
    }
}

module.exports = connectDB;