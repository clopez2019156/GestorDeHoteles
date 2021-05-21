'use strict'

const express = require("express");
const app = express();
const bodyParser = require('body-parser');

var rutas = require("./src/rutas/rutas");


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', rutas);

module.exports = app;