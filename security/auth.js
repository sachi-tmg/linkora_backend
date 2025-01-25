const jwt = require("jsonwebtoken")

const SECRET_KEY = "d363abf662fc7581e61d2b8357d457e6991d3e5ad45a49b0b71b8dae53b4af44";

function authenticateToken(req, res, next) {
    const token = req.header("Authorization")?.split(" ")[1];
    if(!token){
        return res.status(401).send("Access denied: No token provided")
    }

    try{
        const verified = jwt.verify(token, SECRET_KEY)
        req.user = verified;
        next()
    }catch (e) {
        res.status(400).send("Invalid token")
    }
}

function authorizeRole(allowedRoles) {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).send("Access Denied: No permission");
        }
        next();
    }
}

module.exports={authenticateToken,authorizeRole}