'use strict'
var jwt = require('jwt-simple');
//Moment para  fechas de creación y expiración del token.
var moment = require('moment');
var secret = 'clave_secreta_curso';


//Creo el metodo para crear el token


//Creamos un metodo y lo exportamos de uan vez. le pasamos el usuario que va ha codificar dentro del token.
exports.createToken = function(user){
   var payload = {//Objeto que vamos a codificar con el token
      sub: user._id,//id del registro o documento de la base de datos
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
      iat: moment().unix() ,//fecha de creación del token
      exp: moment().add(30 , 'days').unix // que expire cada 30 días, y se maneje en formato unix
   };
 
   //retorno el objeto codificado en JWT. Le pasamos una clave secreta para codificar o hasear el objeto payload
   return jwt.encode(payload , secret);
};