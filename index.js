'use strict'
var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3977;
//Quitar aviso de mongose promise dentro de la consola.
mongoose.Promise = global.Promise;
//Me conecto a la base de datos.
mongoose.connect('mongodb://localhost:27017/curso_mean2' , ( err,res) => {
	if(err){
		throw err;
	}else{
		console.log("La base de datos esta funcionando correctamente");
        app.listen(port, function(){
           console.log("Servidor del API rest de musica esta escuchando en http://localhost:" + port);
        });
	}
});