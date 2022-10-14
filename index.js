const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const mysql = require("mysql");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");
const nodemailer = require("nodemailer");
const socketIO = require("socket.io");

const mongooseConnection = require("./connections/index");

async function connectMongo(){
    return mongoose.connect(mongooseConnection.url, mongooseConnection.params);
}

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200
}))

const server_app = app.listen(PORT, () => {
    console.log(`Server running at Port ${PORT}`);
    connectMongo().then(() => {
        console.log(`Database Running!`);
    }).catch((err) => {
        console.log(err);
    })
})

//ROUTES FILES AND INITIALIZATION

const authentication = require("./routes/authentication");
const admin = require("./routes/admin/index");
const company = require("./routes/company/index");
const messages = require("./routes/messages/index")

app.use("/auth", authentication);
app.use("/admin", admin);
app.use("/company", company)
app.use("/messages", messages)

//LONG POLLING WORKING CONCEPT WITH MESSAGES
//=================================================================================

let responses = Object.create(null)
// var responses = []

app.get('/admin/subscribe/:id', (req, res) => {
    const id = req.params.id;

    responses[id] = res

    req.on('close', () => {
        console.log(`Connection closed: ${id}`);
    })
})

app.post('/admin/sendmessage', (req, res) => {
    const idd = req.body.id;
    const otherid = req.body.otherid;
    const message = req.body.message;

    for (let id in responses) {
        let ress = responses[id];
        if(id == otherid){
            ress.setHeader('Content-Type', 'text/plain;charset=utf-8');
            ress.setHeader("Cache-Control", "no-cache, must-revalidate");
            ress.send({status: true, from: idd, message: message})
        }
    }

    res.send({status: true, prompt: "Message Sent!"})
})

app.get('/admin/allsubscribers', (req, res) => {
    res.send(Object.keys(responses));
})

//=====================================================================================
//END OF LONG POLLING BLOCK

//WEBSOCKET SECTION (SOCKET.IO)

const io = socketIO(server_app, {cors: {
    origin: "*",
    methods: "*",
    allowedHeaders: ["socketHeaders"],
    credentials: true
}})


/**
 * Note: Missing Commuter Authentication, Schema and Route
 * 
 * Next Task
 *      - Create Commuter Auth with jwt
 *      - Create Commuter Data Schema and Collection in MongoDB
 *      - Create Commuter directory/route and file
 * 
 */