'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var ServicioUsuarioSchema = Schema({
    usuario: { type: Schema.Types.ObjectId, ref: 'usuarios' },
    servicio: { type: Schema.Types.ObjectId, ref: 'servicios' }

});
module.exports = mongoose.model('servicios pedidos', ServicioUsuarioSchema);