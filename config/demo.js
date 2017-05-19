var comm,
	bmoorComm = require('../bmoor-comm.js'),
	Feed = bmoorComm.connect.Feed,
	Requestor = bmoorComm.Requestor;

Requestor.$settings.fetcher = function( url, options ){
	console.log( url, options );
	return fetch( url, options );
};

comm = new Feed({
	all: 'http://localhost:10001/test',
	create: 'http://localhost:10001/test-json',
	update: {
		url: 'http://localhost:10001/test-form/{{id}}',
		method: 'POST'
	},
	read: 'http://localhost:10001/test/{{id}}'
});

comm.all().then(
	function( res ){
		console.log( 'success', res );
	},
	function( err ){
		console.log( 'fail', err );
	}
);

comm.create({'foo':'bar'}).then(
	function( res ){
		console.log( 'success', res );
	},
	function( err ){
		console.log( 'fail', err );
	}
);

var f = new FormData();

f.set( 'hello', 'world' );

comm.update({id:1},f).then(
	function( res ){
		console.log( 'success', res );
	},
	function( err ){
		console.log( 'fail', err );
	}
);

module.exports = bmoorComm;
