const mongoose = require("mongoose")

const busstopsdata = mongoose.Schema({
    busStopID: {type: mongoose.Schema.Types.Mixed, required: true},
    stationName: {type: mongoose.Schema.Types.Mixed, required: true},
    stationAddress: {type: mongoose.Schema.Types.Mixed, required: true},
    coordinates: {
        longitude: {type: mongoose.Schema.Types.Mixed, required: true},
        latitude: {type: mongoose.Schema.Types.Mixed, required: true}
    },
    dateAdded: {type: mongoose.Schema.Types.Mixed, required: true},
    addedBy: {type: mongoose.Schema.Types.Mixed, required: true},
    status: {type: Boolean, required: true}
})

module.exports = mongoose.model("BusStopsData", busstopsdata, "busstops" );