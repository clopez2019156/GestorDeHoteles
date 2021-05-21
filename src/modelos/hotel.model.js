'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var HotelSchema = Schema({
    nombre: String,
    direccion: String,
    administrador: { type: Schema.Types.ObjectId, ref: 'usuarios' },
    habitaciones: [{
        nombreHabitacion: String,
        precio: String,
        disponibilidad: String
    }],
    eventos: [{
        tipoEvento: String,
        fecha: Date,
        hora: String
    }],
    servicios: [{
        nombre: String
    }]

});

module.exports = mongoose.model('hoteles', HotelSchema);