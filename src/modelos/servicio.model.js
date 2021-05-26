'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ServicioSchema = Schema({
    usuario: { type: Schema.Types.ObjectId, ref: 'usuarios' },
    hotel: { type: Schema.Types.ObjectId, ref: 'hoteles' },
    tipoServicio: String,
    precio: Number
});

module.exports = mongoose.model('servicios', ServicioSchema);