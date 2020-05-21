const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 2221; //porta padrão
const fs = require('fs');

//configurando o body parser para pegar POSTS mais tarde
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

//definindo as rotas
const router = express.Router();
router.get('/', (req, res) => res.json({ message: 'Serviço conversor de video funcionando!' }));

router.post('/convertFile', (req, res) =>{
	const filename = req.body.filename;
	const id = req.body.id;
	if(filename!=null && filename!=""){
		const nodeCmd = require('node-cmd');
		//nodeCmd.get('handbrakecli --help', (err, data, stderr) => {
		nodeCmd.get('handbrakecli -Z "Gmail Medium 5 Minutes 480p30" -i "e:\\volume\\public\\'+id+'\\1000\\'+filename+'" -o "'+'e:\\volume\\public\\'+id+'\\1000\\'+filename+'.mp4"', (err, data, stderr) => {
			console.log(stderr);
			console.log("Comando executado: "+'handbrakecli -Z "Gmail Medium 5 Minutes 480p30" -i "e:\\volume\\public\\'+id+'\\1000\\'+filename+'" -o "'+'e:\\volume\\public\\'+id+'\\1000\\'+filename+'.mp4"');
			fs.unlink("e:\\volume\\public\\"+id+"\\1000\\"+filename, (err) => {
				if (err) console.log('path/file.txt was not deleted');
			});
			fs.rename("e:\\volume\\public\\"+id+"\\1000\\"+filename+".mp4", "e:\\volume\\public\\"+id+"\\1000\\"+filename, function(err) {
				if ( err ) console.log('ERROR: ' + err);
			});
			var timestamp = Math.floor(new Date().getTime()/1000);
			console.log(timestamp);

			var request = require("request");

			var crypto = require("crypto");
			var nonce = crypto.randomBytes(20).toString('hex');
			var parametros={
				oauth_consumer_key: 'xxxxxx',//Trocar aqui
				oauth_token: 'xxxxxx',//Trocar aqui
				oauth_signature_method: 'HMAC-SHA1',
				oauth_timestamp: timestamp,
				oauth_nonce: nonce,
				oauth_version: '1.0'
			};
			var oauthSignature=require("oauth-signature");
			var assinatura = oauthSignature.generate("POST", "http://portal.torratorra.com.br/api/public/ecm/document/updateDescription", parametros, "minhaconsumersecret", "meutoken",{ encodeSignature: false});//Trocar meu token e minhaconsumer

			var options = {
				method: 'POST',
				url: 'http://portal.torratorra.com.br/api/public/ecm/document/updateDescription',
				qs:{
					oauth_consumer_key: 'xxxxxx',//Trocar aqui
					oauth_token: 'xxxxxxx',//Trocar aqui
					oauth_signature_method: 'HMAC-SHA1',
					oauth_timestamp: timestamp,
					oauth_nonce: nonce,
					oauth_version: '1.0',
					oauth_signature: assinatura
				},
				headers: {
					'cache-control': 'no-cache',
					'Cache-Control': 'no-cache',
					'Content-Type': 'application/json'
				},
				body: { 
					"id": id, 
					"description": "Convertido " + filename
				},
				json: true 
			};

			request(options, function (error, response, body) {
			  if (error) throw new Error(error);
			  console.log(body);
			});			
			res.json({ success: true, "Filename": filename,"Data":data});	
		});
	}else{
		res.json({ Error: "Parametro não foi enviado."})
	}
})

app.use('/', router);
app.listen(port);