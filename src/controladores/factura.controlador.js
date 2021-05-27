'use strict'

var Usuario = require("../modelos/usuarios.model");
var Hotel = require("../modelos/hotel.model");
var Reservacion = require("../modelos/reservacion.model");
var Factura = require("../modelos/factura.model")
var Servicios = require("../modelos/servicio.model");
var moment = require('moment');

function facturar(req, res) {
    var total = 0;
    var diasHospedado = 0;
    var params = req.body;
    var facturaModel = new Factura();
    Reservacion.findById(params.id, (err, reservacionEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!reservacionEncontrada) return res.status(500).send({ mensaje: 'No se ha encontrado la reservacion' });

        facturaModel.reservacion = reservacionEncontrada._id;

        Hotel.findOne({ _id: reservacionEncontrada.hotel, "habitaciones.nombreHabitacion": reservacionEncontrada.habitacion }, { "habitaciones.$": 1, nombreHabitacion: 1, precio: 1, disponibilidad: 1 }, (err, habitacionEncontrada) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!habitacionEncontrada) return res.status(500).send({ mensaje: 'No existe la habitación' });

            Servicios.find({ usuario: reservacionEncontrada.usuario }, (err, serviciosEncontrados) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

                for (var i = 0; i < serviciosEncontrados.length; i++) {
                    total = total + serviciosEncontrados[i].precio;
                }
                var fecha1 = moment(reservacionEncontrada.fechaEntrada);
                var fecha2 = moment(reservacionEncontrada.fechaSalida);
                diasHospedado = fecha2.diff(fecha1, 'days');
                facturaModel.diasHospedado = diasHospedado;
                facturaModel.precioH = habitacionEncontrada.habitaciones[0].precio;
                facturaModel.total = diasHospedado * (habitacionEncontrada.habitaciones[0].precio) + total;
                facturaModel.save((err, facturaGuardada) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                    if (!facturaGuardada) return res.status(500).send({ mensaje: 'No se pudo facturar' });

                    return res.status(200).send({ facturaGuardada });
                });

            });

        });
    });

}




module.exports = {
    facturar
}