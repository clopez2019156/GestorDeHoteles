'use stict'

var Usuario = require("../modelos/usuarios.model");
var Hotel = require("../modelos/hotel.model");
var Reservacion = require("../modelos/reservacion.model");
var bcrypt = require('bcrypt-nodejs');
var jwt = require("../servicios/jwt");
const hotelModel = require("../modelos/hotel.model");


function adminApp(req, res) {
    var usuarioModel = Usuario();
    usuarioModel.username = "Administrador";
    usuarioModel.rol = "ROL_ADMIN";
    Usuario.find({
        username: "Administrador"
    }).exec((err, adminoEncontrado) => {
        if (err) return console.log({ mensaje: "Error creando Administrador" });
        if (adminoEncontrado.length >= 1) {
            return console.log("El Administrador está listo");
        } else {
            bcrypt.hash("123456", null, null, (err, passwordEncriptada) => {
                usuarioModel.password = passwordEncriptada;
                usuarioModel.save((err, usuarioguardado) => {
                    if (err) return console.log({ mensaje: "Error en la peticion" });
                    if (usuarioguardado) {
                        console.log("Administrador listo");
                    } else {
                        console.log({ mensaje: "El administrador no está listo" });
                    }
                });
            });
        }
    });
}


//funciones del administrador de la app
function crearAdminHotel(req, res) {
    var params = req.body;
    var usuarioModel = Usuario();
    usuarioModel.username = params.username;
    usuarioModel.password = params.password;
    usuarioModel.rol = "ROL_HOTEL";
    if (req.user.rol === "ROL_ADMIN") {
        Usuario.find({
            username: usuarioModel.username
        }).exec((err, adminoEncontrado) => {
            if (err) return res.status(400).send({ mensaje: "Error creando administrador de hotel" });
            if (adminoEncontrado.length >= 1) {
                return res.status(400).send({ mensaje: "Este administrador de hotel ya existe" });
            } else {
                bcrypt.hash(usuarioModel.password, null, null, (err, passwordEncriptada) => {
                    usuarioModel.password = passwordEncriptada;
                    usuarioModel.save((err, usuarioguardado) => {
                        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                        if (!usuarioguardado) return res.status(400).send({ mensaje: "El administrador de hotel no se pudo crear" });
                        return res.status(200).send({ usuarioguardado });

                    });
                });
            }
        });
    } else {
        res.status(401).send({ mensaje: "No tiene permisos para crear un administrador de hotel" });
    }
}

function verUsuarios(req, res) {

    if (req.user.rol === "ROL_ADMIN") {
        Usuario.find((err, usuarios) => {
            if (err) return res.status(404).send({ mensaje: "error en la peticion" });
            return res.status(200).send({ usuarios });
        });
    } else {
        res.status(500).send({ mensaje: "No tiene permisos para ver usuarios" });
    }
}


function verAdminsHotel(req, res) {

    //if (req.user.rol === "ROL_ADMIN") {
    Usuario.find({ rol: "ROL_HOTEL" }, (err, usuarios) => {
        if (err) return res.status(404).send({ mensaje: "error en la peticion" });
        return res.status(200).send({ usuarios });
    });
    //} else {
    //    res.status(401).send({ mensaje: "No tiene permisos para ver usuarios" });
    // }
}

function login(req, res) {
    var params = req.body;
    Usuario.findOne({ username: params.username }, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición" });
        if (usuarioEncontrado) {
            bcrypt.compare(params.password, usuarioEncontrado.password, (err, passVerificada) => {
                if (err) return res.status(500).send({ mensaje: "Error en la petición" });
                if (passVerificada) {
                    if (params.getToken == "true") {
                        return res.status(200).send({
                            token: jwt.createToken(usuarioEncontrado)
                        });
                    } else {
                        usuarioEncontrado.password = undefined;
                        return res.status(200).send({ usuarioEncontrado });
                    }
                } else {
                    return res.status(500).send({ mensaje: "El usuario no se ha podido identificar" });
                }
            })
        } else {
            return res.status(500).send({ mensaje: "Error al buscar usuario" });
        }
    });
}


//funciones de administradores de hoteles

function buscarUsuarioHospedado(req, res) {
    var params = req.body;

    if (req.user.rol === "ROL_HOTEL") {

        Hotel.findOne({ administrador: req.user.sub }, (err, hotelEncontrado) => {
            if (err) res.status(200).send({ mensaje: 'Error en la petición' });
            if (!hotelEncontrado) return res.status(200).send({ mensaje: 'hotel no encontrado' });

            Usuario.findOne({ username: params.username }, (err, usuarioEncontrado) => {
                if (err) res.status(200).send({ mensaje: 'Error en la petición' });
                if (!usuarioEncontrado) {
                    res.status(200).send({ mensaje: 'usuario no hospedado' });
                } else {

                    Reservacion.find({ hotel: hotelEncontrado._id, usuario: usuarioEncontrado._id }, (err, reservacionEncontrada) => {
                        if (err) res.status(200).send({ mensaje: 'Error en la petición' });
                        if (!reservacionEncontrada) res.status(200).send({ mensaje: 'usuario no hospedado' });


                        return res.status(200).send({ usuarioEncontrado });
                    });
                }
            });
        });

    }

}

