var express = require('express');
var bodyParser = require('body-parser');
var app = express();

const cors = require('cors');


var corsOptions = { origin: true, optionsSuccessStatus: 200 };
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

const {
    DynamoDB
} = require('@aws-sdk/client-dynamodb');

var AWS = require('aws-sdk');
//Nuevo 
const mysql = require('mysql');  //<- para importar la base de datos 
const aws_keys = require('./creds_template'); // <-- se agrega la clase en donde estan las credenciales 

var port = 9000;
app.listen(port);
console.log("Escuchando en el puerto", port)


// se manda a llamar las credenciales de Mysql 
const db_credentials = require('./db_creds'); //<-- Se importa las credenciales de la base de datos 
var conn = mysql.createPool(db_credentials); // <- Se crea un pool para realizar la conexion a la base de datos 

// Se instancian todos los objetos de aws 
const s3 = new AWS.S3(aws_keys.s3);  //--------> Alamacenamiento S3
const ddb = new DynamoDB(aws_keys.dynamodb); //------> Base de datos - Dynamo 

//---------------------------------Ejemplo S3----------------------------------
app.post('/subirfoto', function (req, res){

    var id = req.body.id;
    var foto = req.body.foto;
    //carpeta y nombre que quieran darle a la imagen
  
    var nombrei = "fotos/" + id + ".jpg"; // fotos -> se llama la carpeta 
    //se convierte la base64 a bytes
    let buff = new Buffer.from(foto, 'base64');
  


    AWS.config.update(aws_keys.s3);

    var s3 = new AWS.S3(); // se crea una variable que pueda tener acceso a las caracteristicas de S3
    // metodo 1
    const params = {
      Bucket: "bucketejemploonjetos1608",
      Key: nombrei,
      Body: buff,
      ContentType: "image"
    };
    const putResult = s3.putObject(params).promise();
    res.json({ mensaje: putResult })

});

app.post('/obtenerfoto', function (req, res) {
    var id = req.body.id;
    var nombrei = "fotos/"+id+".jpg";

    AWS.config.update(aws_keys.s3);

    var S3 = new AWS.S3();

    var getParams = 
    {
        Bucket: "bucketejemploonjetos1608",
        Key: nombrei
    }

    S3.getObject(getParams, function(err, data){
        if (err)
        {
            res.json(err)
        }else
        {
            var dataBase64 = Buffer.from(data.Body).toString('base64'); //resgresar de byte a base
            res.json({mensaje: dataBase64})
        }

    })

});

//---------------------------------Ejemplo DB ------------------------------------


///DYNAMO 
//subir foto y guardar en dynamo
app.post('/saveImageInfoDDB', (req, res) => {
    let body = req.body;

    let name = body.name;
    let base64String = body.base64;
    let extension = body.extension;

    //Decodificar imagen
    let encodedImage = base64String;
    let decodedImage = Buffer.from(encodedImage, 'base64');
    let filename = `${name}.${extension}`; 

            ddb.putItem({
                TableName: "EjemploDynamo", // el nombre de la tabla de dynamoDB 
                Item: {
                    "id": { S: name},
                    "foto": { S: base64String }
                }
            }, function (err, data) {
                if (err) {
                    console.log('Error saving data:', err);
                    res.send({ 'message': 'ddb failed' });
                } else {
                    console.log('Save success:', data);
                    res.send({ 'message': 'ddb success' });
                }
            });
     
})


/******************************RDS *************/
//obtener datos de la BD
app.get("/getdata", async (req, res) => {
    conn.query(`SELECT * FROM ejemplo`, function (err, result) {
        if (err) throw err;
        res.send(result);
    });
});

//insertar datos
app.post("/insertdata", async (req, res) => {
    let body = req.body;
    conn.query('INSERT INTO ejemplo VALUES(?,?)', [body.id, body.nombre], function (err, result) {
        if (err) throw err;
        res.send(result);
    });
});

