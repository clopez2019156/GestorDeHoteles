'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var ServicioUsuarioSchema = Schema({
    servicio: { type: Schema.Types.ObjectId, ref: 'servicios' },
    usuario: { type: Schema.Types.ObjectId, ref: 'usuarios' }
});
module.exports = mongoose.model('servicios pedidos', ServicioUsuarioSchema);