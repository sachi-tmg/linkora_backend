const express = require("express")
const connectDB = require("./config/db")
const user_router = require("./routes/user_route")
const role_router = require("./routes/role_route")
const regularUser_router = require("./routes/regularUser_route")
const blog_router = require("./routes/blog_route");
const comment_router = require("./routes/comment_route");
const cors = require("cors");
require("dotenv").config();


const app = express();

connectDB();

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
    optionSuccessStatus: 200,
}

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/role", role_router);
app.use("/api/user", user_router);
app.use("/api/regular-users", regularUser_router);
app.use("/api/blog", blog_router);
app.use("/api/comment", comment_router);
app.use("/public", express.static('public'));

const port = 3000;
app.listen(port,() => {
    console.log('server running at http://localhost:3000')
})

module.exports = app;