function agregarEvento(req, res) {
    var params = req.body;
    Usuario.findById({ _id: req.user.sub }, (err, adminEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (params.tipoEvento && params.fecha && params.hora) {
            Hotel.updateOne({ administrador: adminEncontrado._id }, {
                $push: {
                    eventos: {
                        tipoEvento: params.tipoEvento,
                        fecha: params.fecha,
                        hora: params.hora
                    }
                }
            }, (err, eventoAgregado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if (!eventoAgregado) return res.status(500).send({ mensaje: 'No se ha agregado el evento' });
                Hotel.find({
                    administrador: adminEncontrado._id
                }).exec((err, hotelEncontrado) => {
                    if (err) return res.status(400).send({ mensaje: "Error en la peticion" });
                    return res.status(200).send({ hotelEncontrado });
                });

            });
        } else {
            return res.status(500).send({ mensaje: 'No puede dejar parametros vacíos' });
        }
    });

}


//funciones de usuarios normales
function verCuenta(req, res) {
    Usuario.findById(req.user.sub, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'error en la peticion' });
        if (!usuarioEncontrado) return res.status(500).send({ mensaje: 'error al buscar usuario' });

        return res.status(200).send({ usuarioEncontrado });
    })
}

function obtenerUsuarios(req, res) {
    // Usuario.find().exec((err, usuariosEncontrados)=>{})
    Usuario.find((err, usuariosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Obtener Usuarios' })
        if (!usuariosEncontrados) return res.status(500).send({ mensaje: 'Error en la consulta de Usuarios' })
            // usuariosEncontrados === [datos] ||  !usuariosEncontrados === [] <-- no trae nada
        return res.status(200).send({ usuariosEncontrados })
            // {
            //     usuariosEncontrados: ["array de lo que contenga esta variable"]
            // }

    })
}

function obtenerUsuarioID(req, res) {
    var idUsuario = req.params.idUsuario
        // User.find({ _id: idUsuario }, (err, usuarioEncontrado)=>{})  <---- Me retorna un Array = [] || usuarioEncontrado[0].nombre
        // User.findOne({ _id: idUsuario }, (err, usuarioEncontrado)=>{})  <--- Me retorna un objeto = {} || usuarioEncontrado.nombre
    Usuario.findById(idUsuario, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion del Usuario' })
        if (!usuarioEncontrado) return res.status(500).send({ mensaje: 'Error en obtener los datos del Usuario' })
        console.log(usuarioEncontrado.email);
        return res.status(200).send({ usuarioEncontrado })
    })
}


function cancelarReservacion(req, res) {
    var params = req.body;

    Reservacion.findOneAndDelete({ _id: params.reservacion }, (err, reservacionCancelada) => {
        if (err) return res.status(500).send({ mensaje: 'error en la peticion' });
        if (!reservacionCancelada) return res.status(500).send({ mensaje: 'error al cancelar la reservación' });

        Hotel.updateOne({ _id: reservacionCancelada.hotel, "habitaciones.nombreHabitacion": reservacionCancelada.habitacion }, {
            $set: {
                "habitaciones.$.disponibilidad": 'disponible'
            }
        }, (err, habitacionModificada) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!habitacionModificada) return res.status(500).send({ mensaje: 'No se ha agregado la habitacion' });
            return res.status(200).send({ mensaje: 'reservacion cancelada' });
        });


    });
}

function eliminarCuenta(req, res) {
    var params = req.body;
    Usuario.findOneAndDelete({ _id: params._id }, (err, usuarioEliminado) => {
        if (err) return res.status(500).send({ mensaje: "error en la peticion" });
        if (!usuarioEliminado) return res.status(500).send({ mensaje: "no se pudo eliminar el usuario" });

        return res.status(200).send({ mensaje: 'el usuario: ' + usuarioEliminado.username + ' ha sido eliminado' })
    })
}

function editarCuenta(req, res) {
    var params = req.body;
    var id = params._id;
    delete params._id;
    delete params.rol;
    delete params.password;
    Usuario.findOneAndUpdate({ _id: id }, params, { new: true }, (err, usuarioEditado) => {
        if (err) return res.status(500).send({ mensaje: 'Error de peticion' })
        if (!usuarioEditado) return res.status(500).send({ mensaje: 'No se ha podido editar al Usuario' })

        return res.status(200).send({ usuarioEditado });
    })

}

