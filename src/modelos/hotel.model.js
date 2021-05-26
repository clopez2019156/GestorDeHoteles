'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var HotelSchema = Schema({
    nombre: String,
    direccion: String,
    administrador: { type: Schema.Types.ObjectId, ref: 'usuarios' },
    habitaciones: [{
        nombreHabitacion: String,
        precio: Number,
        disponibilidad: String
    }],
    eventos: [{
        tipoEvento: String,
        fecha: String,
        hora: String
    }]

});

module.exports = mongoose.model('hoteles', HotelSchema);