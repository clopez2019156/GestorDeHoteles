'use strict'

var Reservacion = require("../modelos/reservacion.model")
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
                                    res.status(200).send({ hotelGuardado });
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

function editarHotel(req, res) {
    if (req.user.rol === "ROL_ADMIN") {
        var params = req.body;
        var hotelNombre = params._id;
        delete params._id;
        delete params.habitaciones;
        delete params.eventos;
        Hotel.findOneAndUpdate({ nombre: hotelNombre }, params, { new: true }, (err, hotelActualizado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!hotelActualizado) return res.status(500).send({ mensaje: 'El hotel no se ha actualizado' });

            return res.status(200).send({ hotelActualizado });
        });
    } else {
        return res.status(500).send({ mensaje: 'No tiene permisos para editar hotel' });
    }

}

function eliminarHotel(req, res) {
    if (req.user.rol === "ROL_ADMIN") {
        var params = req.body;

        Hotel.findOneAndDelete({ _id: params.id }, (err, hotelEliminado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!hotelEliminado) return res.status(500).send({ mensaje: 'No se ha eiminado el hotel' });

            return res.status(200).send({ hotelEliminado });
        })

    }

}

function agregarHabitacionesHotel(req, res) {
    var params = req.body;

    var disponibilidad = "disponible";
    if (req.user.rol === "ROL_ADMIN") {
        if (params.nombreHabitacion && params.precio) {
            Hotel.findOne({ nombre: params.nombre }, (err, hotelEncontrado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if (!hotelEncontrado) return res.status(500).send({ mensaje: 'El hotel no existe o no es admin de este' });

                Hotel.findOne({ _id: hotelEncontrado._id, "habitaciones.nombreHabitacion": params.nombreHabitacion }, { "habitaciones.$": 1, nombreHabitacion: 1, precio: 1, disponibilidad: 1, administrador: 1 }, (err, habitacionEncontrada) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                    if (!habitacionEncontrada) {
                        Hotel.updateOne({ nombre: hotelEncontrado.nombre }, {
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
                        return res.status(500).send({ mensaje: 'esta habitacion ya existe ' + habitacionEncontrada });
                    } else {
                        return res.status(500).send({ mensaje: ' esta habitacion ya existe' + habitacionEncontrada });
                    }
                });
            });
        } else {
            return res.status(500).send({ mensaje: 'No puede dejar parametros vacíos' });
        }
    } else {
        return res.status(500).send({ mensaje: 'No tiene permisos para agregar hotel' });
    }

}

function hacerReservacion(req, res) {
    var params = req.body;
    var reservacionModel = new Reservacion();


    reservacionModel.usuario = req.user.sub;
    reservacionModel.hotel = params.hotel;
    reservacionModel.fechaEntrada = params.fechaEntrada;
    reservacionModel.fechaSalida = params.fechaSalida;
    reservacionModel.habitacion = params.habitacion;

    Hotel.findOne({ _id: reservacionModel.hotel, "habitaciones.nombreHabitacion": params.habitacion }, { "habitaciones.$": 1, nombreHabitacion: 1, precio: 1, disponibilidad: 1 }, (err, habitacionEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!habitacionEncontrada) return res.status(500).send({ mensaje: 'No existe la habitación' });

        if (habitacionEncontrada.habitaciones[0].disponibilidad === 'disponible') {

            reservacionModel.save((err, reservacionHecha) => {
                if (err) res.status(500).send({ mensaje: 'error en la peticion' });
                if (!reservacionHecha) res.status(500).send({ mensaje: 'error al hacer reservacion' });

                Hotel.updateOne({ "habitaciones.nombreHabitacion": params.habitacion }, {
                    $set: {
                        "habitaciones.$.disponibilidad": 'No disponible'
                    }
                }, (err, habitacionModificada) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                    if (!habitacionModificada) return res.status(500).send({ mensaje: 'No se ha agregado la habitacion' });

                });
                return res.status(200).send({ reservacionHecha });
            });
        } else {
            return res.status(500).send({ mensaje: 'Esta habitación ya está reservada' })
        }

    });



}

function verReservaciones(req, res) {
    if (req.user.rol === "ROL_USER") {
        Reservacion.find({ usuario: req.user.sub }, (err, reservacionesEcontradas) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!reservacionesEcontradas) return res.status(500).send({ mensaje: 'NO ha hecho reservaciones' });

            return res.status(200).send({ reservacionesEcontradas });

        });
    } else if (req.user.rol === "ROL_HOTEL") {
        Hotel.findOne({ administrador: req.user.sub }, (err, hotelEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!hotelEncontrado) return res.status(500).send({ mensaje: 'No es admin del hotel' });

            Reservacion.find({ hotel: hotelEncontrado._id }, (err, reservacionesEcontradas) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if (!reservacionesEcontradas) return res.status(500).send({ mensaje: 'NO ha hecho reservaciones' });

                return res.status(200).send({ reservacionesEcontradas });
            });
        });
    } else {
        return res.status(500).send({ mensaje: 'Tiene que iniciar sesion' });
    }
}





module.exports = {
    crearHotel,
    agregarHabitacionesHotel,
    editarHotel,
    eliminarHotel,
    hacerReservacion,
    verReservaciones
}