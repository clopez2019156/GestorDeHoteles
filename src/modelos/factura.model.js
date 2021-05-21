'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var FacturaSchema = Schema({
    reservacion: { type: Schema.Types.ObjectId, ref: 'reservaciones' },
    total: String
});

module.exports = mongoose.model('facturas', FacturaSchema);