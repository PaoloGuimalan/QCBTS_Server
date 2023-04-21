const mongoose = require("mongoose")

const busdata = mongoose.Schema({
    busID: {type: mongoose.Schema.Types.Mixed, required: true},
    busNo: {type: Number, required: true},
    companyID: {type: mongoose.Schema.Types.Mixed, required: true},
    driverID: {type: mongoose.Schema.Types.Mixed, required: true},
    busModel: {type: mongoose.Schema.Types.Mixed, required: true},
    plateNumber: {type: mongoose.Schema.Types.Mixed, required: true},
    capacity: {type: mongoose.Schema.Types.Mixed, required: true}
})

module.exports = mongoose.model("BusData", busdata, "buses" );