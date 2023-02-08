const mongoose = require("mongoose")

const waitingdata = mongoose.Schema({
    busStopID: {type: mongoose.Schema.Types.Mixed, required: true},
    userID: {type: mongoose.Schema.Types.Mixed, required: true},
    date: {type: mongoose.Schema.Types.Mixed, required: true},
    time: {type: mongoose.Schema.Types.Mixed, required: true},
    status: {type: mongoose.Schema.Types.Mixed, required: true}
})

module.exports = mongoose.model("WaitingData", waitingdata, "waiting" );