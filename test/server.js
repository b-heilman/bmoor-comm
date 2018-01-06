var cors = require('cors'),
	multer = require('multer'),
	express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer( app ),
	router = express.Router(),
	content = [],
	bodyParser = require('body-parser');

var upload = multer();

router.use( cors() )
.use( bodyParser.json() )
.get('/test', function (req, res) {
	res.json(content);
})
.get('/test-many', function( req, res ){
	var rtn = [];

	req.query.test.forEach(function( v ){
		rtn.push({ id: parseInt(v,10) });
	});

	res.json( rtn );
})
.post('/test-json', function( req, res ){
	var id = Date.now(),
		ins = req.body;

	res.json({
		id : id,
		$sanity: ins
	})
})
.post('/test-form/:id', upload.array(), function( req, res ){
	var id = Date.now(),
		ins = req.body;

	res.json({
		id : id,
		$sanity: ins
	})
});

try{
	var routes,
		connector,
		mysql = require('./mysql.js'),
		Mysql = require('../src/connect/Mysql.js').Mysql,
		Router =  require('../src/connect/Router.js').Router,
		model = require('./model.js');

	model.execute = mysql.connect;
	connector = new Mysql(model);
	
	( new Router(connector) ).getRoutes().forEach(function( route ){
		function errorReport( res ){
			res.code(500);
			res.send('BOOM');

			return function( ex ){
				console.log( ex.message );
				console.log( ex );
			};
		}
		
		switch (route.method){
			case 'post':
				router.post( route.url, function( req, res ){
					route.fn( req.body ).then(function( result ){
						res.json( result );
					});
				}, errorReport);
				break;

			case 'patch':
				router.patch( route.url, function( req, res ){
					route.fn( req.params, req.body ).then(function( result ){
						res.json( result );
					});
				}, errorReport);
				break;

			case 'delete':
				router.delete( route.url, function( req, res ){
					route.fn( req.params ).then(function( result ){
						res.send( result );
					});
				}, errorReport);
				break;

			default: //get
				router.get( route.url, function( req, res ){
					route.fn( req.params, req.query ).then(function( result ){
						res.json( result );
					});
				}, errorReport);
		}
	});

	router.get('/env/router-kill', function( req, res ){
		mysql.close();
		res.send('OK');
	});

	console.log( '!!! router configured !!!' );
}catch( ex ){
	console.log( 'router test: '+ex.message );
}

app.use( router );
app.use(function(req, res){
	res.json({
		valid : false,
		message : 'Hi there, I think you want /ticker'
	});
});

// 10001
var listen;

module.exports = {
	start: function( port ){
		return new Promise(function( resolve ){
			console.log( 'server - starting '+port );
			listen = server.listen( port, function(){
				console.log( 'server - running' );
				resolve();
			});
		});
	},
	close: function( cb ){
		return new Promise(function( resolve ){
			console.log( 'server - stopping' );
			server.close(function(){
				console.log( 'server - stopped' );
				resolve()
			});
		});
	},
	restart: function(){
		return this.close().then( () => {
			return this.start();
		});
	}
};
