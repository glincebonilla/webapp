'use strict'
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');


var app = express();

//Cargar Rutas
var user_routes = require('./routes/user');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Configurar las cabeceras http. son para evitar problemas de control de acceso
//El next es para salir del middelware y pasar a otra función.
app.use((req,res,next) => {
  //Con lo siguiente permitimos acceso a todos los dominios.
  res.header('Access-Control-Allow-Origin' , '*');
  //Para que funcione a nivel de Ajax
  res.header('Access-Control-Allow-Headers' , 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method  ');
  //Indicamos los metodos que se van a soportar
  res.header('Access-Control-Allow-Methods' , 'GET, POST, OPTIONS, PUT, DELETE');

  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  //Salir del middleware y continuar con el flujo normal de ejecución, con una ruta concreta de un metodo de un controaldor
  next();
});

//rutas base
//__dirname es el directorio actual, con esto cuando solo ponga ip:puerto o io:puerto/client 
//me va ha cargar el contenido del front.
//en otras palabras si pone api entonces carga el archivo estatico de Express.
//app.use(express.static(path.join(__dirname,'client')));

//Cuando cargues la ruta / carga un fichero estatico express de la carpeta client, el segundo parametro
//indica que no haga ningun tipo de redirect.
app.use('/' , express.static('client' , {redirec:false}));
app.use('/api' , user_routes);
//Creamos una ruta por get para sobrescribir las url virtuales para que la app de angualar active
//el refresco de las paginas internas. entonces cuando se cargue cualquier ruta por get definimos
//el middelware que reescriba la url
//De este manera cuando cargue cualquier ruta que no sea una de las anteriores de /api, me 
//va ha cargar el fichero indicado, entonces ya automaticamente toma lo que esta en la url.
app.get('*' , function(req,res,next) {
  res.sendFile(path.resolve('client/index.html'));
});

module.exports = app;
