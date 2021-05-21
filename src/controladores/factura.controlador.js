'use strict'

var Usuario = require("../modelos/usuarios.model");
var Hotel = require("../modelos/hotel.model");
var Reservacion = require("../modelos/reservacion.model");
var Factura = require("../modelos/factura.model")
var ServiciosPedidos = require("../modelos/servicioUsuario.model");

function facturar(req, res) {

    var params = req.body;
    var facturaModel = new Factura();
    Reservacion.findById(params.id, (err, reservacionEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!reservacionEncontrada) return res.status(500).send({ mensaje: 'No se ha encontrado la reservacion' });

        facturaModel.reservacion = reservacionEncontrada._id;

        Hotel.findOne({ _id: reservacionEncontrada.hotel, "habitaciones.nombreHabitacion": reservacionEncontrada.habitacion }, { "habitaciones.$": 1, nombreHabitacion: 1, precio: 1, disponibilidad: 1 }, (err, habitacionEncontrada) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!habitacionEncontrada) return res.status(500).send({ mensaje: 'No existe la habitación' });

            facturaModel.total = habitacionEncontrada.habitaciones[0].precio;

            facturaModel.save((err, facturaGuardada) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if (!facturaGuardada) return res.status(500).send({ mensaje: 'No se guardó la factura' });

                ServiciosPedidos.find((err, serviciosPedidos) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                    if (!facturaGuardada) return res.status(500).send({ mensaje: 'No pidió servicios' });
                    //falta forEach


                });

                return res.status(200).send({ facturaGuardada });
            });



        });

    });

}

module.exports = {
    facturar
}