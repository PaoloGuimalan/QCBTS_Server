const mongoose = require("mongoose")

const commuterdata = mongoose.Schema({
    userID: {type: mongoose.Schema.Types.Mixed, required: true},
    username: {type: mongoose.Schema.Types.Mixed, required: true},
    name: {type: mongoose.Schema.Types.Mixed, required: true},
    email: {type: mongoose.Schema.Types.Mixed, required: true},
    contactnumber: {type: mongoose.Schema.Types.Mixed, required: true},
    password: {type: mongoose.Schema.Types.Mixed, required: true}
})

module.exports = mongoose.model("CommuterData", commuterdata, "users" );