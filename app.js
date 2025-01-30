const express = require("express")
const connectDB = require("./config/db")
const user_router = require("./routes/user_route")
const role_router = require("./routes/role_route")
const regularUser_router = require("./routes/regularUser_route")
const post_router = require("./routes/post_route");
const like_router = require("./routes/like_route");
const comment_router = require("./routes/comment_route");
const cors = require("cors");

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
app.use("/api/post", post_router);
app.use("/api/like", like_router);
app.use("/api/comment", comment_router);


const port = 3000;
app.listen(port,() => {
    console.log('server running at http://localhost:3000')
})