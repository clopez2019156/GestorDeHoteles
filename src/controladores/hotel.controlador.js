'use strict'

var Usuario = require("../modelos/usuarios.model");
var Hotel = require("../modelos/hotel.model");
var bcrypt = require('bcrypt-nodejs');
var jwt = require("../servicios/jwt");
const usuariosModel = require("../modelos/usuarios.model");

//funciones del administrador de la app

function crearHotel(req, res) {
    var params = req.body;
    var hotelModel = new Hotel();

    if (req.user.rol === "ROL_ADMIN") {
        hotelModel.nombre = params.nombre;
        hotelModel.direccion = params.direccion;
        hotelModel.administrador = params.administrador;
        if (hotelModel.nombre && hotelModel.direccion && params.administrador) {
            Usuario.findOne({ _id: hotelModel.administrador }).exec((err, UsuarioEncontrado) => {
                if (err) return res.status(404).send({ mensaje: "error en la peticion" });
                if (!UsuarioEncontrado) return res.status(404).send({ mensaje: "Este administrador no existe" });
                if (UsuarioEncontrado._id == params.administrador && UsuarioEncontrado.rol === 'ROL_HOTEL') {
                    Hotel.find({
                        nombre: hotelModel.nombre
                    }).exec((err, hotelEncontrado) => {
                        if (err) return res.status(400).send({ mensaje: "Error creando el hotel" });
                        if (hotelEncontrado.length >= 1) {
                            return res.status(400).send({ mensaje: "Este hotel ya existe" });
                        } else {
                            hotelModel.save((err, hotelGuardado) => {
                                if (err) res.status(500).send({ mensaje: "Error en la peticion" });
                                if (hotelGuardado) {
                                    res.status(400).send({ hotelGuardado });
                                } else {
                                    res.status(404).send({ mensaje: "El hotel no se pudo crear" });
                                }
                            });

                        }
                    });
                } else {
                    res.status(404).send({ mensaje: "este usuario no es administrador de hotel" });
                }
            });

        } else {
            res.status(404).send({ mensaje: "No puede dejar datos vacíos" });
        }
    } else {
        res.status(404).send({ mensaje: "No tiene permisos para crear hoteles" });
    }
}


function agregarHabitacionesHotel(req, res) {
    var params = req.body;

    var disponibilidad = "disponible";
    if (params.nombreHabitacion && params.precio) {
        Hotel.findOne({ administrador: req.user.sub }, (err, hotelEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!hotelEncontrado) return res.status(500).send({ mensaje: 'El hotel no existe o no es admin de este' });

            Hotel.findOne({ _id: hotelEncontrado._id, "habitaciones.nombreHabitacion": params.nombreHabitacion }, { "habitaciones.$": 1, nombreHabitacion: 1, precio: 1, disponibilidad: 1, administrador: 1 }, (err, habitacionEncontrada) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if (!habitacionEncontrada) {
                    Hotel.updateOne({ administrador: req.user.sub }, {
                        $push: {
                            habitaciones: {
                                nombreHabitacion: params.nombreHabitacion,
                                precio: params.precio,
                                disponibilidad: disponibilidad
                            }
                        }
                    }, (err, habitacionAgregada) => {

                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                        if (!habitacionAgregada) return res.status(500).send({ mensaje: 'No se ha agregado la habitacion' });
                        Hotel.find({
                            administrador: req.user.sub
                        }).exec((err, hotelEncontrado) => {
                            if (err) return res.status(400).send({ mensaje: "Error creando el hotel" });
                            return res.status(200).send({ hotelEncontrado });
                        });

                    });

                } else if (habitacionEncontrada >= 1) {
                    return res.status(500).send({ mensaje: 'ff ' + habitacionEncontrada });
                } else {
                    return res.status(500).send({ mensaje: 'hh ' + habitacionEncontrada });
                }
            });
        });
    } else {
        return res.status(500).send({ mensaje: 'No puede dejar parametros vacíos' });
    }

}





module.exports = {
    crearHotel,
    agregarHabitacionesHotel
}