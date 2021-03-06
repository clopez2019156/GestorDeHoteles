'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var FacturaSchema = Schema({
    reservacion: { type: Schema.Types.ObjectId, ref: 'reservaciones' },
    total: Number,
    diasHospedado: String,
    precioH: String
});

module.exports = mongoose.model('facturas', FacturaSchema);