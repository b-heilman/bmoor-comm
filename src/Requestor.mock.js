var Promise = require('es6-promise').Promise,
	Requestor = require('./Requestor.js');

class RequestorMock {
	enable(){
		this.callStack = [];

		Requestor.clearCache();
		Requestor.$settings.fetcher = ( url, ops ) => {
			var t,
				p;

			if ( this.callStack.length ){
				t = this.callStack.shift();

				expect( t.url ).toEqual( url );
				if ( t.params ){
					expect( t.params ).toEqual( ops.body );
				}

				p = Promise.resolve({
					json: function(){
						return t.res || 'OK';
					},
					status: t.code || 200
				});

				return p;
			}else{
				expect( 'callStack.length' ).toBe( 'not zero' );
			}
		};
	}

	expect( url, params ){
		var t = {
				url: url,
				params: params
			};

		this.callStack.push( t );

		return {
			respond: function( res, code ){
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