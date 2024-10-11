const express = require("express");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "GGHereWeGo";

const app = express();
app.use(express.json());

const users = [];

function logger(req, res, next){
    console.log(req.method + " request came");
    next();
}

// localhost:3000
app.get("/", function(req, res){
    res.sendFile(__dirname + "/public/index.html")
})

app.post("/signup", logger, function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    // Check if a user with this username already exists
    const user = users.find(user => user.username === username)
    if(user){
        res.json({
            message: "Username already exists."
        })
        return;
    }

    // Store users in-memory for simplicity
    users.push({
        username: username,
        password: password
    })

    res.json({
        message: "User created Successfully."
    })
})

app.post("/signin", logger, function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    let foundUser = null;
    for(let i = 0; i < users.length; i++){
        if(users[i].username === username && 
        users[i].password === password){
            foundUser = users[i];
            break;
        }
    }

    if(!foundUser){
        res.json({
            message: "Incorrect Credentials"
        })
        return;
    } else{
        const token = jwt.sign({
            username: foundUser.username
        }, JWT_SECRET)

        // Pushing data from here to header
        res.header("jwt", token);

        res.json({
            token: token
        })
    }
})

function auth(req, res, next){
    const token = req.headers.token;
    const decodedData = jwt.verify(token, JWT_SECRET);

    if(decodedData.username) {
        req.username = decodedData.username
        next()
    } else{
        res.json({
            message: "You are not logged in."
        })
    }
}

app.get("/me", logger, auth, function(req, res) {
    let foundUser = null;

    for(let i = 0; i < users.length; i++){
        if(users[i].username === req.username ) {
            foundUser = users[i]
        }
    }

    res.json({
        username: foundUser.username,
        password: foundUser.password
    })
})

app.listen(3000);