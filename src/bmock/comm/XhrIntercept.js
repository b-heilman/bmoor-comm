(function(){
'use strict';

var bMoor,
	xHR;

if ( typeof window === 'undefined' ){
	require('bmoor');
	xHR = require('XMLHttpRequest');
}else{
	bMoor = window.bMoor;
	xHR = window.XMLHttpRequest;
}

bMoor.define( 'bmock.comm.XhrIntercept', 
	['bmoor.defer.Basic',
	function( Defer ){
		var expecting = [];

		return {
			enable : function(){
				window.XMLHttpRequest = function( options ){
					return {
						withCredentials : true,
						setRequestHeader : function(){},
						open : function( method, url, async, user, password ){
							// onreadystatechange
							// readystate -> 4

							// status
							// response
							// getAllResponseHeaders()
						},
						send : function( data ){
							var t;

							if ( expecting.length ){
								t = expecting.shift();

								this.readyState = 4;
								this.status = t.status || 200;
								this.responseType = 'json';
								this.response = t.response;
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
								throw new Error('I was not expecting anything');
							}
							
						}
					};
				};
			},
			disable : function(){
				window.XMLHttpRequest = xHR;
			},
			expect : function( ops ){
				expecting.push( ops );
			}
		};
	}]
);

}());