// TODO : this should become something like HttpBackend
bMoor.make('bmock.comm.Http', 
	['bmoor.defer.Basic',
	function( Basic ){
		
		function MockConnector(){
			this.expecting = [];

			if ( !(this instanceof MockConnector) ){
				return new MockConnector();
			}
		}

		return {
			construct : MockConnector,
			properties : {
				getConnector : function(){
					var dis = this,
						q = new Basic(),
						t;

					return function( request ){
						if ( dis.expecting.length ){
							t = dis.expecting.shift();
							
							expect( request.url ).toBe( t.url );
							expect( request.method.toUpperCase() ).toBe( t.method.toUpperCase() );

							if ( !t.code || t.code === 200 ){
								q.resolve({
									data : t.response,
									code : 200
								});
							}else{
								q.reject({
									message : t.response,
									code : t.code
								});
							}
						}else{
							expect( request.url ).toBeUndefined();
						}

						return q.promise;
					};
				},
				expect : function( method, url ){
					var req;

					if ( url === undefined ){
						url = method;
						method = 'GET';
					}

					req = {
						url : url,
						method : method,
						code : 200,
						response : {}
					};

					this.expecting.push( req );

					return {
						respond : function( code, response ){
							if ( response === undefined ){
								response = code;
								code = 200;
							}

							req.response = response;
							req.code = code;
						}
					};
				},
				hasMetExpectations : function(){
					expect( this.expecting.length ).toBe( 0 );
				}
			}
		};
	}]
);