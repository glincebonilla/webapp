'use strict'
//Para trabajar con los ficheros, File System.
var fs = require('fs');
//Otra opcion para trabajar con archivos es con path
var path = require('path');
//Carago el modulo para encriptar
var bcrypt = require('bcrypt-nodejs');
//Importo el modelo
var User = require('../models/User');
var jwt = require('../services/jwt');






function pruebas(req, res){
	res.status(200).send({
		message: 'Probando una acción del controlador de usuarios del API REST con Node y Mongo'
	});
}

function SaveUser(req, res){
   //Creo un objeto usuario
   var user = new User();
   //Recojo los parametros que esten en el cuerpo de la petición lo que llegue por POST
   var params = req.body;
   //guardo en log para ver que llega por la petición.
   console.log(params);
   user.name = params.name;
   user.surname = params.surname;
   user.email = params.email;
   user.role = 'ROLE_ADMIN';
   user.image = null;

   //Guardo los datos en base de datos

   //Primero encripto la contraseña
   //Si el atributo existe encripto la contraseña.
   if(params.password)
   {
      //Le paso una funcion de callback
      bcrypt.hash(params.password, null , null, function (err , hash){
      	user.password = hash;
      	//si el user , email y el surname son diferente de null guardo el usuario en la base de datos
        if(user.name != null && user.email != null && user.surname != null)
        {
        	 //guardo usaurio en base datos, utilizando un modelo de Mongoose
        	 //Si no se produce un error devuelve el usuario que ha guardado.
        	 //Usamos una funcion de Callback de tipo flecha.
        	 user.save((err, userStored) => {
        	 	//Si  hay error
        	 	if(err){
        	 		res.status(500).send({message: 'Error al guardar el usuario'}); 

        	 	}else {
        	 		//Compruebo que se guardo correctamente
        	 		//Si no existe userStored, si al final no lo guardo
        	 		if(!userStored){
                       res.status(404).send({message: 'No se ha registrado el usaurio'});
        	 		}else{
        	 			//Devuelvo un objeto con todos los datos del usuario guardado en la base de datos
                        res.status(404).send({user: userStored}); 
        	 		}
        	 	}
        	 });
        	 
        }else{
        	res.status(200).send({message: 'Rellena todos los campos'});
        	//Error 200 es que todo va correctamente
        	 //Error 500 es que hay un error en el servidor, como por ejemplo no se conecta a la base de datos
             //Error 400 es para indicar que un recurso no existe.
        }

      } );
   }else{
   	  res.status(500).send({message: 'Introduce la contraseña'});
   }
}

//Veririficar si email y contraseña existen en la base de datos.
function loginUser(req, res){
   var params = req.body;
   var email = params.email;
   var password = params.password;

   //Busco por un email especifico con una función de Callback.
   User.findOne({email: email.toLowerCase()} , (err, user) => {
   	//Si existe un error
   	if(err){
   		res.status(500).send({message: "Error en la petición"});
   	}
   	else{
   		//Si no existe el user
   		if(!user){
   			res.status(404).send({message: "El usuario no existe"});

   		}else{
   			//Comprobamos la contraseña
   			bcrypt.compare(password, user.password , function(err, check){
   				if(check){
   					//Devolver los datos del usuario logueado si existe gethast
   					if(params.gethash){
   						//Devolver un token de jwt
   						res.status(200).send({
   							token: jwt.createToken(user)
   						});
   					}else{
   						res.status(200).send({user}); //Toma como nombre de propiedad user por defecto.
   					}
   				}else{
   					res.status(404).send({message: "El usuario no ha podido loguearse"});
   				}

   			});

   		}
   	}

   });
};

function updateUser(req,res){
	//llega el id por la url
	var userId = req.params.id;
	//Consigo el body del put (Recojo el body de la petición, los datos que me lleguen por put)
	var update = req.body;
	//Actualizo los datos de un usuario dado un ID y dado los datos a actualizar
	User.findByIdAndUpdate(userId, update , (err, userUpdated) => {

		if(err){
			res.status(500).send ({message: 'No se ha podido actualizar el usuario'});
		}else{
			if(!userUpdated){
               res.status(404).send ({message: 'Error al actualizar el usuario'});
			}else{
				res.status(200).send({user: userUpdated});
			}
		}

	});
}

function uploadImage(req, res){
	//Recojo el id del usaurio por la url
	var userId = req.params.id;
	//Nombre del archivo
	var file_name = 'imagen no subida...';
	//Comprobamos si viene algo por files
	if(req.files){
		//Tomo el path del fichero (Toma la ruta del servidor)
		var file_path = req.files.image.path;
		//Separo el patch del fichero
		var file_split = file_path.split('/');
        //Tomo el nombre de la imagen
        var file_name = file_split[2];
        //Tomo la extension de la imagen, para ello primero obtiene el array de acuerdo al separador
        var exp_split = file_name.split('\.');
        var file_ext = exp_split[1];
		
		//Verifico que el fichero tenga la ext correcta
		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif' ){
          //Actualizo el objeto del usuario con el nombre de la imagen. dentro de un callback
          User.findByIdAndUpdate(userId , {image: file_name} , (err, userUpdated) => {
          	if(!userUpdated){
               res.status(404).send ({message: 'Error al actualizar el usuario'});
			}else{
				res.status(200).send({image: file_name , user: userUpdated});
			}
          });
		}else{
			res.status(200).send({message: 'Extensión del archivo no es correcta'});
		}

	}else {
		res.status(200).send({message: 'No ha subido ninguna imagen..'});
	}


}

//Metodo para sacar un archivo del servidor
function getImageFile(req, res){
	//Nos va ha llevar por la url, para sacar el archivo del directorio del servidor
	var imageFile = req.params.imageFile;
	var path_file = './uploads/users/' + imageFile;
    //Verificar que exista el archivo
	fs.exists(path_file , function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file))

		}else{
			res.status(200).send({message: 'No existe la imagen...'});
		}

	});
}

//Exporno lo que necesite usar por fuera
module.exports = {
	pruebas,
	SaveUser,
	loginUser,
	updateUser,
	uploadImage,
	getImageFile
}