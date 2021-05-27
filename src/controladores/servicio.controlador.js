'use stict'

var Usuario = require("../modelos/usuarios.model");
var Hotel = require("../modelos/hotel.model");
var Servicio = require("../modelos/servicio.model");
var Reservacion = require("../modelos/reservacion.model");

function agregarServicio(req, res) {
    var params = req.body;
    var servicioModel = new Servicio();
    if (req.user.rol === "ROL_HOTEL") {
        if (params.tipoServicio && params.precio) {
            Hotel.findOne({ administrador: req.user.sub }, (err, hotelEncontrado) => {
                if (err) return res.status(500).send({ mensaje: 'error en la peticion' });

                Reservacion.findOne({ _id: params.reservacion }, (err, reservacionEncontrada) => {
                    if (err) return res.status(500).send({ mensaje: 'error en la peticion' });
                    if (!reservacionEncontrada) return res.status(500).send({ mensaje: 'no ha reservado habitacion' });

                    servicioModel.usuario = reservacionEncontrada.usuario;
                    servicioModel.hotel = hotelEncontrado._id;
                    servicioModel.tipoServicio = params.tipoServicio;
                    servicioModel.precio = params.precio;

                    servicioModel.save((err, servicioPedido) => {
                        if (err) return res.status(500).send({ mensaje: "no se guardo el servicio" });

                        return res.status(200).send({ servicioPedido });
                    })
                })
            })

        } else {
            return res.status(500).send({ mensaje: 'no puede dejar parametros vacíos' });
        }
    } else {
        return res.status(500).send({ mensaje: 'no tiene permisos' });
    }
}

function verServicios(req, res) {
    var params = req.body;


    Servicio.find({ hotel: params.hotel }, (err, serviciosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'error en la peticion' });

        return res.status(200).send({ serviciosEncontrados });
    })

}

function verServiciosUsuario(req, res) {
    var params = req.body;

    Servicio.find({ usuario: params.usuario, hotel: params.hotel }, (err, serviciosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'error en la peticion' });

        return res.status(200).send({ serviciosEncontrados });
    })

}



module.exports = {
    agregarServicio,
    verServicios,
    verServiciosUsuario
}