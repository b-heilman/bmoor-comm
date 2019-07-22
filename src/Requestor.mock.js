
var Promise = require('es6-promise').Promise,
	Requestor = require('./Requestor.js');

class RequestorMock {
	enable(){
		this.callStack = [];

		Requestor.clearCache();
		Requestor.settings.fetcher = ( url, ops ) => {
			var t;

			if ( this.callStack.length ){
				t = this.callStack.shift();

				expect(t.url).toEqual(url);

				if (t.params){
					expect(t.params).toEqual(JSON.parse(ops.body));
				}

				if (t.other){
					Object.keys(t.other).forEach(function( key ){
						t.other[key](ops[key]);
					});
				}

				if (t.success){
					return Promise.resolve({
						json: function(){
							return t.res || 'OK';
						},
						status: t.code || 200
					});
				} else {
					const err = new Error(t.res || 'OK');
					err.status = t.code || 200;

					return Promise.reject(err);
				}
			}else{
				expect('callStack.length').toBe('not zero');
			}
		};
	}

	expect( url, params, other ){
		var t = {
				success: true,
				url: url,
				other: other,
				params: params
			};

		this.callStack.push( t );

		return {
			reject: function(err, code){
				t.success = false;
				t.res = err;
				t.code = code;
			},
			respond: function(res, code){
				t.res = res;
				t.code = code;
			}
		};
	}

	verifyWasFulfilled(){
		if ( this.callStack.length ){
			expect( this.callStack.length ).toBe( 0 );
		}
	}
} 

module.exports = RequestorMock;
