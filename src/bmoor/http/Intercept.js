(function(){
'use strict';

var XHR,
	xHrBridge,
	settings,
	bridge;

if ( typeof window !== 'undefined' ){
	XHR = window.XMLHttpRequest;
	window.XMLHttpRequest = function(){
		return bridge();
	};

	bMoor.make( 'bmoor.http.Intercept',
		['bmoor.defer.Basic', 'bmoor.http.Router',
		function( Defer, Router ){
			var expecting,
				intercepts;

			settings = {
				enable : function(){
					bridge = xHrBridge;
				},
				expect : function( ops ){
					if ( !expecting ){
						expecting = [];
					}
					expecting.push( ops );
				},
				routes : function( s ){
					intercepts = new Router(s);
				},
				router : function( router ){
					intercepts = router;
				}
			};

			return {
				wrap : XHR,
				construct : function( options ){
					this.$wrap( options );
				},
				statics : settings,
				properties : {
					open : function( method, url, async, user, password ){
						var info,
							t;

						this.intercept = null;
						if ( expecting && expecting.length ){
							this.intercept = expecting.shift();
						}else if ( intercepts ){
							this.intercept = intercepts.match( url );
						}

						this.$wrapped.open( method, url, async, user, password );
					},
					send : function( data ){
						var dis = this,
							intercept = this.intercept;

						if ( bMoor.isFunction(intercept) ){
							intercept = intercept( data );
						}

						if ( intercept ){
							this.status = intercept.status || 200;
							this.response = intercept.response;
							this.readyState = 4;
							this.responseType = intercept.responseType || 'json';
							
							this.getAllResponseHeaders = function(){
								return { some : 'header' };
							};

							/*
							if ( this.onreadystatechange ){
								this.onreadystatechange();
							}
							*/
							if ( this.onload ){
								this.onload();
							}
						}else{
							this.$wrapped.onload = function(){
								dis.status = this.status;
								dis.response = this.response;
								dis.readyState = this.readyState;
								dis.responseType = this.responseType;
								dis.responseText = this.responseText;

								dis.onload.apply( dis, arguments );
							};

							this.$wrapped.send( data );
						}
					}
				},
				finalize : function( Def ){
					bridge = function BridgeHolder( options ){
						return new XHR(options);
					};

					xHrBridge = function XhrBridge( options ){
						return new Def(options);
					};
				}
			};
		}]
	);
}

}());