function verHabitaciones(req, res) {
    var params = req.body;
    Hotel.find({ _id: params.hotel, "habitaciones.disponibilidad": 'disponible' }, { "habitaciones.$": 1, nombreHabitacion: 1, precio: 1, disponibilidad: 1 }, (err, habitacionEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!habitacionEncontrada) return res.status(500).send({ mensaje: 'No existe la habitación' });

        return res.status(200).send({ habitacionEncontrada });



    });

}

function verEventos(req, res) {
    var params = req.body;
    Hotel.find({ _id: params.hotel, "habitaciones.disponibilidad": 'disponible' }, { "habitaciones.$": 1, nombreHabitacion: 1, precio: 1, disponibilidad: 1 }, (err, habitacionEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!habitacionEncontrada) return res.status(500).send({ mensaje: 'No existe la habitación' });

        return res.status(200).send({ habitacionEncontrada });



    });

}

//funciones generales
function mostrarHoteles(req, res) {
    hotelModel.find((err, hotelEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'error en la peticion' });
        if (!hotelEncontrado) return res.status(500).send({ mensaje: 'No hay hoteles' });

        return res.status(200).send({ hotelEncontrado });
    })
}

function buscarHotel(req, res) {
    var params = req.body;
    hotelModel.findOne({ nombre: params.nombre }, (err, hotelEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'error en la peticion' });
        if (!hotelEncontrado) {
            hotelModel.findOne({ direccion: params.nombre }, (err, hotelEncontrado) => {
                if (err) return res.status(500).send({ mensaje: 'error en la peticion' });
                if (!hotelEncontrado) return res.status(500).send({ mensaje: 'este hotel no existe' });

                return res.status(200).send({ hotelEncontrado });
            })

        } else {
            return res.status(200).send({ hotelEncontrado });
        }
    });

}


function crearUsuario(req, res) {
    var params = req.body;
    var usuarioModel = Usuario();
    if (params.username && params.password) {
        usuarioModel.username = params.username;
        usuarioModel.password = params.password;
        usuarioModel.rol = "ROL_USER";

        Usuario.findOne({ username: params.username }, (err, usuarioEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'error en la peticion' });
            if (!usuarioEncontrado) {
                bcrypt.hash(usuarioModel.password, null, null, (err, passwordEncriptada) => {
                    usuarioModel.password = passwordEncriptada;
                    usuarioModel.save((err, usuarioGuardado) => {
                        if (err) res.status(500).send({ mensaje: "Error en la peticion" });
                        if (usuarioGuardado) {
                            return res.status(200).send({ usuarioGuardado });
                        } else {
                            return res.status(404).send({ mensaje: "El usuario no se pudo crear" });
                        }
                    });
                });
            } else {
                return res.status(500).send({ mensaje: 'este usuario ya existe' });
            }
        })
    } else {
        return res.status(500).send({ mensaje: 'No puede dejar parametros vacíos' });
    }
}

function editarUsuario(req, res) {
    var idUsuario = req.params.idUsuario;
    var params = req.body;

    // BORRAR LA PROPIEDAD DE PASSWORD PARA QUE NO SE PUEDA EDITAR
    delete params.password;
    delete params.rol;

    // req.user.sub <--- id Usuario logeado
    if (idUsuario != req.user.sub) {
        return res.status(500).send({ mensaje: 'No posees los permisos necesarios para actulizar este Usuario.' });
    }

    Usuario.findByIdAndUpdate(idUsuario, params, { new: true }, (err, usuarioActualizado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!usuarioActualizado) return res.status(500).send({ mensaje: 'No se ha podido actualizar al Usuario' });
        // usuarioActualizado.password = undefined;
        return res.status(200).send({ usuarioActualizado });
    })


}

function eliminarUsuario(req, res) {
    const idUsuario = req.params.idUsuario;

    if (idUsuario != req.user.sub) {
        return res.status(500).send({ mensaje: 'No posee los permisos para eliminar a este Usuario.' })
    }

    Usuario.findByIdAndDelete(idUsuario, (err, usuarioEliminado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Eliminar' });
        if (!usuarioEliminado) return res.status(500).send({ mensaje: 'Error al eliminar el usuario.' });

        return res.status(200).send({ usuarioEliminado });
    })
}


module.exports = {
    adminApp,
    login,
    crearAdminHotel,
    verUsuarios,
    verAdminsHotel,
    mostrarHoteles,
    buscarHotel,
    buscarUsuarioHospedado,
    crearUsuario,
    agregarEvento,
    eliminarCuenta,
    editarCuenta,
    verHabitaciones,
    cancelarReservacion,
    verEventos,
    verCuenta,
    obtenerUsuarios,
    obtenerUsuarioID,
    editarUsuario,
    eliminarUsuario
}