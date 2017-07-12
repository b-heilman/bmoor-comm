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

router.use( cors() );
router.use( bodyParser.json() );

router
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
		console.log( 'json', typeof(req.body), req.body );

		var id = Date.now(),
			ins = req.body;

		res.json({
			id : id,
			$sanity: ins
		})
	})
	.post('/test-form/:id', upload.array(), function( req, res ){
		console.log( 'update: ', req.params.id );
		console.log( 'form', typeof(req.body), req.body );

		var id = Date.now(),
			ins = req.body;

		res.json({
			id : id,
			$sanity: ins
		})
	});

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
