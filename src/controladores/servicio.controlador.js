'use stict'

var Usuario = require("../modelos/usuarios.model");
var Hotel = require("../modelos/hotel.model");
var Servicio = require("../modelos/servicio.model");
var ServicioUsuario = require("../modelos/servicioUsuario.model");

function agregarServicio(req, res) {
    var params = req.body;
    var servicioModel = new Servicio();

    if (params.tipoServicio && params.precio) {
        Hotel.findOne({ administrador: req.user.sub }, (err, hotelEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'error en la peticion' });
            servicioModel.usuario = req.user.sub;
            servicioModel.hotel = hotelEncontrado._id;
            servicioModel.tipoServicio = params.tipoServicio;
            servicioModel.precio = params.precio;

            Servicio.findOne({ tipoServicio: params.tipoServicio }, (err, servicioEncontrado) => {
                if (err) return res.status(500).send({ mensaje: 'error en la peticion' });
                if (servicioEncontrado) {
                    return res.status(500).send({ mensaje: 'este servicio ya existe' });

                } else {
                    servicioModel.save((err, servicioGuardado) => {
                        if (err) return res.status(500).send({ mensaje: 'error en la peticion' });
                        if (!servicioGuardado) return res.status(500).send({ mensaje: 'no se ha guardado el servicio' });

                        return res.status(200).send({ servicioGuardado });
                    });
                }
            });


        });
    } else {
        return res.status(500).send({ mensaje: 'no puede dejar parametros vacíos' });
    }
}

function verServicios(req, res) {
    var params = req.body;


    Servicio.find({ hotel: params.hotel }, (err, serviciosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'error en la peticion' });

        return res.status(200).send({ serviciosEncontrados });
    })

}

function pedirServicio(req, res) {
    var params = req.body;
    var servicioUsuarioModel = new ServicioUsuario();
    if (params.servicio) {
        Servicio.findOne({ tipoServicio: params.servicio }, (err, servicioEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'error en la peticion' });
            if (!servicioEncontrado) res.status(500).send({ mensaje: 'servicio no disponible' });
            servicioUsuarioModel.servicio = servicioEncontrado._id;
            servicioUsuarioModel.usuario = req.user.sub;

            servicioUsuarioModel.save((err, servicioPedido) => {
                if (err) return res.status(500).send({ mensaje: 'error en la peticion' });
                if (!servicioPedido) return res.status(500).send({ mensaje: 'no se pudo pedir el permiso' });

                return res.status(200).send({ servicioPedido });

            });

        });
    } else {
        return res.status(500).send({ mensaje: 'tiene que pedir un servicio' });
    }
}

module.exports = {
    agregarServicio,
    pedirServicio,
    verServicios
}