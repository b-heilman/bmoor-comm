var mysql = require('mysql'),
	pool = mysql.createPool(require('../config/mysql.js'));

module.exports = {
	connect: function( sql, params ){
		return new Promise(function(resolve, reject) {
			pool.query(sql, params, function (err, results) {
				if (err) {
					console.log('---error---');
					console.log( sql );
					console.log( JSON.stringify(params,null,4) );

					return reject(err);
				}

				return resolve(results);
			});
		});
	},
	close: function(){
		pool.end();
	}
};