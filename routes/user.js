'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var api = express.Router();
//Caragamos el middelware para la verificacion del usuario
var md_auth = require('../middlewares/authenticated');

//Modulo que nos va ha permitir cargar archivos por http
var multipart = require('connect-multiparty');
//Middleware para gestionar archivos
var md_upload = multipart({uploadDir: './uploads/users'});


api.get('/probando-controlador' , md_auth.ensureAuth , UserController.pruebas);
api.post('/register' , UserController.SaveUser);
api.post('/login' , UserController.loginUser);
//Para actualizar se utiliza el metodo put, el cual re cibira un id obligatorio, si fuera opcional se le pone interrogacion, 
//pero como es obligario se queda asi
api.put('/update-user/:id' , md_auth.ensureAuth , UserController.updateUser);

//Ruta para subir la imagen del usuario, igual requiere autenticación.
api.post('/upload-image-user/:id' , [md_auth.ensureAuth , md_upload] , UserController.uploadImage);
//ruta para devolver una imagen
api.get('/get-image-user/:imageFile' , UserController.getImageFile);

module.exports = api;