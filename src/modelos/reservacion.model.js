'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ReservacionSchema = Schema({
    usuario: { type: Schema.Types.ObjectId, ref: 'usuarios' },
    hotel: { type: Schema.Types.ObjectId, ref: 'hoteles' },
    fechaEntrada: String,
    fechaSalida: String,
    habitacion: String
});

module.exports = mongoose.model('reservaciones', ReservacionSchema);