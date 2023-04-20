const mongoose = require("mongoose")

const tripschedules = mongoose.Schema({
    tripID: {type: mongoose.Schema.Types.Mixed, required: true},
    routeID: {type: mongoose.Schema.Types.Mixed, required: true},
    companyAssigned: {type: mongoose.Schema.Types.Mixed, required: true},
    tripDestination: {type: mongoose.Schema.Types.Mixed, required: true},
    tripDay: {type: mongoose.Schema.Types.Mixed, required: true},
    tripTime: {type: mongoose.Schema.Types.Mixed, required: true},
    tripInterval: {type: mongoose.Schema.Types.Mixed, required: true}
})

module.exports = mongoose.model("TripSchedules", tripschedules, "tripschedules" );