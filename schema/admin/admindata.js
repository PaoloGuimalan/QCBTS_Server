const mongoose = require("mongoose")

const admindata = mongoose.Schema({
    adminID: {type: mongoose.Schema.Types.Mixed, required: true},
    firstname: {type: mongoose.Schema.Types.Mixed, required: true},
    middlename: {type: mongoose.Schema.Types.Mixed, required: true},
    lastname: {type: mongoose.Schema.Types.Mixed, required: true},
    email: {type: mongoose.Schema.Types.Mixed, required: true},
    password: {type: mongoose.Schema.Types.Mixed, required: true}
})

module.exports = mongoose.model("AdminData", admindata, "admin" );