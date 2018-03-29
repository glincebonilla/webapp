'use strict'
var jwt = require('jwt-simple');
//Moment para  fechas de creación y expiración del token.
var moment = require('moment');
var secret = 'clave_secreta_curso';

//Comprobar si los datos que vamos a recibir son correctos o no.
//Este metodo se va ha ejecutar antes de que se ejecute una accion de un controlador.
exports.ensureAuth = function(req, res, next){
	//Verifico que el header exista
	if(!req.headers.authorization){

		res.status(403).send({message:"La petición no tiene la cabecera de autenticación"});

	}

    //Recojemos el contenido de la autorizacion, es posible que venga con comillas y toca quitarselas.
	var token = req.headers.authorization.replace(/['"]+/g, '');
	//Decodifico el token de jwt
	try {
		//Decodificamos el token
		var payload = jwt.decode(token , secret);
		//si ya paso la fecha de expiración.
		if(payload.exp <= moment.unix()){
           res.status(401).send({message:"El Token ha expirado"});
		}

		
	} catch(ex) {
		res.status(404).send({message:"Token no valido"});
	}
    
    //Le añadimos una propiedad al objeto Reques, es decir vamos a tener disponible dentro de cada metodo queu utilice este middleware un objeto user con todos los datos del usuario.
	req.user = payload;

	//Invocamos la funcion next para salir del middleware.
	next();//Ya queda disponible para usarlo dentro de una ruta.

};