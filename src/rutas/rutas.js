'use strict'

var express = require("express");
var md_autorizacion = require("../middlewares/authenticated.js");
var api = express.Router();
var UsuarioControlador = require("../controladores/usuarios.controlador");
var HotelControlador = require("../controladores/hotel.controlador");
var ServicioControlador = require("../controladores/servicio.controlador");
var FacturaControlador = require("../controladores/factura.controlador");


//rutas usuarioControlador
api.post("/crearAdminHotel", md_autorizacion.ensureAuth, UsuarioControlador.crearAmdinHotel);
api.get("/verUsuarios", md_autorizacion.ensureAuth, UsuarioControlador.verUsuarios);


//rutas hotelControlador
api.post("/crearHotel", md_autorizacion.ensureAuth, HotelControlador.crearHotel);
api.put("/agregarHabitacionesHotel", md_autorizacion.ensureAuth, HotelControlador.agregarHabitacionesHotel);


//rutas generales
api.post("/buscarHotel", UsuarioControlador.buscarHotel);
api.post("/mostrarHoteles", UsuarioControlador.mostrarHoteles);


//rutas adminHotel
api.put("/agregarEvento", md_autorizacion.ensureAuth, UsuarioControlador.agregarEvento);

//rutas usuario normal
api.post("/hacerReservacion", md_autorizacion.ensureAuth, UsuarioControlador.hacerReservacion);
api.post("/crearUsuario", UsuarioControlador.crearUsuario);
api.delete("/eliminarCuenta", md_autorizacion.ensureAuth, UsuarioControlador.eliminarCuenta);
api.put("/editarCuenta", md_autorizacion.ensureAuth, UsuarioControlador.editarCuenta);
api.get("/verHabitaciones", UsuarioControlador.verHabitaciones);
api.get("/verEventos", UsuarioControlador.verEventos);
api.delete("/cancelarReservacion", UsuarioControlador.cancelarReservacion);
api.get("/verCuenta", md_autorizacion.ensureAuth, UsuarioControlador.verCuenta);


api.post("/login", UsuarioControlador.login);


//rutas servicio
api.post("/agregarServicio", md_autorizacion.ensureAuth, ServicioControlador.agregarServicio);
api.post("/pedirServicio", md_autorizacion.ensureAuth, ServicioControlador.pedirServicio);
api.post("/verServicios", ServicioControlador.verServicios);


//facturas
api.post("/facturar", FacturaControlador.facturar);

module.exports = api;