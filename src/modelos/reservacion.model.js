'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ReservacionSchema = Schema({
    usuario: { type: Schema.Types.ObjectId, ref: 'usuarios' },
    hotel: { type: Schema.Types.ObjectId, ref: 'hoteles' },
    fechaEntrada: Date,
    fechaSalida: Date,
    habitacion: String
});

module.exports = mongoose.model('reservaciones', ReservacionSchema);