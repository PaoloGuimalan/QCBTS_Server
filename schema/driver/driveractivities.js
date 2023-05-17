const mongoose = require("mongoose")

const driveractivities = mongoose.Schema({
    activityID: {type: mongoose.Schema.Types.Mixed, required: true},
    userID: {type: mongoose.Schema.Types.Mixed, required: true},
    routeID: {type: mongoose.Schema.Types.Mixed, required: true},
    action: {
        actionType: {type: mongoose.Schema.Types.Mixed, required: true},
        stationID: {type: mongoose.Schema.Types.Mixed, required: true},
        stationName: {type: mongoose.Schema.Types.Mixed, required: true},
        address: {type: mongoose.Schema.Types.Mixed, required: true},
        longitude: {type: mongoose.Schema.Types.Mixed, required: true},
        latitude: {type: mongoose.Schema.Types.Mixed, required: true}
    },
    dateCommited: {
        dateRecorded: {type: mongoose.Schema.Types.Mixed, required: true},
        timeRecorded: {type: mongoose.Schema.Types.Mixed, required: true},
        monthName: {type: mongoose.Schema.Types.Mixed, required: true},
        monthNumber: {type: mongoose.Schema.Types.Mixed, required: true}
    }
})

module.exports = mongoose.model("DriverActivities", driveractivities, "driveractivities" );